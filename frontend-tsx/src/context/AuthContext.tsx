import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean; // <-- added
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "parent" | "adopter"
  ) => Promise<boolean>;
  loginWithToken: (token: string, user?: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true); // <-- added

  const isAuthenticated = Boolean(token);

  // -------------------------------------------------------
  // Load token ONCE when app starts
  // -------------------------------------------------------
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false); // no token → done loading
    }
  }, []);

  // -------------------------------------------------------
  // Fetch user from backend using /me endpoint
  // -------------------------------------------------------
  const fetchUser = async (jwtToken: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!res.ok) {
        logout();
        setLoading(false); // prevent infinite loading
        return;
      }

      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    } finally {
      setLoading(false); // <-- IMPORTANT
    }
  };

  // -------------------------------------------------------
  // REGISTER
  // -------------------------------------------------------
  const register = async (
    name: string,
    email: string,
    password: string,
    role: "parent" | "adopter"
  ): Promise<boolean> => {
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

  // -------------------------------------------------------
  // LOGIN
  // -------------------------------------------------------
  const login = async (email: string, password: string): Promise<boolean> => {
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

  // -------------------------------------------------------
  // MAIN AUTH FUNCTION (SAVE TOKEN + SET USER)
  // -------------------------------------------------------
  const loginWithToken = (jwtToken: string, userData?: User) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    setLoading(true); // we're determining user now

    if (userData) {
      setUser(userData);
      setLoading(false);
    } else {
      fetchUser(jwtToken);
    }
  };

  // -------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // -------------------------------------------------------
  // UPDATE PROFILE
  // -------------------------------------------------------
  const updateProfile = (updates: Partial<User>) => {
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
        loading, // <-- added
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
