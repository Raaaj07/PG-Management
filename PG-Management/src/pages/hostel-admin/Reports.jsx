import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Filter, Home, Wallet, ShieldAlert, BarChart3, AlertCircle } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('occupancy');
  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const [roomsRes, usersRes, feesRes, complaintsRes] = await Promise.all([
          client.get('/rooms'),
          client.get('/users'),
          client.get('/fees'),
          client.get('/complaints')
        ]);

        const roomsData = roomsRes.data.data;
        const usersData = usersRes.data.data;
        const feesData = feesRes.data.data;
        const complaintsData = complaintsRes.data.data;

        if (reportType === 'occupancy') {
          const rooms = roomsData.filter(r => r.hostelId === user.hostelId);
          const students = usersData.filter(u => u.role === 'student' && u.hostelId === user.hostelId);
          
          const tableData = rooms.map(room => {
            const roomStudents = students.filter(s => s.roomId === room.id);
            return {
              id: room.id,
              roomNo: room.roomNo,
              type: room.type,
              floor: room.floor,
              rent: room.rent,
              occupancy: `${room.occupied} / ${room.capacity}`,
              occupants: roomStudents.map(s => s.name).join(', ') || 'None',
              status: room.occupied === 0 ? 'Empty' : room.occupied === room.capacity ? 'Fully Booked' : 'Partially Booked'
            };
          });
          setReportData(tableData);

          const totalCap = rooms.reduce((sum, r) => sum + r.capacity, 0);
          const totalOcc = rooms.reduce((sum, r) => sum + r.occupied, 0);
          setSummaryStats({
            title1: 'Total Rooms', val1: rooms.length,
            title2: 'Total Capacity', val2: totalCap,
            title3: 'Occupied Beds', val3: totalOcc,
            title4: 'Occupancy Rate', val4: totalCap ? `${Math.round((totalOcc / totalCap) * 100)}%` : '0%'
          });
        } else if (reportType === 'financial') {
          const fees = feesData;
          const students = usersData.filter(u => u.role === 'student' && u.hostelId === user.hostelId);
          const studentIds = students.map(s => s.id);
          
          const hostelFees = fees.filter(f => studentIds.includes(f.studentId));
          setReportData(hostelFees);

          const paidAmount = hostelFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
          const unpaidAmount = hostelFees.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
          const pendingAmount = hostelFees.filter(f => f.status === 'Pending Review').reduce((sum, f) => sum + f.amount, 0);

          setSummaryStats({
            title1: 'Total Invoiced', val1: `₹${paidAmount + unpaidAmount + pendingAmount}`,
            title2: 'Rent Collected', val2: `₹${paidAmount}`,
            title3: 'Outstanding Due', val3: `₹${unpaidAmount}`,
            title4: 'Pending Verification', val4: `₹${pendingAmount}`
          });
        } else if (reportType === 'complaints') {
          const complaints = complaintsData;
          const students = usersData.filter(u => u.role === 'student' && u.hostelId === user.hostelId);
          const studentIds = students.map(s => s.id);
          
          const hostelComplaints = complaints.filter(c => studentIds.includes(c.studentId));
          setReportData(hostelComplaints);

          const resolved = hostelComplaints.filter(c => c.status === 'Resolved').length;
          const pending = hostelComplaints.filter(c => c.status === 'Pending').length;
          const inProgress = hostelComplaints.filter(c => c.status === 'In Progress').length;

          setSummaryStats({
            title1: 'Total Tickets', val1: hostelComplaints.length,
            title2: 'Pending Tickets', val2: pending,
            title3: 'In-Progress Tickets', val3: inProgress,
            title4: 'Resolution Rate', val4: hostelComplaints.length ? `${Math.round((resolved / hostelComplaints.length) * 100)}%` : '0%'
          });
        }
      } catch (err) {
        console.error('Failed to load reports stats:', err);
        setError('Failed to fetch statistics and report details.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReport();
    }
  }, [reportType, user]);

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];

    if (reportType === 'occupancy') {
      headers = ['Room No', 'Room Type', 'Floor', 'Monthly Rent (INR)', 'Occupancy', 'Occupants', 'Status'];
      rows = reportData.map(r => [
        r.roomNo,
        r.type,
        r.floor,
        r.rent,
        r.occupancy,
        `"${r.occupants}"`,
        r.status
      ]);
    } else if (reportType === 'financial') {
      headers = ['Invoice No', 'Student Name', 'Billing Month', 'Amount (INR)', 'Payment Status', 'Paid Date'];
      rows = reportData.map(r => [
        r.invoiceNo,
        r.studentName,
        r.month,
        r.amount,
        r.status,
        r.date || 'N/A'
      ]);
    } else if (reportType === 'complaints') {
      headers = ['Ticket ID', 'Student', 'Room', 'Category', 'Issue Title', 'Priority', 'Status', 'Filing Date'];
      rows = reportData.map(r => [
        r.id,
        r.studentName,
        r.roomNo,
        r.category,
        `"${r.title}"`,
        r.priority,
        r.status,
        r.date
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Reports Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and export CSV datasheets for operations, revenue, and guest complaints.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-650 text-white rounded-xl text-xs font-bold hover:bg-indigo-755 transition-all shadow-md shadow-indigo-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Report Category */}
      <div className="bg-white dark:bg-slate-955 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-slate-450 dark:text-slate-500 flex items-center gap-1.5 shrink-0 px-1">
          <Filter className="w-4.5 h-4.5" /> Select Report:
        </span>
        
        <button
          onClick={() => setReportType('occupancy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            reportType === 'occupancy'
              ? 'bg-indigo-650 text-white border-indigo-650 shadow-md shadow-indigo-600/5'
              : 'bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4.5 h-4.5" /> Room Occupancy
        </button>

        <button
          onClick={() => setReportType('financial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            reportType === 'financial'
              ? 'bg-indigo-650 text-white border-indigo-650 shadow-md shadow-indigo-600/5'
              : 'bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4.5 h-4.5" /> Fees & Finances
        </button>

        <button
          onClick={() => setReportType('complaints')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            reportType === 'complaints'
              ? 'bg-indigo-650 text-white border-indigo-650 shadow-md shadow-indigo-600/5'
              : 'bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4.5 h-4.5" /> Grievance Tickets
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: summaryStats.title1, value: summaryStats.val1 },
          { title: summaryStats.title2, value: summaryStats.val2 },
          { title: summaryStats.title3, value: summaryStats.val3 },
          { title: summaryStats.title4, value: summaryStats.val4 }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">{stat.title}</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Report Data Table view */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-550 dark:text-indigo-400" />
          <h3 className="font-extrabold text-sm capitalize">{reportType} Ledger Table</h3>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'occupancy' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-850">
                  <th className="px-6 py-4">Room No</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Floor</th>
                  <th className="px-6 py-4">Monthly Rent</th>
                  <th className="px-6 py-4">Occupancy Ratio</th>
                  <th className="px-6 py-4">Current Tenants</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.roomNo}</td>
                    <td className="px-6 py-4">{row.type}</td>
                    <td className="px-6 py-4 text-slate-500">{row.floor}</td>
                    <td className="px-6 py-4 font-semibold">₹{row.rent}</td>
                    <td className="px-6 py-4">{row.occupancy}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={row.occupants}>
                      {row.occupants}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Fully Booked'
                          ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-400 border border-emerald-250/50'
                          : row.status === 'Empty'
                          ? 'bg-red-50 dark:bg-red-955/35 text-red-650 dark:text-red-400 border border-red-250/50'
                          : 'bg-amber-50 dark:bg-amber-955/35 text-amber-650 dark:text-amber-400 border border-amber-250/50'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'financial' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-850">
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Billing Month</th>
                  <th className="px-6 py-4">Invoiced Amount</th>
                  <th className="px-6 py-4">Paid Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.invoiceNo}</td>
                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-200">{row.studentName}</td>
                    <td className="px-6 py-4 text-slate-500">{row.month}</td>
                    <td className="px-6 py-4 font-semibold">₹{row.amount}</td>
                    <td className="px-6 py-4 text-slate-500">{row.date || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Paid'
                          ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-400 border border-emerald-250/50'
                          : row.status === 'Unpaid'
                          ? 'bg-red-50 dark:bg-red-955/35 text-red-650 dark:text-red-400 border border-red-250/50'
                          : 'bg-indigo-50 dark:bg-indigo-955/35 text-indigo-650 dark:text-indigo-400 border border-indigo-250/50'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'complaints' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-850">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Tenant (Room)</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Issue Description</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Date Filed</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase">{row.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-200">
                      {row.studentName} <span className="text-[10px] text-slate-400 font-normal">({row.roomNo})</span>
                    </td>
                    <td className="px-6 py-4">{row.category}</td>
                    <td className="px-6 py-4 font-medium text-slate-650 dark:text-slate-350 max-w-[200px] truncate" title={row.title}>
                      {row.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.priority === 'High'
                          ? 'bg-red-500/10 text-red-500'
                          : row.priority === 'Medium'
                          ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Resolved'
                          ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-400 border border-emerald-250/50'
                          : row.status === 'In Progress'
                          ? 'bg-indigo-50 dark:bg-indigo-955/35 text-indigo-650 dark:text-indigo-400 border border-indigo-250/50'
                          : 'bg-red-50 dark:bg-red-955/35 text-red-650 dark:text-red-400 border border-red-250/50'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
