import dotenv from "dotenv";
import app from "./app.js";
import connectionDB from "./config/db.js";
dotenv.config();

const PORT = process.env.PORT || 4000;

connectionDB();
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
