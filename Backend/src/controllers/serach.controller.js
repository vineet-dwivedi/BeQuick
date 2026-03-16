import jobModel from "../models/job.model.js";
import searchLogModel from "../models/searchlog.model.js";
import companyModel from "../models/company.model.js";
import { parsePromptWithGemini } from "../services/gemini.service.js";

// Very simple prompt parser (no AI yet).
function extractFilters(prompt = "") {
  const text = prompt.toLowerCase();
  const stack = [];

  if (text.includes("mern")) stack.push("MERN");
  if (text.includes("react")) stack.push("React");
  if (text.includes("node")) stack.push("Node.js");
  if (text.includes("express")) stack.push("Express.js");
  if (text.includes("mongo")) stack.push("MongoDB");

  let experienceLevel = null;
  if (text.includes("fresher") || text.includes("entry")) experienceLevel = "entry";
  if (text.includes("intern")) experienceLevel = "intern";

  let companyType = null;
  if (text.includes("mnc")) companyType = "MNC";
  if (text.includes("startup")) companyType = "startup";

  let location = null;
  if (text.includes("india")) location = "India";

  return {
    stack: stack.length ? stack : null,
    experienceLevel,
    companyType,
    location
  };
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
  }
  return false;
}

function normalizeText(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPriorityCompanyNames() {
  const raw = process.env.PRIORITY_COMPANIES;
  if (!raw) {
    return [
      "Amazon",
      "LinkedIn",
      "BitGo",
      "Smartsheet",
      "Speechify",
      "Dun & Bradstreet",
      "Level AI",
      "Peacock India"
    ];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isAllJobsQuery(promptText = "") {
  const normalized = normalizeText(promptText);
  if (!normalized) return false;

  return (
    normalized.includes("all jobs") ||
    normalized.includes("every job") ||
    normalized.includes("all openings") ||
    normalized.includes("all roles") ||
    normalized.includes("show all jobs")
  );
}

async function findCompanyMatches(promptText) {
  const normalizedPrompt = normalizeText(promptText);
  if (!normalizedPrompt) return [];

  const companies = await companyModel.find({}, "name").lean();
  return companies.filter((company) => {
    const normalizedName = normalizeText(company.name);
    if (!normalizedName || normalizedName.length < 3) return false;
    return normalizedPrompt.includes(normalizedName);
  });
}

async function loadPriorityCompanies() {
  const names = getPriorityCompanyNames();
  if (names.length === 0) return [];

  const orFilters = names.map((name) => ({
    name: new RegExp(`^${escapeRegex(name)}$`, "i")
  }));

  return companyModel.find({ $or: orFilters }, "name").lean();
}

// Search jobs using a prompt.
export async function searchJobs(req, res) {
  try {
    const bodyPrompt = req.body?.prompt;
    const queryPrompt = req.query?.prompt;
    const prompt = typeof bodyPrompt === "string" ? bodyPrompt : queryPrompt;

    const promptProvided = typeof prompt === "string" && prompt.trim().length > 0;
    const finalPrompt = promptProvided ? prompt : "MERN fresher India";

    const includeRemote = parseBoolean(req.body?.includeRemote ?? req.query?.includeRemote);
    const rawLimit = req.body?.limit ?? req.query?.limit;
    const rawPage = req.body?.page ?? req.query?.page;
    const limit = Math.min(Number(rawLimit || 20), 200);
    const page = Math.max(Number(rawPage || 1), 1);
    const skip = (page - 1) * limit;

    const allJobsQuery = isAllJobsQuery(finalPrompt);
    let filters = allJobsQuery
      ? {
          stack: null,
          experienceLevel: null,
          companyType: null,
          location: null
        }
      : extractFilters(finalPrompt);

    if (process.env.GEMINI_API_KEY) {
      try {
        if (!allJobsQuery) {
          const aiFilters = await parsePromptWithGemini(finalPrompt);
          filters = {
            stack: aiFilters.stack?.length ? aiFilters.stack : filters.stack,
            experienceLevel: aiFilters.experienceLevel
              ? aiFilters.experienceLevel
              : filters.experienceLevel,
            companyType: aiFilters.companyType ? aiFilters.companyType : filters.companyType,
            location: aiFilters.location ? aiFilters.location : filters.location
          };
        }
      } catch (error) {
        // If Gemini fails, keep the simple rule-based filters.
      }
    }
    const query = {};
    const [matchedCompanies, priorityCompanies] = await Promise.all([
      allJobsQuery ? Promise.resolve([]) : findCompanyMatches(finalPrompt),
      loadPriorityCompanies()
    ]);
    const priorityCompanyIds = new Set(
      priorityCompanies.map((company) => company._id.toString())
    );

    // Convert filters into a MongoDB query.
    if (filters.stack) query.stack = { $in: filters.stack };
    if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
    if (filters.location) {
      if (includeRemote) {
        query.$or = [
          { location: new RegExp(filters.location, "i") },
          { remoteType: "remote" }
        ];
      } else {
        query.location = new RegExp(filters.location, "i");
      }
    }
    if (matchedCompanies.length) {
      query.companyId = { $in: matchedCompanies.map((company) => company._id) };
      filters.company = matchedCompanies.map((company) => company.name);
    }

    const runQuery = async (mongoQuery, options = {}) => {
      const skipValue = Number.isFinite(options.skip) ? options.skip : skip;
      const limitValue = Number.isFinite(options.limit) ? options.limit : limit;

      return jobModel
        .find(mongoQuery)
        .populate("companyId", "name careerPage website")
        .sort({ postedDate: -1 })
        .skip(skipValue)
        .limit(limitValue)
        .lean();
    };

    // Fetch matching jobs with company info.
    let results = await runQuery(query);
    const relaxedFilters = [];
    const allowRelax = !allJobsQuery;
    let finalQuery = { ...query };

    // If nothing matched, relax location first, then experience.
    if (results.length === 0 && query.location && allowRelax) {
      const relaxedQuery = { ...query };
      delete relaxedQuery.location;
      if (relaxedQuery.$or) delete relaxedQuery.$or;
      results = await runQuery(relaxedQuery);
      if (results.length > 0) relaxedFilters.push("location");
      finalQuery = relaxedQuery;
    }

    if (results.length === 0 && query.experienceLevel && allowRelax) {
      const relaxedQuery = { ...query };
      delete relaxedQuery.experienceLevel;
      results = await runQuery(relaxedQuery);
      if (results.length > 0) relaxedFilters.push("experienceLevel");
      finalQuery = relaxedQuery;
    }

    if (results.length === 0 && priorityCompanies.length > 0 && !allJobsQuery) {
      const priorityQuery = { companyId: { $in: priorityCompanies.map((c) => c._id) } };
      results = await runQuery(priorityQuery);
      if (results.length > 0) relaxedFilters.push("priorityCompanies");
      finalQuery = priorityQuery;
    }

    let enrichedResults = results.map((job) => ({
      ...job,
      companyName: job.companyId?.name || "Company",
      companyCareerPage: job.companyId?.careerPage || "",
      companyWebsite: job.companyId?.website || ""
    }));

    if (priorityCompanyIds.size > 0 && page === 1 && !allJobsQuery) {
      const priorityLimit = Math.min(limit, 10);
      const priorityResults = await runQuery(
        { companyId: { $in: priorityCompanies.map((company) => company._id) } },
        { skip: 0, limit: priorityLimit }
      );

      const priorityEnriched = priorityResults.map((job) => ({
        ...job,
        companyName: job.companyId?.name || "Company",
        companyCareerPage: job.companyId?.careerPage || "",
        companyWebsite: job.companyId?.website || ""
      }));

      const seen = new Set();
      const merged = [];

      for (const job of [...priorityEnriched, ...enrichedResults]) {
        const key = job._id?.toString?.() || job.jobUrl;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(job);
      }

      enrichedResults = merged.slice(0, limit);
    }

    if (priorityCompanyIds.size > 0 && enrichedResults.length > 1 && !allJobsQuery) {
      enrichedResults.sort((a, b) => {
        const aPriority = priorityCompanyIds.has(a.companyId?._id?.toString?.());
        const bPriority = priorityCompanyIds.has(b.companyId?._id?.toString?.());
        if (aPriority === bPriority) return 0;
        return aPriority ? -1 : 1;
      });
    }

    // Save the search for analytics.
    await searchLogModel.create({
      prompt: finalPrompt,
      filters
    });

    const total = await jobModel.countDocuments(finalQuery);

    return res.json({
      prompt: finalPrompt,
      filters,
      relaxed: relaxedFilters.length ? relaxedFilters : null,
      includeRemote,
      allJobs: allJobsQuery,
      page,
      limit,
      total,
      count: enrichedResults.length,
      results: enrichedResults
    });
  } catch (error) {
    return res.status(500).json({ error: "Search failed" });
  }
}
