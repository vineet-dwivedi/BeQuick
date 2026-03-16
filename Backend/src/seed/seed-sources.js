import mongoose from "mongoose";
import connectionDB from "../config/db.js";
import sourceModel from "../models/source.model.js";
import { sources } from "./seed-data.js";

async function seedSources() {
  try {
    await connectionDB();

    for (const source of sources) {
      await sourceModel.updateOne(
        { careerPage: source.careerPage },
        { $set: source },
        { upsert: true }
      );
    }

    console.log(`Seeded ${sources.length} sources.`);
  } catch (error) {
    console.error("Source seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedSources();
