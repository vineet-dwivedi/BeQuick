import mongoose from "mongoose";
import connectionDB from "../config/db.js";
import companyModel from "../models/company.model.js";
import jobModel from "../models/job.model.js";
import { companies, jobs } from "./seed-data.js";

async function seed() {
  try {
    await connectionDB();

    // Clear old data first.
    await jobModel.deleteMany({});
    await companyModel.deleteMany({});

    // Insert companies and keep a map of key -> id.
    const companyDocs = await companyModel.insertMany(
      companies.map(({ key, ...rest }) => rest)
    );

    const companyIdByKey = {};
    companies.forEach((company, index) => {
      companyIdByKey[company.key] = companyDocs[index]._id;
    });

    // Insert jobs with the correct companyId.
    const jobDocs = jobs.map(({ companyKey, ...rest }) => ({
      ...rest,
      companyId: companyIdByKey[companyKey]
    }));

    await jobModel.insertMany(jobDocs);

    console.log(`Seeded ${companyDocs.length} companies and ${jobDocs.length} jobs.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
