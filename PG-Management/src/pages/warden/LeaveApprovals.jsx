import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CalendarRange, Search, Check, X, Calendar, User, Clock, AlertCircle } from 'lucide-react';

export default function LeaveApprovals() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leavesRes, usersRes] = await Promise.all([
        client.get('/leaves'),
        client.get('/users')
      ]);

      const allLeaves = leavesRes.data.data;
      const students = usersRes.data.data.filter(u => u.role === 'student' && u.hostelId === user.hostelId);
      const studentIds = students.map(s => s.id);

      const hostelLeaves = allLeaves.filter(l => studentIds.includes(l.studentId));
      setLeaves(hostelLeaves);
    } catch (err) {
      console.error('Failed to load leave applications:', err);
      setError('Failed to fetch outpass queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user]);

  const handleDecision = async (leaveId, decision) => {
    setError(null);
    try {
      const leavesRes = await client.get('/leaves');
      const target = leavesRes.data.data.find(l => l.id === leaveId);
      if (!target) return;

      const updatedLeave = { ...target, status: decision };
      await client.put(`/leaves/${leaveId}`, updatedLeave);

      // Update state
      const updated = leaves.map(l => {
        if (l.id === leaveId) {
          return { ...l, status: decision };
        }
        return l;
      });
      setLeaves(updated);
    } catch (err) {
      console.error('Failed to save leave decision:', err);
      setError('Failed to record outpass approval decision.');
    }
  };

  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = 
      l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.roomNo.includes(searchTerm) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || l.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Resident Outpass & Leave Approvals</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Approve or deny home checkout outpasses requested by residents.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Outpass Requests Queue', value: leaves.filter(l => l.status === 'Pending').length, color: 'text-amber-500 bg-amber-500/5 border-amber-200/50 dark:border-amber-955/20' },
          { label: 'Approved Active Outpasses', value: leaves.filter(l => l.status === 'Approved').length, color: 'text-emerald-555 dark:text-emerald-450 bg-emerald-550/5 border-emerald-200/50 dark:border-emerald-955/20' },
          { label: 'Rejected Applications', value: leaves.filter(l => l.status === 'Rejected').length, color: 'text-red-500 bg-red-500/5 border-red-200/50 dark:border-red-955/20' }
        ].map((item, i) => (
          <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-center ${item.color}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{item.label}</span>
            <span className="text-2xl font-extrabold mt-1">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by student, room or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto py-1">
            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-indigo-650 text-white border-indigo-655'
                    : 'bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Leaves list */}
        <div className="divide-y divide-slate-100 dark:divide-slate-855 text-xs">
          {filteredLeaves.length === 0 ? (
            <div className="p-12 text-center text-slate-450 dark:text-slate-550">
              No leave outpass tickets match the criteria.
            </div>
          ) : (
            filteredLeaves.map(leave => (
              <div key={leave.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{leave.studentName}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Room {leave.roomNo}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-350 italic">
                    "{leave.reason}"
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-450 dark:text-slate-550">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Duration: <b>{leave.startDate}</b> to <b>{leave.endDate}</b>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Applied on: {leave.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  {leave.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(leave.id, 'Approved')}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-650 text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Outpass
                      </button>
                      <button
                        onClick={() => handleDecision(leave.id, 'Rejected')}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-650 text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Deny
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      leave.status === 'Approved'
                        ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-400 border border-emerald-250/50'
                        : 'bg-red-50 dark:bg-red-955/35 text-red-650 dark:text-red-400 border border-red-250/50'
                    }`}>
                      {leave.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
