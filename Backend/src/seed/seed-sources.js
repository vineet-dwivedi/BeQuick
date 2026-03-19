import mongoose from "mongoose";
import connectionDB from "../config/db.js";
import sourceModel from "../models/source.model.js";
import companyModel from "../models/company.model.js";
import { sources } from "./seed-data.js";

function getCompanyType(tags = []) {
  return tags.includes("mnc") ? "MNC" : "other";
}

async function seedSources() {
  try {
    await connectionDB();

    for (const source of sources) {
      await sourceModel.updateOne(
        { careerPage: source.careerPage },
        { $set: source },
        { upsert: true }
      );

      await companyModel.updateOne(
        { name: source.name },
        {
          $set: {
            name: source.name,
            website: source.website || "",
            careerPage: source.careerPage || "",
            companyType: getCompanyType(source.tags || [])
          }
        },
        { upsert: true }
      );
    }

    console.log(`Seeded ${sources.length} sources and synced companies.`);
  } catch (error) {
    console.error("Source seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedSources();
