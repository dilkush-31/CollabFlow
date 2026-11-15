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
const getOverdueTasks = async (user) => {
  const [rows] = await pool.query(
    `SELECT t.id, t.title, t.priority, t.status,
            DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline,
            t.project_id, p.name AS project_name, u.name AS assignee_name
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     LEFT JOIN users u ON u.id = t.assigned_to
     WHERE t.status <> 'completed'
       AND t.deadline < CURDATE()
       AND (? = 'admin' OR t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?))
     ORDER BY t.deadline ASC
     LIMIT 20`,
    [user.role, user.id]
  );
  return rows;
};

const getProjectProgress = async (user) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.status,
            COUNT(t.id) AS total,
            COALESCE(SUM(t.status = 'completed'), 0) AS completed
     FROM projects p
     LEFT JOIN tasks t ON t.project_id = p.id
     WHERE (? = 'admin' OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?))
     GROUP BY p.id, p.name, p.status
     ORDER BY p.name`,
    [user.role, user.id]
  );

  return rows.map((row) => {
    const total = Number(row.total);
    const completed = Number(row.completed);
    return {
      id: row.id,
      name: row.name,
      status: row.status,
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
};

module.exports = { countProjects, countTasks, getOverdueTasks, getProjectProgress };

