import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { Search, Filter, Plus, Bell, Check, Trash2, AlertCircle, Receipt } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/PageHeader';
import { SkeletonTableRow } from '../../components/ui/Skeleton';

export const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ studentId: '', amount: 12000, month: 'July 2026' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [feesRes, usersRes] = await Promise.all([
        client.get('/fees'),
        client.get('/users')
      ]);
      setFees(feesRes.data.data);
      const studentUsers = usersRes.data.data.filter(u => u.role === 'student');
      setStudents(studentUsers);
      if (studentUsers.length > 0 && !newInvoice.studentId) {
        setNewInvoice(prev => ({ ...prev, studentId: studentUsers[0].id }));
      }
    } catch (err) {
      console.error('Failed to load fees data:', err);
      setError('Failed to fetch fee invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFees = fees.filter(f => {
    const matchesSearch = f.studentName.toLowerCase().includes(search.toLowerCase()) || f.invoiceNo.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'All' || f.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const approvePayment = async (feeId) => {
    setError(null);
    try {
      const feesRes = await client.get('/fees');
      const target = feesRes.data.data.find(f => f.id === feeId);
      if (!target) return;

      const updatedFee = { ...target, status: 'Paid', date: new Date().toISOString().split('T')[0] };
      await client.put(`/fees/${feeId}`, updatedFee);

      const updated = fees.map(f => {
        if (f.id === feeId) {
          return { ...f, status: 'Paid', date: new Date().toISOString().split('T')[0] };
        }
        return f;
      });
      setFees(updated);
      toast.success('Payment marked as paid');
    } catch (err) {
      console.error('Failed to approve payment:', err);
      setError('Failed to update payment status to Paid.');
      toast.error('Failed to update payment status.');
    }
  };

  const sendReminder = (studentName) => {
    toast.success(`Reminder sent to ${studentName}`, { icon: '📩' });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError(null);
    const selectedStudent = students.find(s => s.id === newInvoice.studentId);
    if (!selectedStudent) return;

    const added = {
      id: `fee-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      amount: parseFloat(newInvoice.amount) || 10000,
      month: newInvoice.month,
      status: 'Unpaid',
      date: null,
      invoiceNo: `INV-2026-00${fees.length + 1}`
    };

    setSubmitting(true);
    try {
      await client.post('/fees', added);
      setFees([...fees, added]);
      setShowAddModal(false);
      toast.success('Invoice generated successfully');
    } catch (err) {
      console.error('Failed to create invoice:', err);
      setError('Failed to create fee invoice.');
      toast.error('Failed to create fee invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteInvoice = async () => {
    if (!confirmDeleteId) return;
    setError(null);
    setDeleting(true);
    try {
      await client.delete(`/fees/${confirmDeleteId}`);
      setFees(fees.filter(f => f.id !== confirmDeleteId));
      toast.success('Invoice deleted');
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      setError('Failed to delete fee invoice.');
      toast.error('Failed to delete fee invoice.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee & Invoicing Management"
        subtitle="Record tenant rent payments, generate invoices, or send reminder alerts."
        actions={
          <Button icon={Plus} onClick={() => setShowAddModal(true)}>
            Create Invoice
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between transition-colors">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by name, invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4.5 h-4.5 text-slate-455 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Pending Review">Pending Review</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 font-semibold">Invoice No</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Billing Month</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={Receipt} title="No invoices found" description="Try adjusting your search or filters, or create a new invoice." />
                  </td>
                </tr>
              ) : (
                filteredFees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-500">{f.invoiceNo}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{f.studentName}</td>
                    <td className="p-4 font-semibold">{f.month}</td>
                    <td className="p-4 font-bold text-indigo-650 dark:text-indigo-400">${f.amount}</td>
                    <td className="p-4">
                      <Badge status={f.status} />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-1.5 items-center">
                      {f.status === 'Pending Review' && (
                        <button
                          onClick={() => approvePayment(f.id)}
                          title="Approve Payment"
                          className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {f.status !== 'Paid' && (
                        <button
                          onClick={() => sendReminder(f.studentName)}
                          title="Send Reminder SMS/Mail"
                          className="p-1.5 bg-amber-55/10 text-amber-550 rounded-lg hover:bg-amber-100/30 transition-colors cursor-pointer"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDeleteId(f.id)}
                        title="Delete Invoice"
                        className="p-1.5 bg-red-50 dark:bg-red-955/20 text-red-650 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Generate Monthly Invoice"
        description="Select a student and monthly billing range to trigger an invoice."
        icon={Receipt}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="create-invoice-form" loading={submitting}>Generate Invoice</Button>
          </>
        }
      >
        <form id="create-invoice-form" onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">Select Resident Student</label>
            <select
              value={newInvoice.studentId}
              onChange={(e) => setNewInvoice({ ...newInvoice, studentId: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-950 dark:text-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (Room {s.roomNo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">Invoice Amount ($)</label>
              <input
                type="number"
                required
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-955 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">Billing Period</label>
              <input
                type="text"
                required
                value={newInvoice.month}
                onChange={(e) => setNewInvoice({ ...newInvoice, month: e.target.value })}
                placeholder="e.g. July 2026"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-955 dark:text-white"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title="Delete this invoice?"
        description="This invoice record will be permanently removed."
        confirmLabel="Delete Invoice"
        loading={deleting}
        onConfirm={deleteInvoice}
      />
    </div>
  );
};
