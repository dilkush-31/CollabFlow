const pool = require("../config/db");

const createProject = async ({ name, description, createdBy }) => {
  const [result] = await pool.query(
    "INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)",
    [name, description || null, createdBy]
  );
  return result.insertId;
};

const findProjectById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
  return rows[0] || null;
};

const getAllProjects = async () => {
  const [rows] = await pool.query(
    "SELECT id, name, description, status, created_at FROM projects ORDER BY created_at DESC"
  );
  return rows;
};

const getProjectsForUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.description, p.status, p.created_at, pm.role AS my_role
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE pm.user_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
};

const getMembership = async (projectId, userId) => {
  const [rows] = await pool.query(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
    [projectId, userId]
  );
  return rows[0] || null;
};

const getMembers = async (projectId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = ?
     ORDER BY pm.joined_at`,
    [projectId]
  );
  return rows;
};

const addMember = async ({ projectId, userId, role }) => {
  await pool.query(
    "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
    [projectId, userId, role]
  );
};

module.exports = {
  createProject,
  findProjectById,
  getAllProjects,
  getProjectsForUser,
  getMembership,
  getMembers,
  addMember,
};