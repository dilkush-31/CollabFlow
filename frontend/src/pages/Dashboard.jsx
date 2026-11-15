import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Loading from "../components/loading";
import ErrorMessage from "../components/errorMessage";
import NotificationBell from "../components/NotificationBell";

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 130, border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
      <div style={{ fontSize: 13, color: "#555" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/dashboard/summary")
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Welcome, {user.name}</h2>
      <NotificationBell />
      <p>Role: {user.role}</p>

      {loading && <Loading text="Loading dashboard..." />}
      <ErrorMessage message={error} onRetry={loadSummary} />

      {summary && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <StatCard label="Projects" value={summary.projects} color="#1565c0" />
            <StatCard label="Total tasks" value={summary.tasks.total} color="#333" />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard label="Pending tasks" value={summary.tasks.pending} color="#ef6c00" />
            <StatCard label="Completed tasks" value={summary.tasks.completed} color="#2e7d32" />
            <StatCard label="Overdue tasks" value={summary.tasks.overdue} color="#c62828" />
          </div>
        </>
      )}

      <p><Link to="/projects">Go to projects</Link></p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}