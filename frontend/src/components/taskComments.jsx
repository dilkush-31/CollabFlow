import { useEffect, useState } from "react";
import { api } from "../services/api";
import { getSocket } from "../services/socket";
import Loading from "./loading";
import ErrorMessage from "./errorMessage";

export default function TaskComments({ taskId, projectId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  const load = () => {
    setError("");
    return api
      .get(`/tasks/${taskId}/comments`)
      .then((data) => setComments(data.comments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [taskId]);

  // Live updates: add comments for this task as they arrive
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNew = (comment) => {
      if (comment.task_id === taskId) {
        setComments((prev) => [...prev, comment]);
      }
    };
    socket.on("comment:new", onNew);
    return () => socket.off("comment:new", onNew);
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: text });
      setText("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee" }}>
      {loading && <Loading text="Loading comments..." />}
      <ErrorMessage message={error} onRetry={load} />

      {comments.map((c) => (
        <div key={c.id} style={{ marginBottom: 8, fontSize: 14 }}>
          <strong>{c.author_name}</strong>{" "}
          <span style={{ color: "#888", fontSize: 12 }}>{new Date(c.created_at).toLocaleString()}</span>
          <div>{c.content}</div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment"
          maxLength={1000}
          style={{ flex: 1, padding: 6 }}
        />
        <button type="submit" disabled={!text.trim()}>Send</button>
      </form>
    </div>
  );
}