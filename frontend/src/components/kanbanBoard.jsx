import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const emptyForm = { title: "", description: "", priority: "medium", deadline: "", assignedTo: "" };

export default function KanbanBoard({ projectId, myRole, members }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const isManager = myRole === "manager";

  const loadTasks = () =>
    api
      .get(`/projects/${projectId}/tasks`)
      .then((data) => setTasks(data.tasks))
      .catch((err) => setError(err.message));

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        deadline: form.deadline || null,
        assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
      });
      setForm(emptyForm);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeField = async (taskId, body) => {
    setError("");
    try {
      await api.patch(`/tasks/${taskId}`, body);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const canMove = (task) => isManager || task.assigned_to === user.id;

  const priorityColor = { low: "#2e7d32", medium: "#ef6c00", high: "#c62828" };

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Task board</h3>

      {isManager && (
        <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
          <input
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button type="submit">Add task</button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.key);
          return (
            <div key={column.key} style={{ background: "#f4f5f7", borderRadius: 8, padding: 10, minHeight: 200 }}>
              <h4 style={{ marginTop: 0 }}>
                {column.label} ({columnTasks.length})
              </h4>

              {columnTasks.map((task) => (
                <div key={task.id} style={{ background: "white", borderRadius: 6, padding: 10, marginBottom: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
                  <strong>{task.title}</strong>
                  {task.description && <p style={{ margin: "4px 0", color: "#555", fontSize: 14 }}>{task.description}</p>}
                  <div style={{ fontSize: 12, color: "#555" }}>
                    <span style={{ color: priorityColor[task.priority], fontWeight: "bold" }}>
                      {task.priority.toUpperCase()}
                    </span>
                    {task.deadline && <> · Due {task.deadline}</>}
                    {task.assignee_name && <> · {task.assignee_name}</>}
                  </div>

                  {canMove(task) && (
                    <select
                      value={task.status}
                      onChange={(e) => changeField(task.id, { status: e.target.value })}
                      style={{ marginTop: 6, width: "100%" }}
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}