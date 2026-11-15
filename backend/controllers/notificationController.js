const {
  getNotificationsForUser,
  markRead,
  markAllRead,
} = require("../models/notificationModel");

const listNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsForUser(req.user.id);
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Could not load notifications", error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const updated = await markRead(Number(req.params.id), req.user.id);
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Could not update notification", error: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await markAllRead(req.user.id);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Could not update notifications", error: error.message });
  }
};

module.exports = { listNotifications, markNotificationRead, markAllNotificationsRead };