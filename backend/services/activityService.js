const pool = require("../config/db");
const { emitToProject } = require("../sockets");

const logActivity = async ({ projectId, userId, action, details = null }) => {
  const [result] = await pool.query(
    "INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)",
    [projectId, userId, action, details]
  );

  const [rows] = await pool.query(
    `SELECT a.id, a.project_id, a.action, a.details, a.created_at, u.name AS user_name
     FROM activity_logs a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = ?`,
    [result.insertId]
  );

  emitToProject(projectId, "activity:new", rows[0]);
  return rows[0];
};

module.exports = { logActivity };