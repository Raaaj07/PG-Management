import React from 'react';
import { db } from '../../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Home, Wallet, ShieldAlert, CheckCircle, Clock
} from 'lucide-react';

export const HostelAdminDashboard = () => {
  const rooms = db.getRooms();
  const students = db.getUsers().filter(u => u.role === 'student');
  const complaints = db.getComplaints();
  const fees = db.getFees();

  const totalStudents = students.length;
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupied > 0).length;
  const availableRooms = totalRooms - occupiedRooms;
  const pendingFees = fees.filter(f => f.status === 'Unpaid' || f.status === 'Pending Review').length;
  const openComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  const stats = [
    { label: 'Total Residents', value: totalStudents, icon: Users, color: 'text-indigo-650 bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Total Rooms', value: totalRooms, icon: Home, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
    { label: 'Occupied Rooms', value: occupiedRooms, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Pending Collections', value: pendingFees, icon: Wallet, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Property Management Console</h1>
        <p className="text-xs text-slate-500 font-medium">Tenant operational overview, check-ins, leaves, and fee compliance tracking.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex justify-between items-center transition-colors">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{s.value}</h3>
              </div>
              <div className={`p-3.5 rounded-xl ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee collection Bar chart */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-6">Fee Collections Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="Collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Pie Chart */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-855 shadow-sm flex flex-col justify-between">
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
        </div>
      </div>

      {/* Open tasks & activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Complaints */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-semibold">Urgent Actions Pending</h3>
            {openComplaints > 0 && (
              <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                {openComplaints} Actionable Tasks
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {complaints.filter(c => c.status !== 'Resolved').slice(0, 3).map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">{c.title}</h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">Room {c.roomNo} • Raised by {c.studentName}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-550'}`}>
                  {c.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 items-center text-xs">
                <Clock className="w-4 h-4 text-slate-455 shrink-0" />
                <div className="flex-grow flex justify-between">
                  <span className="font-semibold">{act.text}</span>
                  <span className="text-[10px] text-slate-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
