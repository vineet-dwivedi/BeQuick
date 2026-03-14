import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        default: ""
    },
    location:{
        type: String,
        default: ""
    },
    employmentType:{
        type: String,
        enum: ["full-time", "part-time", "intern", "contract", "freelance"],
        default: "full-time"
    },
    experienceLevel:{
        type: String,
        enum: ["entry", "mid", "senior", "intern"],
        default: "entry"
    },
    remoteType:{
        type: String,
        enum: ["onsite", "hybrid", "remote"],
        default: "onsite"
    },
    stack:{
        type: [String],
        default: []
    },
    rawStack:{
        type: String,
        default: ""
    },
    jobUrl:{
        type: String,
        required: true,
        unique: true
    },
    postedDate:{
        type: Date
    },
    scrapedAt:{
        type: Date,
        default: Date.now
    }
})

const jobModel = mongoose.model("job",jobSchema);
export default jobModel;
