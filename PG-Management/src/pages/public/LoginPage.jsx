import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../data/mockData';
import { ShieldCheck, Mail, Lock, User, Users, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('admin123'); // Preset password for convenience
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [pgName, setPgName] = useState('Elite Residency PG');

  useEffect(() => {
    const hostels = db.getHostels();
    if (hostels && hostels.length > 0) {
      setPgName(hostels[0].name);
    }
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
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Panel: Traditional Login Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-955 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-700/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4.5 h-4.5" />}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850 text-center text-xs text-slate-500">
            Applying for admission?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Register as Tenant
            </Link>
          </div>
        </div>

        {/* Right Panel: Demo Accounts Sandbox */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-bold tracking-wide uppercase text-indigo-400">Portal Login Sandbox</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Explore the {pgName} Console</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Select any role card below to instantly autofill demo credentials and test the corresponding user interface (Admin, Warden, or Tenant).
            </p>

            <div className="flex flex-col gap-3">
              {demoAccounts.map((acc, idx) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDemoSelect(acc.email)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-[1.01]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-750 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm tracking-tight">{acc.role} Account</span>
                      <div className={`w-2 h-2 rounded-full ${
                        acc.color === 'indigo' ? 'bg-indigo-400' :
                        acc.color === 'emerald' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono">{acc.email}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">{acc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-500 leading-relaxed">
            Note: The portal environment runs client-side in-memory utilizing localStorage persistence.
          </div>
        </div>

      </div>
    </div>
  );
};
