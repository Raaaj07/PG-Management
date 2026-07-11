import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DoorOpen, Search, LogIn, LogOut, Clock, Plus, X, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function VisitorTracking() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check-in form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [newVisitor, setNewVisitor] = useState({
    studentId: '',
    visitorName: '',
    relation: '',
    purpose: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [visitorsRes, usersRes] = await Promise.all([
        client.get('/visitors'),
        client.get('/users')
      ]);

      const allVisitors = visitorsRes.data.data;
      const allUsers = usersRes.data.data;

      const hostelVisitors = allVisitors.filter(v => {
        const student = allUsers.find(u => u.id === v.studentId);
        return student && student.hostelId === user.hostelId;
      });

      const hostelStudents = allUsers.filter(u => u.role === 'student' && u.hostelId === user.hostelId);

      setVisitors(hostelVisitors);
      setStudents(hostelStudents);
    } catch (err) {
      console.error('Failed to load visitors data:', err);
      setError('Failed to fetch visitor logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCheckout = async (id) => {
    setError(null);
    try {
      const vRes = await client.get('/visitors');
      const target = vRes.data.data.find(v => v.id === id);
      if (!target) return;

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedVisitor = { ...target, status: 'Checked Out', outTime: timeNow };
      await client.put(`/visitors/${id}`, updatedVisitor);

      const updated = visitors.map(v => {
        if (v.id === id) {
          return { ...v, status: 'Checked Out', outTime: timeNow };
        }
        return v;
      });
      setVisitors(updated);
      toast.success('Visitor checked out');
    } catch (err) {
      console.error('Failed to check out visitor:', err);
      setError('Failed to log visitor checkout.');
      toast.error('Failed to log visitor checkout.');
    }
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!newVisitor.studentId || !newVisitor.visitorName) return;
    setError(null);

    const host = students.find(s => s.id === newVisitor.studentId);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateToday = new Date().toISOString().split('T')[0];

    const newEntry = {
      id: `vis-${Date.now()}`,
      studentId: newVisitor.studentId,
      studentName: host ? host.name : 'Unknown Resident',
      roomNo: host ? (host.roomNo || 'N/A') : 'N/A',
      visitorName: newVisitor.visitorName,
      relation: newVisitor.relation || 'Friend',
      date: dateToday,
      inTime: timeNow,
      outTime: null,
      purpose: newVisitor.purpose || 'General',
      status: 'Checked In'
    };

    setLoading(true);
    try {
      await client.post('/visitors', newEntry);
      setVisitors([newEntry, ...visitors]);
      setNewVisitor({ studentId: '', visitorName: '', relation: '', purpose: '' });
      setIsModalOpen(false);
      toast.success('Visitor checked in');
    } catch (err) {
      console.error('Failed to check in visitor:', err);
      setError('Failed to submit visitor check-in.');
      toast.error('Failed to submit visitor check-in.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = 
      v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.roomNo.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Security Gate Visitor Tracker</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log security desk entries, guest verification, and timestamp exits at the main gate.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          Check In New Guest
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search visitor or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto py-1">
            {['All', 'Checked In', 'Checked Out'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-indigo-655 text-white border-indigo-655'
                    : 'bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-55/40'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Visitor Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-850">
                <th className="px-6 py-4">Visitor & Relation</th>
                <th className="px-6 py-4">Host Resident</th>
                <th className="px-6 py-4">Gate Date</th>
                <th className="px-6 py-4">Check In/Out Times</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-450 dark:text-slate-550">
                    No visitor logs found.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map(vis => (
                  <tr key={vis.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {vis.visitorName}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{vis.relation}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-850 dark:text-slate-200">{vis.studentName}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Room {vis.roomNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vis.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                          <span>In: {vis.inTime}</span>
                        </div>
                        {vis.outTime ? (
                          <div className="flex items-center gap-1 text-slate-400">
                            <LogOut className="w-3.5 h-3.5 text-red-400" />
                            <span>Out: {vis.outTime}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>On-Site</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate" title={vis.purpose}>
                      {vis.purpose}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={vis.status === 'Checked In' ? 'indigo' : 'neutral'}>{vis.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {vis.status === 'Checked In' ? (
                        <button
                          onClick={() => handleCheckout(vis.id)}
                          className="px-2.5 py-1 bg-red-500 hover:bg-red-650 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Checked Out</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal check-in form */}
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Check In Visitor"
        icon={DoorOpen}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="visitor-checkin-form" loading={loading}>Confirm Check In</Button>
          </>
        }
      >
            <form id="visitor-checkin-form" onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Host Resident Student *
                </label>
                <select
                  required
                  value={newVisitor.studentId}
                  onChange={(e) => setNewVisitor({ ...newVisitor, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                >
                  <option value="">Select Resident</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Room {s.roomNo || 'N/A'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Visitor full name"
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Relationship to Resident
                </label>
                <input
                  type="text"
                  placeholder="e.g. Father, Friend, Delivery"
                  value={newVisitor.relation}
                  onChange={(e) => setNewVisitor({ ...newVisitor, relation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Purpose of Visit
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Luggage drop, project study"
                  value={newVisitor.purpose}
                  onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-850 dark:text-slate-100"
                />
              </div>

            </form>
      </Modal>
    </div>
  );
}
