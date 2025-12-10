import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (jwtToken) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!res.ok) {
        logout();
        setLoading(false);
        return;
      }

      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) return false;

      loginWithToken(data.token, data.user);
      return true;
    } catch {
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return false;

      loginWithToken(data.token, data.user);
      return true;
    } catch {
      return false;
    }
  };

  const loginWithToken = (jwtToken, userData) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    setLoading(true);

    if (userData) {
      setUser(userData);
      setLoading(false);
    } else {
      fetchUser(jwtToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        loginWithToken,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};