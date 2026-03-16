import dotenv from "dotenv";
import cron from "node-cron";
import connectionDB from "../config/db.js";
import companyModel from "../models/company.model.js";
import sourceModel from "../models/source.model.js";
import { crawlQueue } from "../queue/crawl.queue.js";

dotenv.config();

async function enqueueCompanies() {
  await connectionDB();
  const companies = await companyModel.find({ careerPage: { $ne: "" } }).lean();
  const sources = await sourceModel.find({ active: true, careerPage: { $ne: "" } }).lean();
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

  console.log(`Queued ${tasks.length} sources for crawling.`);
}

const runOnce = process.env.RUN_ONCE === "true" || process.argv.includes("--once");

if (runOnce) {
  enqueueCompanies().then(() => process.exit(0));
} else {
  cron.schedule("0 2 * * *", () => {
    enqueueCompanies();
  });
}
