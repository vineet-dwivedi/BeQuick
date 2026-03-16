import mongoose from "mongoose";

// Sources are the list of places we crawl for jobs.
const sourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    default: ""
  },
  careerPage: {
    type: String,
    default: ""
  },
  sourceType: {
    type: String,
    enum: ["company", "job-board", "directory", "other"],
    default: "company"
  },
  region: {
    type: String,
    default: ""
  },
  tags: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  },
  lastCrawledAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const sourceModel = mongoose.model("source", sourceSchema);
export default sourceModel;
