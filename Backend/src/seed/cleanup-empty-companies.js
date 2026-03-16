import mongoose from "mongoose";
import connectionDB from "../config/db.js";
import companyModel from "../models/company.model.js";
import jobModel from "../models/job.model.js";
import sourceModel from "../models/source.model.js";

async function cleanupEmptyCompanies() {
  try {
    await connectionDB();

    const companies = await companyModel.find().lean();
    const removed = [];

    for (const company of companies) {
      const count = await jobModel.countDocuments({ companyId: company._id });
      if (count > 0) continue;

      await companyModel.deleteOne({ _id: company._id });

      if (company.careerPage || company.name) {
        await sourceModel.deleteMany({
          $or: [
            company.careerPage ? { careerPage: company.careerPage } : null,
            company.name ? { name: company.name } : null
          ].filter(Boolean)
        });
      }

      removed.push(company.name);
    }

    console.log(`Removed ${removed.length} companies with 0 jobs.`);
    if (removed.length) {
      console.log(removed.join(", "));
    }
  } catch (error) {
    console.error("Cleanup failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupEmptyCompanies();
