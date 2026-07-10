import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DoorOpen, Plus, Search, Calendar, QrCode, CheckCircle, X, AlertCircle } from 'lucide-react';

export default function VisitorRequests() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Active gate pass modal view
  const [activePass, setActivePass] = useState(null);
  
  const [newRequest, setNewRequest] = useState({
    visitorName: '',
    relation: '',
    date: '',
    purpose: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/visitors');
      const mine = response.data.data.filter(v => v.studentId === user.id);
      setVisitors(mine);
    } catch (err) {
      console.error('Failed to load visitors list:', err);
      setError('Failed to fetch visitor pass history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVisitors();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRequest.visitorName || !newRequest.relation || !newRequest.date) return;
    setError(null);

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newGuest = {
      id: `vis-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      roomNo: user.roomNo || 'N/A',
      visitorName: newRequest.visitorName,
      relation: newRequest.relation,
      date: newRequest.date,
      inTime: timeNow,
      outTime: null,
      purpose: newRequest.purpose || 'General Visit',
      status: 'Checked In' // Direct check-in to simulate arrival
    };

    setLoading(true);
    try {
      await client.post('/visitors', newGuest);
      setVisitors([newGuest, ...visitors]);
      setNewRequest({ visitorName: '', relation: '', date: '', purpose: '' });
      setIsModalOpen(false);
      
      // Auto show gate pass
      setActivePass(newGuest);
      setSuccessMsg('Guest pre-registered! Gate pass generated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to pre-register guest:', err);
      setError('Failed to submit visitor gate pass request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Visitor Gate Passes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate QR entry passes to pre-authorize parent or friend visits at the security gate.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-650 text-white rounded-xl text-xs font-bold hover:bg-indigo-755 transition-all shadow-md shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Pre-Register Guest
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450 border border-emerald-250/50 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2">
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

      {/* Visitors list */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <DoorOpen className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
            My Guest Log
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-855 text-xs">
          {visitors.length === 0 ? (
            <div className="p-12 text-center text-slate-450 dark:text-slate-550">
              No visitors registered.
            </div>
          ) : (
            visitors.map(vis => (
              <div key={vis.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{vis.visitorName}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{vis.relation}</span>
                  </div>

                  <p className="text-xs text-slate-550 dark:text-slate-400">
                    Purpose: {vis.purpose}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-450">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Date: <b>{vis.date}</b>
                    </span>
                    <span>Times: <b>In: {vis.inTime}</b> {vis.outTime ? `| Out: ${vis.outTime}` : '| On-Site'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    vis.status === 'Checked In'
                      ? 'bg-indigo-50 dark:bg-indigo-955/35 text-indigo-650'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-655'
                  }`}>
                    {vis.status}
                  </span>

                  {vis.status === 'Checked In' && (
                    <button
                      onClick={() => setActivePass(vis)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-50/10 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" /> View Pass
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pre-register Modal sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base">Pre-Register Guest</h3>
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
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Visitor name"
                  value={newRequest.visitorName}
                  onChange={(e) => setNewRequest({ ...newRequest, visitorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Relation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Father, Friend"
                    value={newRequest.relation}
                    onChange={(e) => setNewRequest({ ...newRequest, relation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Date of Visit *
                  </label>
                  <input
                    type="date"
                    required
                    value={newRequest.date}
                    onChange={(e) => setNewRequest({ ...newRequest, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Purpose of Visit
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Deliver food materials..."
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
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
                  Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Gatepass modal view */}
      {activePass && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-left">Digital Gate Entry Pass</h3>
              <button
                onClick={() => setActivePass(null)}
                className="text-slate-405 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual QR mock graphic */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 inline-flex flex-col items-center">
              <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 relative shadow-inner">
                {/* SVG Mock QR Code */}
                <svg className="w-full h-full text-slate-850" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer boundaries */}
                  <rect x="5" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="10" y="10" width="10" height="10" />
                  <rect x="75" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="80" y="10" width="10" height="10" />
                  <rect x="5" y="75" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="10" y="80" width="10" height="10" />
                  
                  {/* Random pixels */}
                  <rect x="35" y="5" width="5" height="10" />
                  <rect x="45" y="5" width="10" height="5" />
                  <rect x="60" y="10" width="5" height="15" />
                  <rect x="35" y="25" width="15" height="5" />
                  <rect x="55" y="25" width="5" height="5" />
                  <rect x="5" y="35" width="10" height="5" />
                  <rect x="20" y="35" width="5" height="10" />
                  <rect x="30" y="35" width="15" height="5" />
                  <rect x="50" y="35" width="5" height="10" />
                  <rect x="60" y="35" width="15" height="5" />
                  <rect x="80" y="35" width="15" height="10" />
                  
                  <rect x="15" y="50" width="15" height="5" />
                  <rect x="35" y="50" width="5" height="15" />
                  <rect x="45" y="45" width="15" height="10" />
                  <rect x="65" y="50" width="10" height="5" />
                  <rect x="85" y="50" width="5" height="10" />
                  
                  <rect x="35" y="70" width="15" height="5" />
                  <rect x="55" y="65" width="10" height="15" />
                  <rect x="70" y="70" width="5" height="5" />
                  <rect x="80" y="65" width="15" height="5" />
                  
                  <rect x="35" y="85" width="25" height="5" />
                  <rect x="65" y="80" width="5" height="15" />
                  <rect x="75" y="85" width="20" height="5" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-3 select-all">PASSCODE: HS-GP-{activePass.id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="space-y-1 text-xs text-slate-655 dark:text-slate-350">
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">{activePass.visitorName}</p>
              <p>Relation: <b className="text-slate-800 dark:text-slate-200">{activePass.relation}</b></p>
              <p>Scheduled: <b className="text-slate-800 dark:text-slate-200">{activePass.date}</b></p>
              <p className="text-[10px] text-slate-400 leading-normal pt-2">
                Present this QR code or Passcode to the security guard at the gate for automated check-in logs verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
