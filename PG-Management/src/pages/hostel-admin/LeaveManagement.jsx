import React, { useState } from 'react';
import { db } from '../../data/mockData';
import { Check, X, Calendar } from 'lucide-react';

export const LeaveManagement = () => {
  const [leaves, setLeaves] = useState(() => db.getLeaves());

  const handleStatusUpdate = (leaveId, newStatus) => {
    const updated = leaves.map(l => {
      if (l.id === leaveId) {
        return { ...l, status: newStatus };
      }
      return l;
    });
    setLeaves(updated);
    db.saveLeaves(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Student Leaves & Gate Passes</h1>
        <p className="text-xs text-slate-500 font-medium">Review and process out-of-station checkouts and check-in range applications.</p>
      </div>

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
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {l.studentName} <span className="text-[10px] text-slate-455 block font-semibold mt-0.5">Room {l.roomNo}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-655 dark:text-slate-350">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {l.startDate} to {l.endDate}</span>
                  </td>
                  <td className="p-4 text-slate-550 leading-relaxed max-w-xs truncate">{l.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      l.status === 'Pending' ? 'bg-amber-500/10 text-amber-550' : 'bg-red-500/10 text-red-505'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {l.status === 'Pending' && (
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleStatusUpdate(l.id, 'Approved')}
                          title="Approve Leave"
                          className="p-1.5 bg-emerald-55/10 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(l.id, 'Rejected')}
                          title="Reject Leave"
                          className="p-1.5 bg-red-50 dark:bg-red-955/20 text-red-655 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
