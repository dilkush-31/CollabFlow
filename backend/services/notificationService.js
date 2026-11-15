const pool = require("../config/db");
const { emitToUser } = require("../sockets");

const createNotification = async ({ userId, type, message, taskId = null }) => {
  const [result] = await pool.query(
    "INSERT INTO notifications (user_id, type, message, task_id) VALUES (?, ?, ?, ?)",
    [userId, type, message, taskId]
  );

  const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [result.insertId]);
  emitToUser(userId, "notification:new", rows[0]);
  return rows[0];
};

module.exports = { createNotification };