
import KanbanBoard from "../components/kanbanBoard";  
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function ProjectDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProject = () =>
    api.get(`/projects/${id}`).then(setData).catch((err) => setError(err.message));

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/projects/${id}/members`, { email, role });
      setEmail("");
      setMessage("Member added");
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !data) {
    return (
      <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
        <p><Link to="/projects">← Back to projects</Link></p>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }
  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <p><Link to="/projects">← Back to projects</Link></p>
      <h2>{data.project.name}</h2>
      <p>{data.project.description}</p>
      <p>Status: {data.project.status} · Your role: {data.myRole}</p>

      <h3>Members</h3>
      <ul>
        {data.members.map((m) => (
          <li key={m.id}>{m.name} ({m.email}) — {m.role}</li>
        ))}
      </ul>

      {data.myRole === "manager" && (
        <form onSubmit={handleAddMember} style={{ marginTop: 20 }}>
          <h3>Add member</h3>
          <input
            type="email"
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: 8 }}>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
          </select>
          <br />
          <button type="submit">Add</button>
        </form>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <KanbanBoard projectId={id} myRole={data.myRole} members={data.members} />
    </div>
  );
}