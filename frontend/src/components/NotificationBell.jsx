import { useEffect, useState } from "react";
import { api } from "../services/api";
import { getSocket } from "../services/socket";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = () =>
    api
      .get("/notifications")
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {});

  useEffect(() => {
    load();

    const socket = getSocket();
    if (!socket) return;

    const onNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((count) => count + 1);
    };
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    load();
  };

  return (
    <div style={{ position: "relative", fontFamily: "sans-serif" }}>
      <button onClick={() => setOpen(!open)}>
        Notifications {unreadCount > 0 && `(${unreadCount})`}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, width: 320, maxHeight: 360, overflowY: "auto", background: "white", border: "1px solid #ddd", borderRadius: 8, padding: 10, zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Notifications</strong>
            {unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}
          </div>
          {notifications.length === 0 && <p style={{ color: "#555" }}>No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n.id} style={{ padding: "6px 0", borderTop: "1px solid #eee", fontWeight: n.is_read ? "normal" : "bold", fontSize: 14 }}>
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}