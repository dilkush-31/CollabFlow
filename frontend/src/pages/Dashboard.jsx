import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h2>Welcome, {user.name}</h2>
      <p>Role: {user.role}</p>
      <p>The full dashboard comes on Day 7.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}