import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, check whether a saved token is still valid
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    saveSession(data.token, data.user);
  };

  const register = async (name, email, password) => {
    const data = await api.post("/auth/register", { name, email, password });
    saveSession(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);