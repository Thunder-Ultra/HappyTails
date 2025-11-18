import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (name, email, password, role) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Check if user exists
      if (users.find((u) => u.email === email)) {
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        role,
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem(`password_${email}`, password);

      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      return true;
    } catch (error) {
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u) => u.email === email);

      if (!foundUser) {
        return false;
      }

      const storedPassword = localStorage.getItem(`password_${email}`);
      if (storedPassword !== password) {
        return false;
      }

      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));

      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update in users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const index = users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
