import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedPage } from '../pages/public/AccessDeniedPage';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('auth_token');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans p-6 select-none relative overflow-hidden">
        {/* Loading Spinner */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse"></div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl relative z-10">
          <div className="mt-8 flex items-center justify-center gap-1.5 relative w-full h-12">
            <span className="w-2.5 h-7 bg-indigo-50 rounded-full animate-bounce shadow-sm shadow-indigo-500/50"></span>
            <span className="w-2.5 h-10 bg-indigo-450 rounded-full animate-bounce delay-100 shadow-sm shadow-indigo-400/50"></span>
            <span className="w-2.5 h-7 bg-violet-50 rounded-full animate-bounce delay-200 shadow-sm shadow-violet-500/50"></span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
            Authenticating Session
          </span>
        </div>
      </div>
    );
  }

  // Treat missing token or missing user object as unauthenticated
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to AccessDeniedPage when role doesn't match the route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDeniedPage />;
  }

  return children;
};
