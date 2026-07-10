import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, Calendar, Trash2, X, Pin, AlertCircle } from 'lucide-react';

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
    } catch (err) {
      console.error('Failed to create notice:', err);
      setError('Failed to publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await client.delete(`/notices/${id}`);
      const updated = notices.filter(n => n.id !== id);
      setNotices(updated);
    } catch (err) {
      console.error('Failed to delete notice:', err);
      setError('Failed to remove notice bulletin.');
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-650 text-white rounded-xl text-xs font-bold hover:bg-indigo-755 transition-all shadow-md shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Publish Announcement
        </button>
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
          <div className="col-span-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-12 rounded-2xl text-center text-slate-450 dark:text-slate-555">
            No bulletins published.
          </div>
        ) : (
          notices.map(notice => (
            <div
              key={notice.id}
              className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative hover:shadow-md transition-all group animate-fade-in"
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
                    onClick={() => handleDelete(notice.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-55/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notice Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base">Create Warden Notice</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-405 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
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

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 border border-slate-350 dark:border-slate-800 text-slate-655 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
