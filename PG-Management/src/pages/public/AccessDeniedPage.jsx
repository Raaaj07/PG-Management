import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const AccessDeniedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'super-admin': return '/super-admin';
      case 'hostel-admin': return '/hostel-admin';
      case 'warden': return '/warden';
      case 'student': return '/tenant';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6">
        <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-2xl">
          <ShieldAlert className="w-12 h-12 stroke-1.5" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Access Denied</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            You do not have the required administrative clearance to access this system route. This attempt has been logged.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 flex justify-center items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          
          <Link
            to={getDashboardLink()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-650 text-white font-bold text-xs hover:bg-indigo-700 flex justify-center items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
