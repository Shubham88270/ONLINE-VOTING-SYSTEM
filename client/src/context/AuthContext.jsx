import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.jsx';

const AuthContext = createContext();

// JWT token decode karo (expiry check ke liye)
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      // Agar token expired hai toh clear karo
      if (stored?.token && isTokenExpired(stored.token)) {
        localStorage.removeItem('user');
        return null;
      }
      return stored;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  // Har 5 min mein token check karo
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored?.token && isTokenExpired(stored.token)) {
        localStorage.removeItem('user');
        setUser(null);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      const updated = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      // If 401 — token invalid, logout
      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
