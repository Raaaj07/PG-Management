import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authenticate user against mock database
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = db.getUsers();
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (matchedUser) {
        setUser(matchedUser);
        localStorage.setItem('auth_user', JSON.stringify(matchedUser));
        return { success: true, user: matchedUser };
      } else {
        throw new Error('Invalid email or password. Use demo credentials shown below.');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register a new PG Tenant
  const registerTenant = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = db.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (existingUser) {
        throw new Error('Email is already registered. Please login.');
      }

      // Create new Tenant user
      const newTenantId = `user-${users.length + 1}`;
      const newTenant = {
        id: newTenantId,
        name: formData.name,
        email: formData.email,
        role: 'student', // Keep role as 'student' internally for routing
        hostelId: 'hostel-1',
        hostelName: db.getHostels()[0]?.name || 'Elite Residency PG',
        roomId: null,
        roomNo: 'Not Allocated',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
        phone: formData.phone || '',
        emergencyContact: formData.emergencyContact || '',
        college: formData.college || 'Not Specified', // college property maps to Affiliation/Occupation
        address: formData.address || '',
        gender: formData.gender || 'Not Specified'
      };

      users.push(newTenant);
      db.saveUsers(users);

      // Auto login as the newly registered Tenant
      setUser(newTenant);
      localStorage.setItem('auth_user', JSON.stringify(newTenant));
      return { success: true, user: newTenant };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, registerTenant, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
