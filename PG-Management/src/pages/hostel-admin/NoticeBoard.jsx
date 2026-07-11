import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Pin, Plus, Calendar, User, Eye, Trash2, X, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/PageHeader';

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    target: 'All'
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/notices');
      setNotices(response.data.data);
    } catch (err) {
      console.error('Failed to load notices:', err);
      setError('Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    setError(null);

    const newEntry = {
      id: `not-${Date.now()}`,
      title: newNotice.title,
      content: newNotice.content,
      date: new Date().toISOString().split('T')[0],
      createdBy: 'Hostel Admin',
      target: newNotice.target
    };

    setLoading(true);
    try {
      await client.post('/notices', newEntry);
      setNotices([newEntry, ...notices]);
      setNewNotice({ title: '', content: '', target: 'All' });
      setIsModalOpen(false);
      toast.success('Notice published');
    } catch (err) {
      console.error('Failed to create notice:', err);
      setError('Failed to publish announcement.');
      toast.error('Failed to publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!confirmDeleteId) return;
    setError(null);
    setDeleting(true);
    try {
      await client.delete(`/notices/${confirmDeleteId}`);
      setNotices(notices.filter(n => n.id !== confirmDeleteId));
      toast.success('Notice removed');
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete notice:', err);
      setError('Failed to delete announcement.');
      toast.error('Failed to delete announcement.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notice Board</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish notices, guidelines, and announcements to residents and hostel staff.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          Create Notice
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl">
            <EmptyState icon={Pin} title="No notices published yet" description='Click "Create Notice" to publish your first announcement.' />
          </div>
        ) : (
          notices.map((notice, idx) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (idx % 6) * 0.04 }}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 rounded-2xl p-5 shadow-xs relative flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              {/* Pin Icon */}
              <div className="absolute top-4 right-4 text-indigo-555 dark:text-indigo-400">
                <Pin className="w-4.5 h-4.5 fill-indigo-500/10 rotate-45" />
              </div>

              <div className="space-y-3">
                {/* Target Badge */}
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                    notice.target === 'All'
                      ? 'bg-indigo-55/10 text-indigo-650 dark:text-indigo-400'
                      : notice.target === 'Students'
                      ? 'bg-emerald-50 dark:bg-emerald-955/30 text-emerald-650 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-955/30 text-amber-650 dark:text-amber-405'
                  }`}>
                    To: {notice.target}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {notice.title}
                </h3>
                
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>

              {/* Notice Meta Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div className="flex flex-col gap-1 text-[10px] text-slate-450 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-450" />
                    By: {notice.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-455" />
                    Date: {notice.date}
                  </span>
                </div>

                {notice.createdBy === 'Hostel Admin' && (
                  <button
                    onClick={() => setConfirmDeleteId(notice.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal for New Notice */}
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Create Notice Board Announcement"
        icon={Pin}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="create-notice-form" loading={loading}>Publish Notice</Button>
          </>
        }
      >
            <form id="create-notice-form" onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi Upgrade Maintenance"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Target Audience *
                </label>
                <select
                  value={newNotice.target}
                  onChange={(e) => setNewNotice({ ...newNotice, target: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                >
                  <option value="All">All Residents & Staff</option>
                  <option value="Students">Students/Residents Only</option>
                  <option value="Staff">Wardens & Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Notice Details / Description *
                </label>
                <textarea
                  rows="5"
                  required
                  placeholder="Write announcement details..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-850 dark:text-slate-100"
                />
              </div>
            </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title="Delete this notice?"
        description="This announcement will be removed from the board for everyone."
        confirmLabel="Delete Notice"
        loading={deleting}
        onConfirm={handleDeleteNotice}
      />
    </div>
  );
}
