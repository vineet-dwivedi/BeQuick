import jobModel from "../models/job.model.js";
import searchLogModel from "../models/searchlog.model.js";

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

// Search jobs using a prompt.
export async function searchJobs(req, res) {
  try {
    const bodyPrompt = req.body?.prompt;
    const queryPrompt = req.query?.prompt;
    const prompt = typeof bodyPrompt === "string" ? bodyPrompt : queryPrompt;

    const finalPrompt =
      typeof prompt === "string" && prompt.trim().length > 0
        ? prompt
        : "MERN fresher India";

    const filters = extractFilters(finalPrompt);
    const query = {};

    // Convert filters into a MongoDB query.
    if (filters.stack) query.stack = { $in: filters.stack };
    if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
    if (filters.location) query.location = new RegExp(filters.location, "i");

    // Fetch matching jobs with company info.
    const results = await jobModel
      .find(query)
      .populate("companyId", "name careerPage website")
      .sort({ postedDate: -1 })
      .limit(50)
      .lean();

    const enrichedResults = results.map((job) => ({
      ...job,
      companyName: job.companyId?.name || "Company",
      companyCareerPage: job.companyId?.careerPage || "",
      companyWebsite: job.companyId?.website || ""
    }));

    // Save the search for analytics.
    await searchLogModel.create({
      prompt: finalPrompt,
      filters
    });

    return res.json({
      prompt: finalPrompt,
      filters,
      count: enrichedResults.length,
      results: enrichedResults
    });
  } catch (error) {
    return res.status(500).json({ error: "Search failed" });
  }
}
