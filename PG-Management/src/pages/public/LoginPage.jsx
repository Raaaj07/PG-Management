import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [pgName, setPgName] = useState('Elite Residency PG');

  useEffect(() => {
    const fetchHostelName = async () => {
      try {
        const response = await client.get('/hostels');
        if (response.data.data && response.data.data.length > 0) {
          setPgName(response.data.data[0].name);
        }
      } catch (err) {
        console.error('Failed to load hostel details:', err);
      }
    };
    fetchHostelName();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    const result = await login(email, password);
    if (result.success) {
      // Redirect to correct dashboard based on role
      switch (result.user.role) {
        case 'hostel-admin':
          navigate('/hostel-admin');
          break;
        case 'warden':
          navigate('/warden');
          break;
        case 'student':
          navigate('/tenant');
          break;
        default:
          navigate('/');
      }
    }
  };

  const handleDemoSelect = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('admin123');
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@test.com', desc: 'Manage rooms, tenant allocations, and PG invoices', color: 'indigo' },
    { role: 'Warden', email: 'warden@test.com', desc: 'Monitor room occupancy, track complaints, and approve leaves', color: 'emerald' },
    { role: 'Tenant', email: 'student@test.com', desc: 'View invoices, submit leaves, and lodge complaints', color: 'rose' }
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-955 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-xl flex flex-col transition-colors"
      >
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/20">
              H
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {pgName}
            </span>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-550 dark:text-slate-400">
            Sign in to manage your PG account
          </p>

          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter email address"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-350 dark:border-slate-700 text-indigo-650 focus:ring-indigo-500" />
                Remember me
              </label>
              <a href="#" className="text-indigo-600 hover:underline">Forgot password?</a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-700/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4.5 h-4.5" />}
            </motion.button>
          </form>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-850 text-center text-xs text-slate-500">
          Applying for admission?{' '}
          <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register as Tenant
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
