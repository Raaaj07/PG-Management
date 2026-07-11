import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, LogIn, LogOut, Calendar, Plus, Clock, UserCheck, X, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function VisitorManagement() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal State for New Visitor Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [newVisitor, setNewVisitor] = useState({
    studentId: '',
    visitorName: '',
    relation: '',
    purpose: '',
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
        const host = allUsers.find(u => u.id === v.studentId);
        return host && host.hostelId === user.hostelId;
      });

      const hostelStudents = allUsers.filter(u => u.role === 'student' && u.hostelId === user.hostelId);

      setVisitors(hostelVisitors);
      setStudentsList(hostelStudents);
    } catch (err) {
      console.error('Failed to load visitors list:', err);
      setError('Failed to load visitor logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCheckOut = async (visId) => {
    setError(null);
    try {
      const vRes = await client.get('/visitors');
      const target = vRes.data.data.find(v => v.id === visId);
      if (!target) return;

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedVisitor = { ...target, status: 'Checked Out', outTime: timeNow };
      await client.put(`/visitors/${visId}`, updatedVisitor);

      const updated = visitors.map(v => {
        if (v.id === visId) {
          return { ...v, status: 'Checked Out', outTime: timeNow };
        }
        return v;
      });
      setVisitors(updated);
      toast.success(`${target.visitorName} checked out`);
    } catch (err) {
      console.error('Failed to checkout visitor:', err);
      setError('Failed to update visitor checkout status.');
      toast.error('Failed to update visitor checkout status.');
    }
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!newVisitor.studentId || !newVisitor.visitorName || !newVisitor.relation) return;
    setError(null);

    const hostStudent = studentsList.find(s => s.id === newVisitor.studentId);
    const dateToday = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEntry = {
      id: `vis-${Date.now()}`,
      studentId: newVisitor.studentId,
      studentName: hostStudent ? hostStudent.name : 'Unknown Student',
      roomNo: hostStudent ? (hostStudent.roomNo || 'N/A') : 'N/A',
      visitorName: newVisitor.visitorName,
      relation: newVisitor.relation,
      date: dateToday,
      inTime: timeNow,
      outTime: null,
      purpose: newVisitor.purpose || 'General Visit',
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
      console.error('Failed to add visitor:', err);
      setError('Failed to check in guest.');
      toast.error('Failed to check in guest.');
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
          <h1 className="text-2xl font-extrabold tracking-tight">Visitor Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor and record entries/exits for host guests at {user?.hostelName || 'your property'}.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">
          Record New Entry
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-450 dark:text-slate-500">Active Visitors On-Site</h4>
            <p className="text-2xl font-extrabold mt-0.5">
              {visitors.filter(v => v.status === 'Checked In').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-450 dark:text-slate-500">Total Logs Today</h4>
            <p className="text-2xl font-extrabold mt-0.5">
              {visitors.filter(v => v.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 text-slate-550 dark:text-slate-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-450 dark:text-slate-500">Completed Checkouts</h4>
            <p className="text-2xl font-extrabold mt-0.5">
              {visitors.filter(v => v.status === 'Checked Out').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search visitor, student or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 overflow-x-auto py-1">
            {['All', 'Checked In', 'Checked Out'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-indigo-650 text-white border-indigo-650'
                    : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                <th className="px-6 py-4">Visitor & Relation</th>
                <th className="px-6 py-4">Visiting Student</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Timing</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-450 dark:text-slate-500">
                    No matching visitor logs found.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((vis) => (
                  <tr key={vis.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{vis.visitorName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{vis.relation}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{vis.studentName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Room {vis.roomNo}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vis.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <LogIn className="w-3 h-3 text-emerald-500" />
                          <span>In: {vis.inTime}</span>
                        </div>
                        {vis.outTime && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <LogOut className="w-3 h-3 text-red-400" />
                            <span>Out: {vis.outTime}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={vis.purpose}>
                      {vis.purpose}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={vis.status === 'Checked In' ? 'indigo' : 'neutral'}>{vis.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {vis.status === 'Checked In' ? (
                        <button
                          onClick={() => handleCheckOut(vis.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-650 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm shadow-red-500/10 cursor-pointer"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Logged Out</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for New Entry */}
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Record Visitor Entry"
        icon={UserCheck}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="add-visitor-form" loading={loading}>Check In Visitor</Button>
          </>
        }
      >
            <form id="add-visitor-form" onSubmit={handleAddVisitor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Visiting Resident *
                </label>
                <select
                  required
                  value={newVisitor.studentId}
                  onChange={(e) => setNewVisitor({ ...newVisitor, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                >
                  <option value="">Select Resident Student</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Room {s.roomNo || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Visitor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name of the visitor"
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Relationship *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Father, Mother, Friend, Sibling"
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
                  placeholder="e.g. Deliver home-cooked meals, group project work"
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
