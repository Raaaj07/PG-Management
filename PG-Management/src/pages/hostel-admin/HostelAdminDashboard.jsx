import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Home, Wallet, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonStatCard, SkeletonCard } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';

export const HostelAdminDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, usersRes, complaintsRes, feesRes] = await Promise.all([
        client.get('/rooms'),
        client.get('/users'),
        client.get('/complaints'),
        client.get('/fees')
      ]);

      setRooms(roomsRes.data.data);
      setStudents(usersRes.data.data.filter(u => u.role === 'student'));
      setComplaints(complaintsRes.data.data);
      setFees(feesRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Failed to fetch property overview analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalStudents = students.length;
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupied > 0).length;
  const availableRooms = totalRooms - occupiedRooms;
  const pendingFees = fees.filter(f => f.status === 'Unpaid' || f.status === 'Pending Review').length;
  const openComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  const stats = [
    { label: 'Total Residents', value: totalStudents, icon: Users, color: 'indigo' },
    { label: 'Total Rooms', value: totalRooms, icon: Home, color: 'sky' },
    { label: 'Occupied Rooms', value: occupiedRooms, icon: CheckCircle, color: 'emerald' },
    { label: 'Pending Collections', value: pendingFees, icon: Wallet, color: 'amber' },
  ];

  const occupancyData = [
    { name: 'Occupied', value: occupiedRooms },
    { name: 'Available', value: availableRooms }
  ];
  const OCC_COLORS = ['#10b981', '#cbd5e1'];

  const feeAnalytics = [
    { month: 'Apr', Collected: 140000, Pending: 15000 },
    { month: 'May', Collected: 175000, Pending: 20000 },
    { month: 'Jun', Collected: 195000, Pending: 35000 },
  ];

  const recentActivities = [
    { id: 1, text: 'Rohan Mehra filed a Wifi Complaint', time: '10m ago' },
    { id: 2, text: 'Aman Verma visitor checked in (Father)', time: '1 hour ago' },
    { id: 3, text: 'Room 201 occupancy allocated to student', time: 'Yesterday' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Management Console"
        subtitle="Tenant operational overview, check-ins, leaves, and fee compliance tracking."
      />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : stats.map((s, idx) => <StatCard key={idx} index={idx} {...s} />)}
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee collection Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm lg:col-span-2"
        >
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-6">Fee Collections Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="Collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Occupancy Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-855 shadow-sm flex flex-col justify-between"
        >
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Room Occupancy Distribution</h3>
            <p className="text-[10px] text-slate-450 mt-1">Real-time capacity tracking.</p>
          </div>
          <div className="h-44 flex justify-center items-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OCC_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-500"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Occupied ({occupiedRooms})</span>
            <span className="flex items-center gap-1 text-slate-400"><span className="w-2.5 h-2.5 bg-slate-350 dark:bg-slate-650 rounded-full" /> Vacant ({availableRooms})</span>
          </div>
        </motion.div>
      </div>

      {/* Open tasks & activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Urgent Actions Pending</h3>
            {openComplaints > 0 && (
              <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                {openComplaints} Actionable Tasks
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {complaints.filter(c => c.status !== 'Resolved').slice(0, 3).map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs truncate">{c.title}</h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">Room {c.roomNo} • Raised by {c.studentName}</span>
                </div>
                <Badge tone={c.priority === 'High' ? 'danger' : 'warning'} className="shrink-0">{c.priority} Priority</Badge>
              </div>
            ))}
            {complaints.filter(c => c.status !== 'Resolved').length === 0 && !loading && (
              <p className="text-xs text-slate-400 py-4 text-center">No open complaints — all clear.</p>
            )}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm"
        >
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 items-center text-xs">
                <Clock className="w-4 h-4 text-slate-455 shrink-0" />
                <div className="flex-grow flex justify-between gap-2">
                  <span className="font-semibold">{act.text}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
