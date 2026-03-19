import dotenv from "dotenv";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import connectionDB from "../config/db.js";
import { createRedisConnection } from "../queue/connection.js";
import { crawlJobsFromSource } from "../crawlers/jobs.crawler.js";
import jobModel from "../models/job.model.js";
import companyModel from "../models/company.model.js";
import sourceModel from "../models/source.model.js";
import { classifyJobWithGemini } from "../services/gemini.service.js";
import { isSoftwareEngineeringJob } from "../utils/software-role.utils.js";

dotenv.config();

const connection = createRedisConnection();

function detectStackFromText(text = "") {
  const lower = text.toLowerCase();
  const stack = [];
  if (lower.includes("react")) stack.push("React");
  if (lower.includes("node")) stack.push("Node.js");
  if (lower.includes("express")) stack.push("Express.js");
  if (lower.includes("mongo")) stack.push("MongoDB");
  if (stack.length === 4) stack.unshift("MERN");
  return stack;
}

function detectExperienceLevel(text = "") {
  const lower = text.toLowerCase();

  if (lower.includes("intern")) return "intern";
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("principal") || lower.includes("staff")) {
    return "senior";
  }

  const yearsMatch = lower.match(/(\d+)\s*\+?\s*(?:years|yrs)/);
  if (yearsMatch) {
    const years = Number.parseInt(yearsMatch[1], 10);
    if (years <= 1) return "entry";
    if (years <= 3) return "mid";
    return "senior";
  }

  if (lower.includes("entry") || lower.includes("junior")) return "entry";
  if (lower.includes("mid-level") || lower.includes("mid level")) return "mid";

  return "unspecified";
}

async function upsertJob(companyId, job) {
  const stack = job.stack?.length ? job.stack : detectStackFromText(job.description || "");
  const experienceLevel =
    job.experienceLevel || detectExperienceLevel(job.description || job.title || "");

  await jobModel.updateOne(
    { jobUrl: job.jobUrl },
    {
      $set: {
        companyId,
        title: job.title,
        description: job.description || "",
        location: job.location || "",
        employmentType: job.employmentType || "full-time",
        experienceLevel,
        remoteType: job.remoteType || "onsite",
        stack,
        rawStack: job.rawStack || stack.join(", "),
        postedDate: job.postedDate || null,
        scrapedAt: new Date()
      }
    },
    { upsert: true }
  );
}

function guessCompanyName(url, fallback = "Company") {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    const base = host.split(".")[0] || fallback;
    return base.replace(/-/g, " ");
  } catch {
    return fallback;
  }
}

async function resolveCompanyId({ companyId, careerPage, companyName, website }) {
  if (companyId) return companyId;

  const candidates = [
    careerPage ? { careerPage } : null,
    website ? { website } : null,
    companyName ? { name: companyName } : null
  ].filter(Boolean);

  if (candidates.length) {
    const existing = await companyModel.findOne({ $or: candidates });
    if (existing) return existing._id;
  }

  const created = await companyModel.create({
    name: companyName || guessCompanyName(careerPage),
    website: website || "",
    careerPage: careerPage || "",
    companyType: "other"
  });

  return created._id;
}

async function processCompany(job) {
  const { companyId, careerPage, companyName, website, sourceId } = job.data;
  if (!careerPage) return;

  const resolvedCompanyId = await resolveCompanyId({
    companyId,
    careerPage,
    companyName,
    website
  });

  const scrapedJobs = await crawlJobsFromSource(careerPage);

  for (const scraped of scrapedJobs) {
    let enriched = { ...scraped };

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = await classifyJobWithGemini(scraped.description || scraped.title || "");
        enriched = {
          ...enriched,
          stack: ai.stack?.length ? ai.stack : enriched.stack,
          experienceLevel: ai.experienceLevel || enriched.experienceLevel,
          role: ai.role || undefined
        };
      } catch {
        // Keep fallback values if Gemini fails.
      }
    }

    if (!isSoftwareEngineeringJob(enriched)) {
      continue;
    }

    await upsertJob(resolvedCompanyId, enriched);
  }

  if (sourceId) {
    await sourceModel.findByIdAndUpdate(sourceId, { lastCrawledAt: new Date() });
  }
}

async function start() {
  await connectionDB();

  const worker = new Worker(
    "crawl-queue",
    async (job) => {
      await processCompany(job);
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`Crawl complete: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Crawl failed: ${job?.id}`, err?.message);
  });
}

start().catch((err) => {
  console.error("Worker failed:", err.message);
  mongoose.disconnect();
});
