import React, { useState, useEffect } from 'react';
import { db } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { CalendarRange, Plus, Search, CheckCircle, Clock, AlertTriangle, X, Calendar } from 'lucide-react';

export default function LeaveApplication() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Fetch user leaves
    const all = db.getLeaves();
    const mine = all.filter(l => l.studentId === user.id);
    setLeaves(mine);
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;

    const request = {
      id: `leave-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      roomNo: user.roomNo || 'N/A',
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [request, ...leaves];
    setLeaves(updated);

    // Save to master db
    const all = db.getLeaves();
    all.unshift(request);
    db.saveLeaves(all);

    setNewLeave({ startDate: '', endDate: '', reason: '' });
    setIsModalOpen(false);

    setSuccessMsg('Leave outpass requested! Waiting for Warden approval.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Outpass & Leave Applications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Request official checkout leaves (outpass) and monitor Warden approval states.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-650 text-white rounded-xl text-xs font-bold hover:bg-indigo-755 transition-all shadow-md shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Request Outpass
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Outpass queue list */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <CalendarRange className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
            My Outpass Logs
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-855 text-xs">
          {leaves.length === 0 ? (
            <div className="p-12 text-center text-slate-450 dark:text-slate-550">
              No leave outpasses requested.
            </div>
          ) : (
            leaves.map(leave => (
              <div key={leave.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">ID: {leave.id}</span>
                  </div>

                  <p className="text-xs text-slate-655 dark:text-slate-350 italic">
                    Reason: "{leave.reason}"
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-450">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Checkout Dates: <b>{leave.startDate}</b> to <b>{leave.endDate}</b>
                    </span>
                    <span>Requested: <b>{leave.date}</b></span>
                  </div>
                </div>

                <div className="shrink-0 self-end md:self-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    leave.status === 'Approved'
                      ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-405 border border-emerald-250/50'
                      : leave.status === 'Pending'
                      ? 'bg-amber-50 dark:bg-amber-955/35 text-amber-650 border border-amber-250/50'
                      : 'bg-red-50 dark:bg-red-955/35 text-red-650 border border-red-250/50'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Modal sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base">Request Gate Outpass</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-405 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Reason for Outpass *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="e.g. Going home for family gathering, semester exams..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 border border-slate-350 dark:border-slate-800 text-slate-655 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
