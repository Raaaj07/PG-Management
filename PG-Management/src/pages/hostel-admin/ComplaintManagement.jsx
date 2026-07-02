import React, { useState } from 'react';
import { db } from '../../data/mockData';
import { Search, Filter, Check, Reply, Trash2 } from 'lucide-react';

export const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState(() => db.getComplaints());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.studentName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const updateStatus = (complaintId, newStatus) => {
    const updated = complaints.map(c => {
      if (c.id === complaintId) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    setComplaints(updated);
    db.saveComplaints(updated);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText || !replyingTo) return;

    const updated = complaints.map(c => {
      if (c.id === replyingTo) {
        return { ...c, reply: replyText, status: 'In Progress' };
      }
      return c;
    });
    setComplaints(updated);
    db.saveComplaints(updated);
    
    setReplyText('');
    setReplyingTo(null);
  };

  const deleteComplaint = (complaintId) => {
    if (window.confirm('Delete this complaint entry from logs?')) {
      const updated = complaints.filter(c => c.id !== complaintId);
      setComplaints(updated);
      db.saveComplaints(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Resident Complaints Redressal</h1>
        <p className="text-xs text-slate-500 font-medium">Coordinate repairs, comment on ticket statuses, or assign tasks to Wardens.</p>
      </div>

      <div className="bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between transition-colors">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by title, student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-955 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4.5 h-4.5 text-slate-455 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Complaints</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 text-slate-400">
            No complaints logged.
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div key={c.id} className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col justify-between gap-4 transition-colors">
              <div>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Pending' ? 'bg-red-500/10 text-red-500' :
                      c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-550' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{c.category}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-850'}`}>
                    {c.priority} Priority
                  </span>
                </div>

                <h3 className="font-extrabold text-base mt-3 text-slate-900 dark:text-white">{c.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{c.description}</p>

                <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-400 font-semibold">
                  <span>Resident: <strong className="text-slate-700 dark:text-slate-350">{c.studentName}</strong> (Room {c.roomNo})</span>
                  <span>Date Raised: {c.date}</span>
                </div>

                {c.reply && (
                  <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-805 text-xs">
                    <span className="font-bold text-slate-655 dark:text-indigo-400">Response / Audit Reply:</span>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{c.reply}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center flex-wrap gap-2">
                <button
                  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                  className="px-3.5 py-1.5 border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-[10px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5" /> Reply / Update Status
                </button>
                <div className="flex gap-2">
                  {c.status !== 'Resolved' && (
                    <button
                      onClick={() => updateStatus(c.id, 'Resolved')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve Ticket
                    </button>
                  )}
                  <button
                    onClick={() => deleteComplaint(c.id)}
                    className="p-1.5 bg-red-50 dark:bg-red-955/20 text-red-655 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {replyingTo === c.id && (
                <form onSubmit={handleReplySubmit} className="mt-2 space-y-3 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <textarea
                    rows={2}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Enter resolution notes..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none text-slate-950 dark:text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-650 rounded-lg text-[10px] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      Post Response
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
