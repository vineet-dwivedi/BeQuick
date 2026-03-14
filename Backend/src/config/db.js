import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectionDB() {
    await mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connected To DB")
    })
}

export default connectionDB;
