import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>Create an account</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <button type="submit" style={{ width: "100%", padding: 10 }}>Register</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}