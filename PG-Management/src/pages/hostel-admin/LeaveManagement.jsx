import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { Check, X, Calendar, AlertCircle, CalendarRange } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/PageHeader';
import { SkeletonTableRow } from '../../components/ui/Skeleton';

export const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/leaves');
      setLeaves(response.data.data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
      setError('Failed to fetch outpass requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (leaveId, newStatus) => {
    setError(null);
    try {
      const leavesRes = await client.get('/leaves');
      const target = leavesRes.data.data.find(l => l.id === leaveId);
      if (!target) return;

      const updatedLeave = { ...target, status: newStatus };
      await client.put(`/leaves/${leaveId}`, updatedLeave);

      const updated = leaves.map(l => {
        if (l.id === leaveId) {
          return { ...l, status: newStatus };
        }
        return l;
      });
      setLeaves(updated);
      toast.success(newStatus === 'Approved' ? 'Leave approved' : 'Leave rejected');
    } catch (err) {
      console.error('Failed to update leave status:', err);
      setError('Failed to update leave request status.');
      toast.error('Failed to update leave request status.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Leaves & Gate Passes"
        subtitle="Review and process out-of-station checkouts and check-in range applications."
      />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 font-semibold">Student Details</th>
                <th className="p-4 font-semibold">Leave Range</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={CalendarRange} title="No leave requests" description="Outpass requests from residents will appear here." />
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {l.studentName} <span className="text-[10px] text-slate-455 block font-semibold mt-0.5">Room {l.roomNo}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-655 dark:text-slate-350">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {l.startDate} to {l.endDate}</span>
                    </td>
                    <td className="p-4 text-slate-550 leading-relaxed max-w-xs truncate">{l.reason}</td>
                    <td className="p-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="p-4 text-right">
                      {l.status === 'Pending' && (
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleStatusUpdate(l.id, 'Approved')}
                            title="Approve Leave"
                            className="p-1.5 bg-emerald-55/10 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(l.id, 'Rejected')}
                            title="Reject Leave"
                            className="p-1.5 bg-red-50 dark:bg-red-955/20 text-red-655 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
