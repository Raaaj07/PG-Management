import React, { useState, useEffect } from 'react';
import { db } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Plus, Search, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

export default function ComplaintSubmission() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'Internet',
    description: '',
    priority: 'Medium'
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Load student's complaints
    const all = db.getComplaints();
    const mine = all.filter(c => c.studentId === user.id);
    setComplaints(mine);
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) return;

    const newTicket = {
      id: `comp-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      roomNo: user.roomNo || 'N/A',
      title: newComplaint.title,
      category: newComplaint.category,
      description: newComplaint.description,
      priority: newComplaint.priority,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      reply: null
    };

    const updated = [newTicket, ...complaints];
    setComplaints(updated);

    // Save to master db
    const all = db.getComplaints();
    all.unshift(newTicket);
    db.saveComplaints(all);

    // Form cleanup
    setNewComplaint({ title: '', category: 'Internet', description: '', priority: 'Medium' });
    setIsModalOpen(false);

    setSuccessMsg('Complaint registered successfully! Warden will review it shortly.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Maintenance & Complaints Box</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit repair requests or report facility issues directly to the hostel warden.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-650 text-white rounded-xl text-xs font-bold hover:bg-indigo-755 transition-all shadow-md shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> File New Ticket
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Queue list of filed tickets */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
            My Ticket History
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-855 text-xs">
          {complaints.length === 0 ? (
            <div className="p-12 text-center text-slate-450 dark:text-slate-550">
              No complaint tickets submitted. All systems green!
            </div>
          ) : (
            complaints.map(comp => (
              <div key={comp.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      comp.priority === 'High'
                        ? 'bg-red-500/15 text-red-500'
                        : comp.priority === 'Medium'
                        ? 'bg-indigo-55/15 text-indigo-650'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {comp.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono uppercase">{comp.id}</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {comp.title}
                  </h4>

                  <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-450">
                    <span>Category: <b>{comp.category}</b></span>
                    <span>Filed: <b>{comp.date}</b></span>
                  </div>

                  {comp.reply && (
                    <div className="mt-2 p-3 bg-indigo-50/20 dark:bg-indigo-955/20 border-l-2 border-indigo-500 rounded text-[10px] text-slate-650 dark:text-slate-405 leading-relaxed">
                      <b>Staff response note:</b> "{comp.reply}"
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-end md:self-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    comp.status === 'Resolved'
                      ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450 border border-emerald-250/50'
                      : comp.status === 'In Progress'
                      ? 'bg-indigo-50 dark:bg-indigo-955/35 text-indigo-650 border border-indigo-250/50'
                      : 'bg-red-50 dark:bg-red-955/35 text-red-650 border border-red-250/50'
                  }`}>
                    {comp.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submission Modal Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base">File Repair / Maintenance Ticket</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-405 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Category *
                </label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                >
                  <option value="Internet">WiFi & Internet</option>
                  <option value="Electrical">Electrical & Fans</option>
                  <option value="Plumbing">Plumbing & Washrooms</option>
                  <option value="Housekeeping">Housekeeping & Cleaning</option>
                  <option value="Food/Mess">Mess & Catering</option>
                  <option value="Other">Other Operational Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Complaint Subject Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi router blinking red"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Priority Clearance
                </label>
                <div className="grid grid-cols-3 gap-2 font-bold text-center">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewComplaint({ ...newComplaint, priority: p })}
                      className={`p-2 border rounded-xl transition-all cursor-pointer ${
                        newComplaint.priority === p
                          ? p === 'High'
                            ? 'border-red-500 bg-red-500/10 text-red-500'
                            : p === 'Medium'
                            ? 'border-indigo-650 bg-indigo-50/10 text-indigo-650'
                            : 'border-slate-400 text-slate-655'
                          : 'border-slate-200 dark:border-slate-800 text-slate-450'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Elaborate Description *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe repair context (e.g., location, frequency)..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 border border-slate-350 dark:border-slate-800 text-slate-655 dark:text-slate-305 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
