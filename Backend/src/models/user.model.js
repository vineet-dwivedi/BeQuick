import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  googleSub: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userModel = mongoose.model("user", userSchema);
export default userModel;
