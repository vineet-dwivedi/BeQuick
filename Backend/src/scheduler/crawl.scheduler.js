import dotenv from "dotenv";
import cron from "node-cron";
import mongoose from "mongoose";
import connectionDB from "../config/db.js";
import companyModel from "../models/company.model.js";
import sourceModel from "../models/source.model.js";
import { crawlQueue } from "../queue/crawl.queue.js";

dotenv.config();

const CRON_SCHEDULE = process.env.CRAWL_CRON || "0 2 * * *";
const CRON_TIMEZONE = process.env.CRAWL_TIMEZONE || "Asia/Kolkata";
const SCHEDULER_ENABLED = process.env.SCHEDULER_ENABLED !== "false";

const ensureDb = async () => {
  if (mongoose.connection.readyState === 1) return;
  await connectionDB();
};

async function enqueueCompanies() {
  await ensureDb();
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
  enqueueCompanies()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Scheduler run failed:", error);
      process.exit(1);
    });
} else if (SCHEDULER_ENABLED) {
  if (!cron.validate(CRON_SCHEDULE)) {
    console.warn(
      `Invalid CRAWL_CRON "${CRON_SCHEDULE}". Scheduler will not start until it is fixed.`
    );
  } else {
    cron.schedule(
      CRON_SCHEDULE,
      () => {
        enqueueCompanies().catch((error) => {
          console.error("Scheduled crawl failed:", error);
        });
      },
      { timezone: CRON_TIMEZONE }
    );
    console.log(`Daily crawl scheduled: ${CRON_SCHEDULE} (${CRON_TIMEZONE})`);
  }
}
