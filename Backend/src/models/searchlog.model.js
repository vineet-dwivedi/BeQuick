import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema({
    prompt:{
        type: String,
        required: true
    },
    filters:{
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

const searchLogModel = mongoose.model("search",searchLogSchema);
export default searchLogModel;
