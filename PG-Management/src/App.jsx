import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';
import { AppToaster } from './components/ui/Toaster';
import axios from 'axios';

function App() {
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const syncDatabase = async () => {
      try {
        const response = await axios.get('/api/sync');
        if (response.data && response.data.success) {
          const payload = response.data.data;
          
          const keyMap = {
            hostels: 'db_hostels',
            users: 'db_users',
            rooms: 'db_rooms',
            fees: 'db_fees',
            complaints: 'db_complaints',
            leaves: 'db_leaves',
            visitors: 'db_visitors',
            notices: 'db_notices',
            plans: 'db_plans'
          };

          for (const [key, storageKey] of Object.entries(keyMap)) {
            if (payload[key]) {
              localStorage.setItem(storageKey, JSON.stringify(payload[key]));
            }
          }
          console.log('Database synced successfully with MongoDB.');
        } else {
          throw new Error('Database sync returned unsuccessful status.');
        }
      } catch (err) {
        console.error('Failed to sync database on startup:', err);
        const detailedError = err.response?.data?.error || err.message || 'Could not connect to database server.';
        setSyncError(detailedError);
      } finally {
        setSyncing(false);
      }
    };

    syncDatabase();
  }, []);

  if (syncing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans p-6 select-none relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse duration-4000"></div>

        {/* Card wrapper */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl relative z-10">
          
          {/* Logo or Brand mark */}
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 relative group overflow-hidden">
            <span className="text-2xl font-black tracking-tighter">PG</span>
            <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
          </div>

          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Connecting to Database
          </h2>
          
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Fetching resident directories, rooms, and lease ledgers...
          </p>

          {/* Premium Loader */}
          <div className="mt-8 flex items-center justify-center gap-1.5 relative w-full h-12">
            <span className="w-2.5 h-7 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_100ms] shadow-sm shadow-indigo-500/50"></span>
            <span className="w-2.5 h-10 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_200ms] shadow-sm shadow-indigo-400/50"></span>
            <span className="w-2.5 h-7 bg-violet-500 rounded-full animate-[bounce_1s_infinite_300ms] shadow-sm shadow-violet-500/50"></span>
          </div>

          <div className="mt-8 w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 w-[40%] rounded-full animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
          </div>
          
          <span className="text-[10px] text-slate-550 font-bold uppercase tracking-widest mt-4">
            Securing Connection
          </span>
        </div>

        {/* Global CSS Inject to support custom loading animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}} />
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans p-6 select-none">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl relative">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold tracking-tight text-red-400">
            Database Server Offline
          </h2>
          
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Could not connect to the backend database server. Please ensure that MongoDB and the backend service are running.
          </p>

          <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-left w-full">
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">Error Message</span>
            <code className="text-[10px] text-red-300 font-mono break-all leading-tight">{syncError}</code>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 transition-colors border border-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppToaster />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
