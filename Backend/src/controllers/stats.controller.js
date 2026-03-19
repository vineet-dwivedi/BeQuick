import companyModel from "../models/company.model.js";
import jobModel from "../models/job.model.js";
import sourceModel from "../models/source.model.js";
import { getSoftwareEngineeringQuery } from "../utils/software-role.utils.js";

export async function getStats(req, res) {
  try {
    const softwareJobsQuery = getSoftwareEngineeringQuery();
    const [companies, jobs, sources, lastJob, lastSource] = await Promise.all([
      companyModel.countDocuments(),
      jobModel.countDocuments(softwareJobsQuery),
      sourceModel.countDocuments(),
      jobModel.findOne(softwareJobsQuery).sort({ scrapedAt: -1 }).select("scrapedAt").lean(),
      sourceModel.findOne().sort({ lastCrawledAt: -1 }).select("lastCrawledAt").lean()
    ]);

    return res.json({
      companies,
      jobs,
      sources,
      lastJobScrapedAt: lastJob?.scrapedAt || null,
      lastSourceCrawledAt: lastSource?.lastCrawledAt || null
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load stats" });
  }
}
