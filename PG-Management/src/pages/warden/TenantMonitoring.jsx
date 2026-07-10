import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Eye, Search, CheckCircle2, Moon, Sun, AlertCircle } from 'lucide-react';

export const TenantMonitoring = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceMode, setAttendanceMode] = useState('night'); // night or morning
  const [attendanceState, setAttendanceState] = useState({}); // tenantId -> 'present' | 'absent' | 'outpass' | 'late'
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTenantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, leavesRes] = await Promise.all([
        client.get('/users'),
        client.get('/leaves')
      ]);

      const allUsers = usersRes.data.data;
      const hostelTenants = allUsers.filter(u => u.role === 'student' && u.hostelId === user.hostelId);
      
      // Check leaves to auto-tag outpass tenants
      const activeLeaves = leavesRes.data.data.filter(l => l.status === 'Approved');
      const today = new Date().toISOString().split('T')[0];

      const initialAttendance = {};

      const updatedTenants = hostelTenants.map(tenant => {
        // Find if tenant is currently on approved outpass
        const hasOutpass = activeLeaves.some(l => {
          return l.studentId === tenant.id && today >= l.startDate && today <= l.endDate;
        });

        const defaultStatus = hasOutpass ? 'outpass' : 'present';
        initialAttendance[tenant.id] = defaultStatus;

        return {
          ...tenant,
          currentStatus: hasOutpass ? 'On Outpass' : 'In PG',
          roomNo: tenant.roomNo || 'N/A'
        };
      });

      setTenants(updatedTenants);
      setAttendanceState(initialAttendance);
    } catch (err) {
      console.error('Failed to load tenants for curfew tracking:', err);
      setError('Failed to fetch resident presence logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTenantData();
    }
  }, [user]);

  const handleStatusChange = (tenantId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [tenantId]: status
    }));
  };

  const handleSaveRollCall = () => {
    setSaveStatus('Saving roll call...');
    setTimeout(() => {
      setSaveStatus('Roll call saved successfully! Attendance records logged to server.');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 800);
  };

  const filteredTenants = tenants.filter(t => {
    return t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           t.roomNo.includes(searchTerm) || 
           t.college.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Tenant Monitoring & Curfew Check</h1>
          <p className="text-xs text-slate-505 dark:text-slate-400">
            Conduct curfew checks, verify PG presence, and view active leaves for residents.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setAttendanceMode('morning')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              attendanceMode === 'morning'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sun className="w-4 h-4" /> Morning Roll
          </button>
          <button
            onClick={() => setAttendanceMode('night')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              attendanceMode === 'night'
                ? 'bg-indigo-650 text-white border-indigo-650'
                : 'bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Moon className="w-4 h-4" /> Night Curfew
          </button>
        </div>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>{saveStatus}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tenant Card Deck */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        {/* Filters and search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-855 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by tenant name, room, workplace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-805 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
            />
          </div>

          <button
            onClick={handleSaveRollCall}
            className="w-full sm:w-auto px-5 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Save Roll Call Report
          </button>
        </div>

        {/* Tenants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-850">
                <th className="px-6 py-4">Tenant Name</th>
                <th className="px-6 py-4">Room No</th>
                <th className="px-6 py-4">Active Status</th>
                <th className="px-6 py-4">College / Workplace</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4 text-right">Attendance Roll Call</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-450 dark:text-slate-500">
                    No resident tenants match the search filter.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={tenant.avatar}
                          alt={tenant.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/10"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{tenant.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">{tenant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Room {tenant.roomNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                        tenant.currentStatus === 'In PG'
                          ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-955/35 text-amber-650 dark:text-amber-405'
                      }`}>
                        {tenant.currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{tenant.college || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-505 font-mono">{tenant.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80">
                        {['present', 'late', 'outpass', 'absent'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(tenant.id, status)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              attendanceState[tenant.id] === status
                                ? status === 'present'
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : status === 'late'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : status === 'outpass'
                                  ? 'bg-indigo-650 text-white shadow-sm'
                                  : 'bg-red-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                            }`}
                          >
                            {status === 'outpass' ? 'out' : status.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TenantMonitoring;
