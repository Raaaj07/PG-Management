import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on application mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await client.get('/auth/me');
          if (response.data && response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('auth_user', JSON.stringify(response.data.user));
          } else {
            throw new Error('Failed to verify token');
          }
        } catch (err) {
          console.error('Session restoration failed:', err.response?.data?.error || err.message);
          // Token is invalid/expired
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // Authenticate user against database
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { token, user: loggedUser } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { success: true, user: loggedUser };
      } else {
        throw new Error(response.data?.error || 'Authentication failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Invalid email or password.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register a new PG Tenant
  const registerTenant = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/auth/register', formData);
      if (response.data && response.data.success) {
        const { token, user: registeredUser } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(registeredUser));
        setUser(registeredUser);
        return { success: true, user: registeredUser };
      } else {
        throw new Error(response.data?.error || 'Registration failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, registerTenant, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
