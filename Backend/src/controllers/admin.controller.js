import companyModel from "../models/company.model.js";
import sourceModel from "../models/source.model.js";
import { crawlQueue } from "../queue/crawl.queue.js";

export async function runCrawlNow(req, res) {
  try {
    const companies = await companyModel.find({ careerPage: { $ne: "" } }).lean();
    const sources = await sourceModel
      .find({ active: true, careerPage: { $ne: "" } })
      .lean();

    const seenCareerPages = new Set();
    const tasks = [];

    for (const source of sources) {
      if (!source.careerPage) continue;
      const key = source.careerPage.trim();
      if (seenCareerPages.has(key)) continue;

      const company = await companyModel.findOne({
        $or: [
          { careerPage: source.careerPage },
          source.website ? { website: source.website } : null,
          source.name ? { name: source.name } : null
        ].filter(Boolean)
      });

      tasks.push({
        sourceId: source._id,
        companyId: company?._id,
        careerPage: source.careerPage,
        companyName: source.name,
        website: source.website
      });

      seenCareerPages.add(key);
    }

    for (const company of companies) {
      if (!company.careerPage) continue;
      const key = company.careerPage.trim();
      if (seenCareerPages.has(key)) continue;

      tasks.push({
        companyId: company._id,
        careerPage: company.careerPage,
        companyName: company.name,
        website: company.website
      });

      seenCareerPages.add(key);
    }

    for (const task of tasks) {
      await crawlQueue.add("crawl-company", task);
    }

    return res.json({ queued: tasks.length });
  } catch (error) {
    return res.status(500).json({ error: "Failed to enqueue crawl" });
  }
}
