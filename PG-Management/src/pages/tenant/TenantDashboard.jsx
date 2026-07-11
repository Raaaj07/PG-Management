import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Home, Wallet, ShieldAlert, CalendarRange, Pin, ArrowRight, AlertCircle } from 'lucide-react';
import { SkeletonStatCard } from '../../components/ui/Skeleton';

export default function TenantDashboard() {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [feeDue, setFeeDue] = useState(null);
  const [recentNotice, setRecentNotice] = useState(null);
  const [activeLeave, setActiveLeave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, feesRes, noticesRes, leavesRes] = await Promise.all([
        client.get('/rooms'),
        client.get('/fees'),
        client.get('/notices'),
        client.get('/leaves')
      ]);

      const rooms = roomsRes.data.data;
      const myRoom = rooms.find(r => r.id === user.roomId || r.roomNo === user.roomNo);
      setRoom(myRoom);

      const fees = feesRes.data.data.filter(f => f.studentId === user.id);
      const unpaid = fees.find(f => f.status === 'Unpaid');
      setFeeDue(unpaid);

      const notices = noticesRes.data.data.filter(n => n.target === 'All' || n.target === 'Students');
      if (notices.length > 0) {
        setRecentNotice(notices[0]);
      }

      const leaves = leavesRes.data.data.filter(l => l.studentId === user.id);
      if (leaves.length > 0) {
        setActiveLeave(leaves[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to fetch dashboard overview metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-650 to-violet-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-600/10"
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="max-w-xl space-y-2 relative">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Resident Portal
          </span>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-xs text-indigo-105 leading-relaxed font-semibold">
            Manage your hostel residency at {user?.hostelName || 'Elite Residency PG'}. View roommates, clear rent dues, submit complaints, and request gate outpasses.
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick stats dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
        <>
        {/* Room Info card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0 }} whileHover={{ y: -3 }} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-lg transition-shadow">
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Room Allocation</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Room {room?.roomNo || 'Unassigned'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{room?.type || 'Double Sharing'}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Home className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Fees Status card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} whileHover={{ y: -3 }} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-lg transition-shadow">
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Rent Status</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {feeDue ? `₹${feeDue.amount}` : 'Cleared'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{feeDue ? `Due for ${feeDue.month}` : 'No outstanding bills'}</p>
          </div>
          <div className={`p-3 rounded-xl ${feeDue ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
            <Wallet className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Leaves outpass card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} whileHover={{ y: -3 }} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-lg transition-shadow">
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Latest Outpass</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 truncate max-w-[140px]">
              {activeLeave ? activeLeave.status : 'No Requests'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{activeLeave ? `${activeLeave.startDate} to ${activeLeave.endDate}` : 'No active leaves'}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <CalendarRange className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Notice Board card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} whileHover={{ y: -3 }} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-lg transition-shadow">
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Lobby Notice</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 truncate max-w-[140px]">
              {recentNotice ? recentNotice.title : 'No Alerts'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{recentNotice ? `By ${recentNotice.createdBy}` : 'Hostel operates normally'}</p>
          </div>
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-650 dark:text-violet-400">
            <Pin className="w-5 h-5" />
          </div>
        </motion.div>
        </>
        )}
      </div>

      {/* Bottom split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board Preview */}
        <div className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <Pin className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
              Important Announcements
            </h3>
            <Link to="/tenant/notices" className="text-[10px] font-bold text-indigo-650 hover:underline flex items-center gap-0.5">
              Read Notices <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentNotice ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-855 rounded-xl space-y-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{recentNotice.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                {recentNotice.content}
              </p>
              <div className="text-[9px] text-slate-400 pt-1 flex justify-between">
                <span>Issued by: {recentNotice.createdBy}</span>
                <span>Date: {recentNotice.date}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-6">No recent notices published.</p>
          )}
        </div>

        {/* Roommate details */}
        <div className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <Home className="w-4.5 h-4.5 text-indigo-555 dark:text-indigo-400" />
              Room & Policy Information
            </h3>
            <Link to="/tenant/room" className="text-[10px] font-bold text-indigo-650 hover:underline flex items-center gap-0.5">
              Room Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs pb-2 border-b border-slate-50 dark:border-slate-900/50">
              <span className="text-slate-450 dark:text-slate-500">Sharing Mode</span>
              <span className="font-bold text-slate-900 dark:text-white">{room?.type || 'Double Sharing'}</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-slate-50 dark:border-slate-900/50">
              <span className="text-slate-450 dark:text-slate-500">Floor Level</span>
              <span className="font-bold text-slate-900 dark:text-white">{room?.floor || '1st Floor'}</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-slate-50 dark:border-slate-900/50">
              <span className="text-slate-455 dark:text-slate-500">AC/Climate Control</span>
              <span className="font-bold text-slate-900 dark:text-white">{room?.ac ? 'Air Conditioned (AC)' : 'Non-AC Room'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-450 dark:text-slate-500">Monthly Rent Charge</span>
              <span className="font-extrabold text-indigo-650 dark:text-indigo-400">₹{room?.rent || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
