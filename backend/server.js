require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CollabFlow API is running" });
});

// Check the MySQL connection
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS db, 1 + 1 AS result");
    res.json({
      database: "connected",
      currentDb: rows[0].db,
      check: rows[0].result,
    });
  } catch (error) {
    res.status(500).json({
      database: "failed",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});