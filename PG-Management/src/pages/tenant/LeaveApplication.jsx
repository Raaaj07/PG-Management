import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CalendarRange, Plus, Search, CheckCircle, Clock, AlertTriangle, X, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/PageHeader';

export default function LeaveApplication() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newLeave, setNewLeave] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/leaves');
      const mine = response.data.data.filter(l => l.studentId === user.id);
      setLeaves(mine);
    } catch (err) {
      console.error('Failed to load leaves:', err);
      setError('Failed to fetch your outpass application logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
    setError(null);

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

    setLoading(true);
    try {
      await client.post('/leaves', request);
      setLeaves([request, ...leaves]);
      setNewLeave({ startDate: '', endDate: '', reason: '' });
      setIsModalOpen(false);
      setSuccessMsg('Leave outpass requested! Waiting for Warden approval.');
      toast.success('Outpass requested — awaiting Warden approval');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to submit leave:', err);
      setError('Failed to submit leave request.');
      toast.error('Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
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
        <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          Request Outpass
        </Button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
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
            <EmptyState icon={CalendarRange} title="No leave outpasses requested" description="Request your first outpass to see it tracked here." />
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
                  <Badge status={leave.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Modal sheet */}
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Request Gate Outpass"
        icon={CalendarRange}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="leave-request-form" loading={loading}>Submit Request</Button>
          </>
        }
      >
            <form id="leave-request-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
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

            </form>
      </Modal>
    </div>
  );
}
