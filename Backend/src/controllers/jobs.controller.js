import jobModel from "../models/job.model.js";

// Get a list of jobs. Optional filters via query params.
export async function getJobs(req, res) {
  try {
    const filters = {};

    if (req.query.stack) filters.stack = req.query.stack;
    if (req.query.location) filters.location = new RegExp(req.query.location, "i");
    if (req.query.experienceLevel) filters.experienceLevel = req.query.experienceLevel;
    if (req.query.companyId) filters.companyId = req.query.companyId;
    if (req.query.remoteType) filters.remoteType = req.query.remoteType;

    // Limit results to avoid huge responses.
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const jobs = await jobModel.find(filters).sort({ postedDate: -1 }).limit(limit);

    return res.json({
      count: jobs.length,
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
