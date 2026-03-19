import jobModel from "../models/job.model.js";
import searchLogModel from "../models/searchlog.model.js";
import companyModel from "../models/company.model.js";
import { parsePromptWithGemini } from "../services/gemini.service.js";
import {
  combineMongoQueries,
  getSoftwareEngineeringQuery
} from "../utils/software-role.utils.js";

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

function looksLikeSoftwareRoleSearch(prompt = "", filters = {}) {
  if (filters.stack?.length || filters.experienceLevel || filters.location) {
    return true;
  }

  return /\b(software|engineer|developer|frontend|front end|backend|back end|full stack|fullstack|react|node|express|mongo|devops|platform|mobile|ios|android|web|cloud|java|python|go|rust|intern|sre)\b/i.test(
    prompt
  );
}

function getPriorityCompanyNames() {
  const raw = process.env.PRIORITY_COMPANIES;
  if (!raw) {
    return [
      "Amazon",
      "Deloitte",
      "EY",
      "KPMG",
      "PwC",
      "Google",
      "Microsoft",
      "Accenture",
      "Paychex",
      "HCLTech",
      "JPMorgan Chase",
      "LinkedIn",
      "Cloudflare",
      "Palantir",
      "Canonical",
      "Zscaler",
      "Smartsheet",
      "Speechify",
      "BitGo",
      "Level AI",
      "Dun & Bradstreet",
      "Appspace",
      "Anaplan",
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
    if (!normalizedName) return false;

    const pattern = new RegExp(`(^| )${escapeRegex(normalizedName)}($| )`, "i");
    if (pattern.test(normalizedPrompt)) {
      return true;
    }

    return normalizedPrompt.length >= 3 && normalizedName.startsWith(normalizedPrompt);
  });
}

async function loadPriorityCompanies() {
  const names = getPriorityCompanyNames();
  if (names.length === 0) return [];

  const orFilters = names.map((name) => ({
    name: new RegExp(`^${escapeRegex(name)}$`, "i")
  }));

  const companies = await companyModel.find({ $or: orFilters }, "name").lean();
  const byName = new Map(companies.map((company) => [normalizeText(company.name), company]));

  return names
    .map((name) => byName.get(normalizeText(name)))
    .filter(Boolean);
}

function buildPriorityRankExpression(priorityCompanies = []) {
  if (!priorityCompanies.length) {
    return null;
  }

  return {
    $switch: {
      branches: priorityCompanies.map((company, index) => ({
        case: { $eq: ["$companyId", company._id] },
        then: index
      })),
      default: priorityCompanies.length
    }
  };
}

// Search jobs using a prompt.
export async function searchJobs(req, res) {
  try {
    const bodyPrompt = req.body?.prompt;
    const queryPrompt = req.query?.prompt;
    const prompt = typeof bodyPrompt === "string" ? bodyPrompt : queryPrompt;

    const promptProvided = typeof prompt === "string" && prompt.trim().length > 0;
    const finalPrompt = promptProvided ? prompt : "software engineer";

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
    const matchedCompanies = allJobsQuery ? [] : await findCompanyMatches(finalPrompt);
    const companyOnlyPrompt =
      !allJobsQuery && !looksLikeSoftwareRoleSearch(finalPrompt, filters);
    const softwareOnlyQuery = getSoftwareEngineeringQuery();
    const broadSearch = matchedCompanies.length === 0;
    const priorityCompanies = broadSearch ? await loadPriorityCompanies() : [];

    if (companyOnlyPrompt && matchedCompanies.length === 0) {
      await searchLogModel.create({
        prompt: finalPrompt,
        filters: {
          ...filters,
          company: [finalPrompt.trim()]
        }
      });

      return res.json({
        prompt: finalPrompt,
        filters: {
          ...filters,
          company: [finalPrompt.trim()]
        },
        matchedCompanies: [],
        emptyState: {
          type: "company",
          companyNames: [finalPrompt.trim()],
          message: `No jobs found for ${finalPrompt.trim()} for now.`
        },
        relaxed: null,
        includeRemote,
        allJobs: false,
        page,
        limit,
        total: 0,
        count: 0,
        results: []
      });
    }

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
      const combinedQuery = combineMongoQueries(mongoQuery, softwareOnlyQuery);
      const priorityRank = buildPriorityRankExpression(priorityCompanies);

      if (!priorityRank) {
        return jobModel
          .find(combinedQuery)
          .populate("companyId", "name careerPage website")
          .sort({ postedDate: -1, scrapedAt: -1 })
          .skip(skipValue)
          .limit(limitValue)
          .lean();
      }

      return jobModel.aggregate([
        { $match: combinedQuery },
        {
          $addFields: {
            companyPriorityRank: priorityRank
          }
        },
        {
          $sort: {
            companyPriorityRank: 1,
            postedDate: -1,
            scrapedAt: -1,
            _id: 1
          }
        },
        { $skip: skipValue },
        { $limit: limitValue },
        {
          $lookup: {
            from: companyModel.collection.name,
            localField: "companyId",
            foreignField: "_id",
            as: "company"
          }
        },
        {
          $unwind: {
            path: "$company",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            companyName: { $ifNull: ["$company.name", "Company"] },
            companyCareerPage: { $ifNull: ["$company.careerPage", ""] },
            companyWebsite: { $ifNull: ["$company.website", ""] }
          }
        },
        {
          $project: {
            company: 0,
            companyPriorityRank: 0
          }
        }
      ]);
    };

    // Fetch matching jobs with company info.
    let results = await runQuery(query);
    const relaxedFilters = [];
    const allowRelax = !allJobsQuery;
    let finalQuery = { ...query };

    // If nothing matched, relax location first, then experience.
    if (results.length === 0 && filters.location && allowRelax) {
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

    let enrichedResults = results.map((job) => ({
      ...job,
      companyName: job.companyName || job.companyId?.name || "Company",
      companyCareerPage: job.companyCareerPage || job.companyId?.careerPage || "",
      companyWebsite: job.companyWebsite || job.companyId?.website || ""
    }));

    // Save the search for analytics.
    await searchLogModel.create({
      prompt: finalPrompt,
      filters
    });

    const total = await jobModel.countDocuments(
      combineMongoQueries(finalQuery, softwareOnlyQuery)
    );
    const matchedCompanyNames = matchedCompanies.map((company) => company.name);
    const emptyState =
      matchedCompanyNames.length > 0 && total === 0
        ? {
            type: "company",
            companyNames: matchedCompanyNames,
            message: `No jobs found for ${matchedCompanyNames.join(", ")} for now.`
          }
        : null;

    return res.json({
      prompt: finalPrompt,
      filters,
      matchedCompanies: matchedCompanyNames,
      emptyState,
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
