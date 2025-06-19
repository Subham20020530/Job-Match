import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set token in headers if exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Load user info on app start
    const loadUser = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function with 10s timeout
  const login = async (email, password) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        // { timeout: 10000 } // 10 seconds timeout
      );

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setError(null);
    } catch (err) {
      let message;
      if (err.code === 'ECONNABORTED') {
        message = 'Login timed out. Please check your internet connection.';
      } else {
        message =
          err?.response?.data?.message ||
          err.message ||
          'Login failed. Please try again.';
      }

      setError(message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Registration logic
  const register = async (userData, role) => {
    try {
      setLoading(true);
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      };

      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        { ...userData, role },
        config
      );

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setError(null);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setError(message);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
