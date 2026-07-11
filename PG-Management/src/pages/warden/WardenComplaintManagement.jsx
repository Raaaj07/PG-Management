import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Search, Filter, Clock, CheckCircle2, MessageSquare, Save, X, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/PageHeader';

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
  const [saving, setSaving] = useState(false);

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
    setSaving(true);

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
      toast.success('Resolution saved');
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
      setError('Failed to update complaint resolution status.');
      toast.error('Failed to update complaint resolution status.');
    } finally {
      setSaving(false);
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
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`p-4 border rounded-2xl flex flex-col justify-center ${item.color}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{item.label}</span>
            <span className="text-2xl font-extrabold mt-1">{item.value}</span>
          </motion.div>
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
            <EmptyState icon={ShieldAlert} title="No matching tickets" description="Try adjusting your search or status filter." />
          ) : (
            filteredComplaints.map(comp => (
              <div key={comp.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge tone={comp.priority === 'High' ? 'danger' : comp.priority === 'Medium' ? 'indigo' : 'neutral'} dot={false}>{comp.priority} Priority</Badge>
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
                  <Badge status={comp.status} />

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
      <Modal
        open={!!selectedComp}
        onOpenChange={(v) => !v && setSelectedComp(null)}
        title="Resolve Complaint Ticket"
        icon={MessageSquare}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedComp(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="resolve-complaint-form" loading={saving}>Save Resolution</Button>
          </>
        }
      >
        {selectedComp && (
        <>
            <div className="text-xs space-y-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-850">
              <p className="text-slate-400 font-bold">Ticket: {selectedComp.id}</p>
              <h4 className="font-bold text-slate-900 dark:text-white">{selectedComp.title}</h4>
              <p className="text-slate-600 dark:text-slate-350">{selectedComp.description}</p>
            </div>

            <form id="resolve-complaint-form" onSubmit={handleSaveAction} className="space-y-4">
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

            </form>
        </>
        )}
      </Modal>
    </div>
  );
}
