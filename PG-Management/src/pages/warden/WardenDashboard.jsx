import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, CalendarRange, DoorOpen, ShieldAlert, Check, X, ArrowRight } from 'lucide-react';

export default function WardenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentsCount: 0,
    pendingLeaves: 0,
    activeVisitors: 0,
    pendingComplaints: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, leavesRes, visitorsRes, complaintsRes] = await Promise.all([
        client.get('/users'),
        client.get('/leaves'),
        client.get('/visitors'),
        client.get('/complaints')
      ]);

      const allUsers = usersRes.data.data;
      const allLeaves = leavesRes.data.data;
      const allVisitors = visitorsRes.data.data;
      const allComplaints = complaintsRes.data.data;

      const students = allUsers.filter(u => u.role === 'student' && u.hostelId === user.hostelId);
      const leaves = allLeaves.filter(l => {
        const student = allUsers.find(u => u.id === l.studentId);
        return student && student.hostelId === user.hostelId;
      });
      const visitors = allVisitors.filter(v => {
        const student = allUsers.find(u => u.id === v.studentId);
        return student && student.hostelId === user.hostelId;
      });
      const complaints = allComplaints.filter(c => {
        const student = allUsers.find(u => u.id === c.studentId);
        return student && student.hostelId === user.hostelId;
      });

      const pendingLeaves = leaves.filter(l => l.status === 'Pending');
      const activeVisitors = visitors.filter(v => v.status === 'Checked In');
      const pendingComplaints = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress');

      setStats({
        studentsCount: students.length,
        pendingLeaves: pendingLeaves.length,
        activeVisitors: activeVisitors.length,
        pendingComplaints: pendingComplaints.length
      });

      setRecentLeaves(pendingLeaves.slice(0, 3));
      setRecentComplaints(pendingComplaints.slice(0, 3));
    } catch (err) {
      console.error('Failed to load warden dashboard data:', err);
      setError('Failed to retrieve PG metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleQuickLeaveAction = async (leaveId, decision) => {
    setError(null);
    try {
      const leavesRes = await client.get('/leaves');
      const targetLeave = leavesRes.data.data.find(l => l.id === leaveId);
      if (!targetLeave) return;

      const updatedLeave = { ...targetLeave, status: decision };
      await client.put(`/leaves/${leaveId}`, updatedLeave);

      // Refresh state
      setRecentLeaves(prev => prev.filter(l => l.id !== leaveId));
      setStats(prev => ({
        ...prev,
        pendingLeaves: prev.pendingLeaves - 1
      }));
    } catch (err) {
      console.error('Failed to process quick leave action:', err);
      setError('Failed to record outpass status update.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-650 to-violet-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-600/10">
        <div className="max-w-xl space-y-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Warden Staff Console
          </span>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">Welcome Back, {user?.name}!</h1>
          <p className="text-xs text-indigo-100 leading-relaxed font-semibold">
            Operational dashboard for {user?.hostelName || 'Elite Residency PG'}. Monitor resident directories, guest trackers, and process outpass leaves.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* Grid of operational stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Tenants', value: stats.studentsCount, icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
          { title: 'Pending Outpasses', value: stats.pendingLeaves, icon: CalendarRange, color: 'text-amber-500 bg-amber-550/10' },
          { title: 'Active Guests On-Site', value: stats.activeVisitors, icon: DoorOpen, color: 'text-emerald-555 dark:text-emerald-450 bg-emerald-550/10' },
          { title: 'Open Grievances', value: stats.pendingComplaints, icon: ShieldAlert, color: 'text-red-500 bg-red-500/10' }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">{item.title}</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outpass approvals queue */}
        <div className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <CalendarRange className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
                Recent Outpass Requests
              </h3>
              <Link to="/warden/leaves" className="text-[10px] font-bold text-indigo-650 hover:underline flex items-center gap-0.5">
                Manage Queue <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending leave requests. Excellent!
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeaves.map(leave => (
                  <div key={leave.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{leave.studentName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Room {leave.roomNo} | {leave.startDate} to {leave.endDate}</p>
                      <p className="text-[10px] text-slate-500 italic mt-1 max-w-[220px] truncate" title={leave.reason}>
                        "{leave.reason}"
                      </p>
                    </div>
                    <div className="flex gap-1.5 ml-2">
                      <button
                        onClick={() => handleQuickLeaveAction(leave.id, 'Approved')}
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-650 text-white rounded-lg transition-colors cursor-pointer"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleQuickLeaveAction(leave.id, 'Rejected')}
                        className="p-1.5 bg-red-500 hover:bg-red-650 text-white rounded-lg transition-colors cursor-pointer"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Complaints Alert list */}
        <div className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
                Pending Grievances
              </h3>
              <Link to="/warden/complaints" className="text-[10px] font-bold text-indigo-650 hover:underline flex items-center gap-0.5">
                Resolve Tickets <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentComplaints.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active complaints filed.
              </div>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map(comp => (
                  <div key={comp.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          comp.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {comp.priority}
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{comp.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Room {comp.roomNo} | {comp.studentName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      comp.status === 'In Progress' ? 'bg-indigo-55/10 text-indigo-650' : 'bg-red-50 dark:bg-red-955/20 text-red-650'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
