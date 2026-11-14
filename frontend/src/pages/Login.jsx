import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>Login to CollabFlow</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <button type="submit" style={{ width: "100%", padding: 10 }}>Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}