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

function ProgressBar({ percent }) {
  return (
    <div style={{ background: "#e0e0e0", borderRadius: 4, height: 8, width: "100%" }}>
      <div style={{ background: "#2e7d32", width: `${percent}%`, height: 8, borderRadius: 4 }} />
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([api.get("/dashboard/summary"), api.get("/dashboard/overview")])
      .then(([summaryData, overviewData]) => {
        setSummary(summaryData);
        setOverview(overviewData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome, {user.name}</h2>
          <p style={{ margin: "4px 0 0", color: "#555" }}>Role: {user.role}</p>
        </div>
        <NotificationBell />
      </div>

      {loading && <Loading text="Loading dashboard..." />}
      <ErrorMessage message={error} onRetry={loadDashboard} />

      {summary && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "20px 0 12px" }}>
            <StatCard label="Projects" value={summary.projects} color="#1565c0" />
            <StatCard label="Total tasks" value={summary.tasks.total} color="#333" />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <StatCard label="Pending tasks" value={summary.tasks.pending} color="#ef6c00" />
            <StatCard label="Completed tasks" value={summary.tasks.completed} color="#2e7d32" />
            <StatCard label="Overdue tasks" value={summary.tasks.overdue} color="#c62828" />
          </div>
        </>
      )}

      {overview && (
        <>
          <h3>Overdue tasks</h3>
          {overview.overdue.length === 0 && <p style={{ color: "#555" }}>Nothing overdue. Good work.</p>}
          <ul style={{ paddingLeft: 18 }}>
            {overview.overdue.map((t) => (
              <li key={t.id} style={{ marginBottom: 6 }}>
                <Link to={`/projects/${t.project_id}`}><strong>{t.title}</strong></Link>
                {" "}in {t.project_name} · due {t.deadline}
                {t.assignee_name && <> · {t.assignee_name}</>}
              </li>
            ))}
          </ul>

          <h3>Project progress</h3>
          {overview.progress.length === 0 && <p style={{ color: "#555" }}>No projects yet.</p>}
          {overview.progress.map((p) => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                <Link to={`/projects/${p.id}`}>{p.name}</Link>
                <span style={{ color: "#555" }}>
                  {p.completed} of {p.total} tasks done ({p.percent}%)
                </span>
              </div>
              <ProgressBar percent={p.percent} />
            </div>
          ))}
        </>
      )}

      <p style={{ marginTop: 24 }}>
        <Link to="/projects">Go to projects</Link>
      </p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}