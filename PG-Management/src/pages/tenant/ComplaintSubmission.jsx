import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Plus, Search, CheckCircle, Clock, AlertTriangle, X, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/PageHeader';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/complaints');
      const all = response.data.data;
      const mine = all.filter(c => c.studentId === user.id);
      setComplaints(mine);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError('Failed to load your complaints history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) return;
    setError(null);

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

    setLoading(true);
    try {
      await client.post('/complaints', newTicket);
      setComplaints([newTicket, ...complaints]);
      setNewComplaint({ title: '', category: 'Internet', description: '', priority: 'Medium' });
      setIsModalOpen(false);
      setSuccessMsg('Complaint registered successfully! Warden will review it shortly.');
      toast.success('Ticket filed — Warden will review it shortly');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setError('Failed to submit your complaint.');
      toast.error('Failed to submit your complaint.');
    } finally {
      setLoading(false);
    }
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
        <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          File New Ticket
        </Button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
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
            <EmptyState icon={ShieldAlert} title="No complaint tickets submitted" description="All systems green — file a ticket if something needs attention." />
          ) : (
            complaints.map(comp => (
              <div key={comp.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone={comp.priority === 'High' ? 'danger' : comp.priority === 'Medium' ? 'indigo' : 'neutral'} dot={false}>{comp.priority} Priority</Badge>
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
                  <Badge status={comp.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submission Modal Sheet */}
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="File Repair / Maintenance Ticket"
        icon={ShieldAlert}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="complaint-form" loading={loading}>Submit Ticket</Button>
          </>
        }
      >
            <form id="complaint-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
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

            </form>
      </Modal>
    </div>
  );
}
