import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  // OPTIMIZATION: Initialize state from localStorage immediately.
  // This prevents a "flash" of unauthenticated state on refresh.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    // If token exists on mount, fetch user data
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []); // Run once on mount

  const fetchUser = async (jwtToken) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!res.ok) {
        logout();
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
    setLoading(false);
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
        token, // Token is explicitly exposed here
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