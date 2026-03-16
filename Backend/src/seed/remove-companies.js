import dotenv from "dotenv";
import mongoose from "mongoose";
import connectionDB from "../config/db.js";
import companyModel from "../models/company.model.js";
import jobModel from "../models/job.model.js";
import sourceModel from "../models/source.model.js";

dotenv.config();

const targets = process.argv
  .slice(2)
  .map((name) => name.trim())
  .filter(Boolean);

if (!targets.length) {
  console.log("Usage: node src/seed/remove-companies.js <CompanyName> [CompanyName...]");
  process.exit(0);
}

const normalizedTargets = targets.map((name) => name.toLowerCase());
const careerPagePatterns = [];

if (normalizedTargets.includes("google")) {
  careerPagePatterns.push(/google\.com\/about\/careers/i, /careers\.google\.com/i);
}

if (normalizedTargets.includes("microsoft")) {
  careerPagePatterns.push(/careers\.microsoft\.com/i, /apply\.careers\.microsoft\.com/i);
}

async function removeCompanies() {
  try {
    await connectionDB();

    const companies = await companyModel.find({ name: { $in: targets } });
    const companyIds = companies.map((company) => company._id);

    const jobResult = companyIds.length
      ? await jobModel.deleteMany({ companyId: { $in: companyIds } })
      : { deletedCount: 0 };

    const companyResult = companyIds.length
      ? await companyModel.deleteMany({ _id: { $in: companyIds } })
      : { deletedCount: 0 };

    const sourceFilters = [{ name: { $in: targets } }];
    careerPagePatterns.forEach((pattern) => sourceFilters.push({ careerPage: pattern }));

    const sourceResult = await sourceModel.deleteMany({ $or: sourceFilters });

    console.log(`Removed ${companyResult.deletedCount} companies.`);
    console.log(`Removed ${jobResult.deletedCount} jobs.`);
    console.log(`Removed ${sourceResult.deletedCount} sources.`);
  } catch (error) {
    console.error("Removal failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

removeCompanies();
