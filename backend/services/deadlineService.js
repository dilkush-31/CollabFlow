const pool = require("../config/db");
const { createNotification } = require("./notificationService");

// Alerts assignees for open tasks due today or tomorrow, once per task per day
const checkDeadlines = async () => {
  const [tasks] = await pool.query(
    `SELECT t.id, t.title, t.assigned_to, DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline
     FROM tasks t
     WHERE t.assigned_to IS NOT NULL
       AND t.status <> 'completed'
       AND t.deadline BETWEEN CURDATE() AND CURDATE() + INTERVAL 1 DAY
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.task_id = t.id
           AND n.type = 'deadline_alert'
           AND DATE(n.created_at) = CURDATE()
       )`
  );

  for (const task of tasks) {
    await createNotification({
      userId: task.assigned_to,
      type: "deadline_alert",
      message: `"${task.title}" is due ${task.deadline}`,
      taskId: task.id,
    });
  }

  return tasks.length;
};

module.exports = { checkDeadlines };