const pool = require("../config/db");

const countProjects = async (user) => {
  if (user.role === "admin") {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM projects");
    return Number(rows[0].total);
  }

  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM project_members WHERE user_id = ?",
    [user.id]
  );
  return Number(rows[0].total);
};

const countTasks = async (user) => {
  const isAdmin = user.role === "admin";

  const sql = `
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(t.status <> 'completed'), 0) AS pending,
      COALESCE(SUM(t.status = 'completed'), 0) AS completed,
      COALESCE(SUM(t.status <> 'completed' AND t.deadline IS NOT NULL AND t.deadline < CURDATE()), 0) AS overdue
    FROM tasks t
    ${isAdmin ? "" : "WHERE t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)"}
  `;

  const params = isAdmin ? [] : [user.id];
  const [rows] = await pool.query(sql, params);
  const row = rows[0];

  return {
    total: Number(row.total),
    pending: Number(row.pending),
    completed: Number(row.completed),
    overdue: Number(row.overdue),
  };
};

module.exports = { countProjects, countTasks };