import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    website:{
        type: String,
        default: ""
    },
    careerPage:{
        type: String,
        default: ""
    },
    industry:{
        type: String,
        default: ""
    },
    size:{
        type: String,
        default: ""
    },
    headquartersLocation:{
        type: String,
        default: ""
    },
    companyType:{
        type: String,
        enum: ["MNC", "startup", "other"],
        default: "other"
    },
    techStack:{
        type: [String],
        default: []
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

const companyModel = mongoose.model("company",companySchema);
export default companyModel;
