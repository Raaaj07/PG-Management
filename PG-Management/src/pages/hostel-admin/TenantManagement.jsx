import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { Search, Plus, Trash2, AlertCircle } from 'lucide-react';

export const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTenant, setNewTenant] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    college: '', // college key in database represents Affiliation/College/Workplace
    roomNo: '101',
    emergencyContact: '',
    address: '',
    gender: 'Male'
  });

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/users');
      const studentUsers = response.data.data.filter(u => u.role === 'student');
      setTenants(studentUsers);
    } catch (err) {
      console.error('Failed to load tenants:', err);
      setError('Failed to fetch resident tenant directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTenant = async (e) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.email) return;
    setError(null);

    const added = {
      id: `user-${Date.now()}`,
      name: newTenant.name,
      email: newTenant.email,
      role: 'student', // Keep student role internally
      hostelId: 'hostel-1',
      hostelName: 'Elite Residency PG',
      roomId: `room-${newTenant.roomNo}`,
      roomNo: newTenant.roomNo,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      phone: newTenant.phone || '+91 99999 88888',
      college: newTenant.college || 'Self Employed',
      emergencyContact: newTenant.emergencyContact || '+91 99999 00000',
      address: newTenant.address || 'Not Specified',
      gender: newTenant.gender
    };

    setLoading(true);
    try {
      await client.post('/users', added);
      setTenants([...tenants, added]);
      setShowAddModal(false);
      setNewTenant({ 
        name: '', 
        email: '', 
        phone: '', 
        college: '', 
        roomNo: '101',
        emergencyContact: '',
        address: '',
        gender: 'Male'
      });
    } catch (err) {
      console.error('Failed to create tenant:', err);
      setError('Failed to register new tenant.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Are you sure you want to checkout and remove this tenant?')) {
      setError(null);
      try {
        await client.delete(`/users/${tenantId}`);
        const updated = tenants.filter(u => u.id !== tenantId);
        setTenants(updated);
      } catch (err) {
        console.error('Failed to delete tenant:', err);
        setError('Failed to remove tenant.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Resident Tenant Directory</h1>
          <p className="text-xs text-slate-500 font-medium">Register, search, or view active PG tenant documentation profiles.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm transition-colors">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by tenant name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-955 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-855 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 font-semibold">Tenant Details</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">College / Workplace</th>
                <th className="p-4 font-semibold">Room No</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-850" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h4>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">{t.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-655 dark:text-slate-350">{t.phone}</td>
                  <td className="p-4 font-medium text-slate-650 dark:text-slate-350">{t.college}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                      Room {t.roomNo || 'Not Allocated'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteTenant(t.id)}
                      className="p-1.5 bg-red-50 dark:bg-red-955/20 text-red-650 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      title="Checkout tenant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-850 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Onboard New Tenant</h3>
            <p className="text-xs text-slate-505 mb-6">Create a tenant login account and assign physical room details.</p>

            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tenant Full Name</label>
                  <input
                    type="text"
                    required
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    placeholder="e.g. Aman Gupta"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                    placeholder="e.g. tenant@gmail.com"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                    placeholder="+91 99999 88888"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1.5">Gender</label>
                  <select
                    value={newTenant.gender}
                    onChange={(e) => setNewTenant({ ...newTenant, gender: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">Emergency Contact</label>
                  <input
                    type="text"
                    required
                    value={newTenant.emergencyContact}
                    onChange={(e) => setNewTenant({ ...newTenant, emergencyContact: e.target.value })}
                    placeholder="+91 99999 00000"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1.5">College / Company</label>
                  <input
                    type="text"
                    required
                    value={newTenant.college}
                    onChange={(e) => setNewTenant({ ...newTenant, college: e.target.value })}
                    placeholder="e.g. Amity University or TCS"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1.5">Permanent Address</label>
                  <input
                    type="text"
                    required
                    value={newTenant.address}
                    onChange={(e) => setNewTenant({ ...newTenant, address: e.target.value })}
                    placeholder="Physical address"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Assigned Room Number</label>
                <select
                  value={newTenant.roomNo}
                  onChange={(e) => setNewTenant({ ...newTenant, roomNo: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none text-slate-955 dark:text-white"
                >
                  <option value="101">Room 101 (Double Sharing)</option>
                  <option value="102">Room 102 (Single Room)</option>
                  <option value="103">Room 103 (Double Sharing)</option>
                  <option value="104">Room 104 (Triple Sharing)</option>
                  <option value="Not Allocated">Not Allocated</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md animate-pulse-once"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
