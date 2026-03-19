import jobModel from "../models/job.model.js";
import {
  combineMongoQueries,
  getSoftwareEngineeringQuery
} from "../utils/software-role.utils.js";

// Get a list of jobs. Optional filters via query params.
export async function getJobs(req, res) {
  try {
    const filters = {};
    const query = req.validatedQuery || req.query;

    if (query.stack) filters.stack = query.stack;
    if (query.location) filters.location = new RegExp(query.location, "i");
    if (query.experienceLevel) filters.experienceLevel = query.experienceLevel;
    if (query.companyId) filters.companyId = query.companyId;
    if (query.remoteType) filters.remoteType = query.remoteType;
    if (query.q) {
      const keyword = new RegExp(query.q, "i");
      filters.$or = [{ title: keyword }, { description: keyword }];
    }

    // Limit results to avoid huge responses.
    const limit = Math.min(Number(query.limit || 50), 200);
    const page = Math.max(Number(query.page || 1), 1);
    const skip = (page - 1) * limit;
    const mongoQuery = combineMongoQueries(filters, getSoftwareEngineeringQuery());

    const [jobs, total] = await Promise.all([
      jobModel.find(mongoQuery).sort({ postedDate: -1 }).skip(skip).limit(limit).lean(),
      jobModel.countDocuments(mongoQuery)
    ]);

    return res.json({
      count: jobs.length,
      total,
      page,
      limit,
      jobs
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

// Get a single job by id.
export async function getJobById(req, res) {
  try {
    const job = await jobModel.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({ job });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch job" });
  }
}
