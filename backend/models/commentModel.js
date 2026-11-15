const pool = require("../config/db");

const createComment = async ({ taskId, userId, content }) => {
  const [result] = await pool.query(
    "INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)",
    [taskId, userId, content]
  );
  return result.insertId;
};

const getCommentsByTask = async (taskId) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.task_id, c.content, c.created_at, c.user_id, u.name AS author_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.task_id = ?
     ORDER BY c.created_at ASC`,
    [taskId]
  );
  return rows;
};

const findCommentWithAuthor = async (id) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.task_id, c.content, c.created_at, c.user_id, u.name AS author_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { createComment, getCommentsByTask, findCommentWithAuthor };