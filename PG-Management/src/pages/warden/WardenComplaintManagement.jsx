import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Search, Filter, Clock, CheckCircle2, MessageSquare, Save, X, AlertCircle } from 'lucide-react';

export default function WardenComplaintManagement() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Selected complaint for action modal
  const [selectedComp, setSelectedComp] = useState(null);
  const [actionForm, setActionForm] = useState({
    status: '',
    reply: ''
  });

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const [complaintsRes, usersRes] = await Promise.all([
        client.get('/complaints'),
        client.get('/users')
      ]);

      const allComplaints = complaintsRes.data.data;
      const students = usersRes.data.data.filter(u => u.role === 'student' && u.hostelId === user.hostelId);
      const studentIds = students.map(s => s.id);

      const hostelComplaints = allComplaints.filter(c => studentIds.includes(c.studentId));
      setComplaints(hostelComplaints);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError('Failed to load complaints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleOpenActionModal = (comp) => {
    setSelectedComp(comp);
    setActionForm({
      status: comp.status,
      reply: comp.reply || ''
    });
  };

  const handleSaveAction = async (e) => {
    e.preventDefault();
    if (!selectedComp) return;
    setError(null);

    try {
      const updatedComp = { ...selectedComp, status: actionForm.status, reply: actionForm.reply };
      await client.put(`/complaints/${selectedComp.id}`, updatedComp);

      // Update state
      const updated = complaints.map(c => {
        if (c.id === selectedComp.id) {
          return { ...c, status: actionForm.status, reply: actionForm.reply };
        }
        return c;
      });
      setComplaints(updated);
      setSelectedComp(null);
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
      setError('Failed to update complaint resolution status.');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.roomNo.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Grievance Resolver</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review, assign maintenance tasks, and resolve tickets submitted by residents of {user?.hostelName}.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Unresolved Tickets', value: complaints.filter(c => c.status !== 'Resolved').length, color: 'border-red-200/50 dark:border-red-955/20 text-red-500 bg-red-500/5' },
          { label: 'In Progress / Maintenance', value: complaints.filter(c => c.status === 'In Progress').length, color: 'border-indigo-200/50 dark:border-indigo-950/20 text-indigo-650 dark:text-indigo-400 bg-indigo-500/5' },
          { label: 'Completed Resolutions', value: complaints.filter(c => c.status === 'Resolved').length, color: 'border-emerald-200/50 dark:border-emerald-955/20 text-emerald-555 dark:text-emerald-450 bg-emerald-550/5' }
        ].map((item, i) => (
          <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-center ${item.color}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{item.label}</span>
            <span className="text-2xl font-extrabold mt-1">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Filter and Queue Card */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        {/* Search filter bars */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-855 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by student, room or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto py-1">
            {['All', 'Pending', 'In Progress', 'Resolved'].map(status => (
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

        {/* Complaints Ticket Queue */}
        <div className="divide-y divide-slate-100 dark:divide-slate-855">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-450 dark:text-slate-550">
              No complaint tickets match the filter.
            </div>
          ) : (
            filteredComplaints.map(comp => (
              <div key={comp.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      comp.priority === 'High'
                        ? 'bg-red-500/15 text-red-500'
                        : comp.priority === 'Medium'
                        ? 'bg-indigo-55/15 text-indigo-650'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {comp.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">{comp.id}</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {comp.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-450 dark:text-slate-500">
                    <span>Resident: <b className="text-slate-600 dark:text-slate-350">{comp.studentName}</b> (Room {comp.roomNo})</span>
                    <span>Category: <b className="text-slate-600 dark:text-slate-350">{comp.category}</b></span>
                    <span>Filed: <b className="text-slate-600 dark:text-slate-350">{comp.date}</b></span>
                  </div>

                  {comp.reply && (
                    <div className="mt-2 p-2 bg-indigo-50/20 dark:bg-indigo-955/20 border-l-2 border-indigo-500 rounded text-[10px] text-slate-650 dark:text-slate-405 leading-relaxed">
                      <b>Warden Response:</b> {comp.reply}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    comp.status === 'Resolved'
                      ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450'
                      : comp.status === 'In Progress'
                      ? 'bg-indigo-50 dark:bg-indigo-955/35 text-indigo-650'
                      : 'bg-red-50 dark:bg-red-955/35 text-red-650'
                  }`}>
                    {comp.status}
                  </span>

                  <button
                    onClick={() => handleOpenActionModal(comp)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Action
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action / Resolve Modal */}
      {selectedComp && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base">Resolve Complaint ticket</h3>
              <button
                onClick={() => setSelectedComp(null)}
                className="text-slate-405 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <p className="text-slate-400 font-bold">Ticket: {selectedComp.id}</p>
              <h4 className="font-bold text-slate-900 dark:text-white">{selectedComp.title}</h4>
              <p className="text-slate-600 dark:text-slate-350">{selectedComp.description}</p>
            </div>

            <form onSubmit={handleSaveAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Update Ticket Status
                </label>
                <select
                  value={actionForm.status}
                  onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                >
                  <option value="Pending">Pending / Unassigned</option>
                  <option value="In Progress">In Progress (Assigned Maintenance)</option>
                  <option value="Resolved">Resolved / Complete</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Resolution Response / Notes
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Explain resolution details to student..."
                  value={actionForm.reply}
                  onChange={(e) => setActionForm({ ...actionForm, reply: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedComp(null)}
                  className="w-full py-2 border border-slate-350 dark:border-slate-800 text-slate-655 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
