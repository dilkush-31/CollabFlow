import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const canCreate = user.role === "admin" || user.role === "project_manager";

  const loadProjects = () =>
    api.get("/projects").then((data) => setProjects(data.projects)).catch((err) => setError(err.message));

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "" });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <p><Link to="/dashboard">← Back to dashboard</Link></p>
      <h2>Projects</h2>

      {canCreate && (
        <form onSubmit={handleCreate} style={{ marginBottom: 30 }}>
          <input
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <button type="submit">Create project</button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {projects.length === 0 && <p>No projects yet.</p>}

      <ul>
        {projects.map((p) => (
          <li key={p.id} style={{ marginBottom: 10 }}>
            <Link to={`/projects/${p.id}`}><strong>{p.name}</strong></Link>
            {" "}— {p.status}
            {p.description && <div style={{ color: "#555" }}>{p.description}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}