import mongoose from "mongoose";

const techSchema = new mongoose.Schema({
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    technology:{
        type: String,
        required: true,
        trim: true
    },
    confidenceScore:{
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
    },
    source:{
        type: String,
        enum: ["job_description", "github", "manual"],
        default: "manual"
    }
})

const techModel = mongoose.model("tech",techSchema);
export default techModel;
