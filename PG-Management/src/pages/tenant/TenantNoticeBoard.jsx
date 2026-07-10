import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Pin, Calendar, User, AlertCircle } from 'lucide-react';

export default function TenantNoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/notices');
      const studentNotices = response.data.data.filter(n => n.target === 'All' || n.target === 'Students');
      setNotices(studentNotices);
    } catch (err) {
      console.error('Failed to load notices:', err);
      setError('Failed to load notices from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Lobby Notice Board</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          View official guidelines, gate timing instructions, and updates published by Wardens and PG Admins.
        </p>
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
          <div className="col-span-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-12 rounded-2xl text-center text-slate-450 dark:text-slate-500">
            No notices are currently posted.
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
                    To: {notice.target}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-655 dark:group-hover:text-indigo-400 transition-colors">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[9px] text-slate-450">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  By: {notice.createdBy}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date: {notice.date}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
