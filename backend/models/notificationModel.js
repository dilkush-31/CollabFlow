const pool = require("../config/db");

const getNotificationsForUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, type, message, task_id, is_read, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );
  return rows;
};

const markRead = async (id, userId) => {
  const [result] = await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
};

const markAllRead = async (userId) => {
  await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [userId]);
};

module.exports = { getNotificationsForUser, markRead, markAllRead };