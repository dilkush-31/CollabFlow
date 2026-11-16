require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { initSocket } = require("./sockets");
const { checkDeadlines } = require("./services/deadlineService");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CollabFlow API is running" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS db, 1 + 1 AS result");
    res.json({ database: "connected", currentDb: rows[0].db, check: rows[0].result });
  } catch (error) {
    res.status(500).json({ database: "failed", error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body is not valid JSON" });
  }
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// Wrap Express in a plain HTTP server so Socket.IO can share the same port
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Check deadlines on startup, then every hour
  checkDeadlines().catch((err) => console.error("Deadline check failed:", err.message));
  setInterval(() => {
    checkDeadlines().catch((err) => console.error("Deadline check failed:", err.message));
  }, 60 * 60 * 1000);
});