const pool = require("../config/db");

const getTasksByProject = async (projectId) => {
  const [rows] = await pool.query(
    `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
            DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline,
            t.assigned_to, u.name AS assignee_name, t.created_at
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assigned_to
     WHERE t.project_id = ?
     ORDER BY t.created_at DESC`,
    [projectId]
  );
  return rows;
};

const findTaskById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
  return rows[0] || null;
};

const createTask = async ({ projectId, title, description, priority, deadline, assignedTo, createdBy }) => {
  const [result] = await pool.query(
    `INSERT INTO tasks (project_id, title, description, priority, deadline, assigned_to, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [projectId, title, description || null, priority, deadline || null, assignedTo || null, createdBy]
  );
  return result.insertId;
};

// Only the fields passed in `fields` are updated
const updateTask = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => fields[key]);
  await pool.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, id]);
};

module.exports = { getTasksByProject, findTaskById, createTask, updateTask };