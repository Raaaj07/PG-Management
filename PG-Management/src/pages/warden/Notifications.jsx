import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, Calendar, Trash2, X, Pin, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/PageHeader';

export default function Notifications() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    target: 'Students'
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
      createdBy: 'Warden',
      target: newNotice.target
    };

    setLoading(true);
    try {
      await client.post('/notices', newEntry);
      setNotices([newEntry, ...notices]);
      setNewNotice({ title: '', content: '', target: 'Students' });
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

  const handleDelete = async () => {
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
      setError('Failed to remove notice bulletin.');
      toast.error('Failed to remove notice bulletin.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Warden Announcements</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish curfew guidelines, gate warnings, or specific alerts to student residents.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          Publish Announcement
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl">
            <EmptyState icon={Bell} title="No bulletins published" description="Publish your first announcement to residents." />
          </div>
        ) : (
          notices.map((notice, idx) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (idx % 6) * 0.04 }}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative hover:shadow-lg transition-all group"
            >
              <div className="absolute top-4 right-4 text-indigo-500 dark:text-indigo-400">
                <Pin className="w-4 h-4 fill-indigo-500/10 rotate-45" />
              </div>

              <div className="space-y-3">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                    notice.target === 'All'
                      ? 'bg-indigo-50 dark:bg-indigo-955/35 text-indigo-650 dark:text-indigo-400'
                      : 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450'
                  }`}>
                    For: {notice.target}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div className="flex flex-col gap-0.5 text-[9px] text-slate-450">
                  <span>Author: {notice.createdBy}</span>
                  <span>Date: {notice.date}</span>
                </div>

                {notice.createdBy === 'Warden' && (
                  <button
                    onClick={() => setConfirmDeleteId(notice.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-55/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Notice Board Modal */}
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Create Warden Notice"
        icon={Pin}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="warden-notice-form" loading={loading}>Publish Notice</Button>
          </>
        }
      >
            <form id="warden-notice-form" onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. strict gate curfew at 10 PM"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={newNotice.target}
                  onChange={(e) => setNewNotice({ ...newNotice, target: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                >
                  <option value="Students">All Students / Residents</option>
                  <option value="All">All Staff & Residents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Bulletin Notice details *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write curfew notice or rule updates..."
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
        description="This bulletin will be removed for all residents."
        confirmLabel="Delete Notice"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
