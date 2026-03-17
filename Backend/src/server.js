import "dotenv/config";
import app from "./app.js";
import connectionDB from "./config/db.js";

const PORT = process.env.PORT || 4000;

connectionDB();
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
