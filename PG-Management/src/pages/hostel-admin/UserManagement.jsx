import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { 
  Search, Plus, Trash2, Edit2, Key, ToggleLeft, ToggleRight, 
  X, Check, Clipboard, AlertCircle, Users, ShieldAlert, ArrowRight, ShieldCheck 
} from 'lucide-react';

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'warden'
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTempPassword, setActiveTempPassword] = useState(null); // Plaintext temp pass from server
  const [copied, setCopied] = useState(false);

  // Form States
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    college: '', // Tenant specific
    roomNo: '101', // Tenant specific
    emergencyContact: '',
    address: ''
  });

  const [editUserData, setEditUserData] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/users');
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to load users list:', err);
      setError('Failed to fetch user directory accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopyPassword = () => {
    if (activeTempPassword) {
      navigator.clipboard.writeText(activeTempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredUsers = users.filter(u => {
    if (u.role !== activeTab) return false;
    const term = search.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;
    setError(null);
    setLoading(true);

    const payload = {
      id: `user-${Date.now()}`,
      name: newUserData.name,
      email: newUserData.email,
      phone: newUserData.phone || '+91 99999 88888',
      gender: newUserData.gender,
      role: activeTab, // Defaults to student or warden depending on tab
      emergencyContact: newUserData.emergencyContact || '+91 99999 00000',
      address: newUserData.address || 'Not Specified',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
    };

    if (activeTab === 'student') {
      payload.college = newUserData.college || 'Self Employed';
      payload.roomNo = newUserData.roomNo || 'Unallocated';
      payload.roomId = `room-${newUserData.roomNo}`;
    }

    try {
      const response = await client.post('/users', payload);
      if (response.data.success) {
        setUsers([...users, response.data.data]);
        setActiveTempPassword(response.data.tempPassword); // Capture temp password!
        setShowAddModal(false);
        setNewUserData({
          name: '',
          email: '',
          phone: '',
          gender: 'Male',
          college: '',
          roomNo: '101',
          emergencyContact: '',
          address: ''
        });
      }
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.error || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserData.name || !editUserData.email) return;
    setError(null);
    setLoading(true);

    try {
      const response = await client.put(`/users/${editUserData.id}`, editUserData);
      if (response.data.success) {
        const updatedUsers = users.map(u => u.id === editUserData.id ? response.data.data : u);
        setUsers(updatedUsers);
        setShowEditModal(false);
        setEditUserData(null);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.error || 'Failed to save profile changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    setError(null);
    try {
      const response = await client.post(`/users/${userId}/reset-password`);
      if (response.data.success) {
        setActiveTempPassword(response.data.tempPassword);
      }
    } catch (err) {
      console.error('Failed to reset password:', err);
      setError('Failed to generate reset password.');
    }
  };

  const toggleDeactivateUser = async (userObj) => {
    setError(null);
    const updatedStatus = userObj.status === 'Deactivated' ? 'Active' : 'Deactivated';
    try {
      const response = await client.put(`/users/${userObj.id}`, { status: updatedStatus });
      if (response.data.success) {
        const updatedUsers = users.map(u => u.id === userObj.id ? response.data.data : u);
        setUsers(updatedUsers);
      }
    } catch (err) {
      console.error('Failed to change user status:', err);
      setError('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action is destructive and cannot be undone.')) {
      setError(null);
      try {
        await client.delete(`/users/${userId}`);
        const updated = users.filter(u => u.id !== userId);
        setUsers(updated);
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError('Failed to remove user account.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Unified Identity Directory</h1>
          <p className="text-xs text-slate-500 font-medium dark:text-slate-400">Onboard, modify roles, reset passwords, or suspend access for tenants and staff.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-650 dark:bg-indigo-600 hover:bg-indigo-755 text-white dark:text-white dark:hover:bg-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Add {activeTab === 'student' ? 'Resident Tenant' : 'Warden'}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Temporary Password Alert */}
      {activeTempPassword && (
        <div className="p-5 bg-amber-50 dark:bg-amber-955/25 border border-amber-250 dark:border-amber-900/30 text-amber-900 dark:text-amber-400 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-3 items-start sm:items-center">
            <Key className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">One-Time Password Generated</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Please share this temporary password. The user must reset it upon next login.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-sm bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 px-3 py-1.5 rounded-lg font-bold text-slate-900 dark:text-white select-all">
              {activeTempPassword}
            </span>
            <button
              onClick={handleCopyPassword}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 cursor-pointer flex items-center justify-center"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Clipboard className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setActiveTempPassword(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Select & Search Header */}
      <div className="bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
        <div className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 self-start">
          <button
            onClick={() => { setActiveTab('student'); setSearch(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Resident Tenants
          </button>
          <button
            onClick={() => { setActiveTab('warden'); setSearch(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'warden'
                ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Warden Staff
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder={`Search by name, email...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:border-indigo-500 transition-all text-slate-955 dark:text-white"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-855 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 font-semibold">User Details</th>
                <th className="p-4 font-semibold">Contact Info</th>
                {activeTab === 'student' ? (
                  <>
                    <th className="p-4 font-semibold">College / Workplace</th>
                    <th className="p-4 font-semibold">Room No</th>
                  </>
                ) : (
                  <>
                    <th className="p-4 font-semibold">Address Details</th>
                    <th className="p-4 font-semibold">Gender</th>
                  </>
                )}
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'student' ? 6 : 6} className="p-12 text-center text-slate-450 dark:text-slate-500">
                    No users found matching query in this directory tab.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userObj) => (
                  <tr key={userObj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={userObj.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-850" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{userObj.name}</h4>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">{userObj.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-655 dark:text-slate-350">{userObj.phone}</td>
                    {activeTab === 'student' ? (
                      <>
                        <td className="p-4 font-medium text-slate-650 dark:text-slate-355">{userObj.college}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                            Room {userObj.roomNo || 'Not Allocated'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 font-medium text-slate-650 dark:text-slate-355 max-w-[200px] truncate">{userObj.address}</td>
                        <td className="p-4 font-semibold text-slate-655 dark:text-slate-350">{userObj.gender}</td>
                      </>
                    )}
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        userObj.status === 'Deactivated'
                          ? 'bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400'
                          : 'bg-emerald-50 dark:bg-emerald-955/25 text-emerald-650 dark:text-emerald-450'
                      }`}>
                        {userObj.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => toggleDeactivateUser(userObj)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            userObj.status === 'Deactivated'
                              ? 'bg-emerald-50 dark:bg-emerald-955/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                              : 'bg-red-50 dark:bg-red-955/20 border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                          }`}
                          title={userObj.status === 'Deactivated' ? 'Activate account' : 'Suspend account'}
                        >
                          {userObj.status === 'Deactivated' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditUserData({ ...userObj });
                            setShowEditModal(true);
                          }}
                          className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(userObj.id)}
                          className="p-1.5 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                          title="Generate reset password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userObj.id)}
                          className="p-1.5 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                          title="Delete account permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-850 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Onboard New {activeTab === 'student' ? 'Resident' : 'Warden'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">Create a new login profile. A temporary password will be shown upon confirmation.</p>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="E.g. Vikram Malhotra"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="name@eliteresidency.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="+91 99999 88888"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Gender</label>
                  <select
                    value={newUserData.gender}
                    onChange={(e) => setNewUserData({ ...newUserData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {activeTab === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">College / Affiliation</label>
                    <input
                      type="text"
                      value={newUserData.college}
                      onChange={(e) => setNewUserData({ ...newUserData, college: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Amity University or Self Employed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Initial Room No</label>
                    <input
                      type="text"
                      value={newUserData.roomNo}
                      onChange={(e) => setNewUserData({ ...newUserData, roomNo: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="E.g. 101 or Unallocated"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Emergency Contact</label>
                  <input
                    type="text"
                    value={newUserData.emergencyContact}
                    onChange={(e) => setNewUserData({ ...newUserData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Emergency Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Permanent Address</label>
                  <input
                    type="text"
                    value={newUserData.address}
                    onChange={(e) => setNewUserData({ ...newUserData, address: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Permanent Home Address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-655 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Onboard User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUserData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 rounded-3xl border border-slate-200 dark:border-slate-850 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Modify Profile Credentials</h3>
            <p className="text-xs text-slate-550 mb-6">Modify user contacts, emergency attributes, or suspended status.</p>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editUserData.name}
                    onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Gender</label>
                  <select
                    value={editUserData.gender}
                    onChange={(e) => setEditUserData({ ...editUserData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {editUserData.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">College / Affiliation</label>
                    <input
                      type="text"
                      value={editUserData.college}
                      onChange={(e) => setEditUserData({ ...editUserData, college: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Room Number</label>
                    <input
                      type="text"
                      value={editUserData.roomNo}
                      onChange={(e) => setEditUserData({ ...editUserData, roomNo: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Emergency Contact</label>
                  <input
                    type="text"
                    value={editUserData.emergencyContact}
                    onChange={(e) => setEditUserData({ ...editUserData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Permanent Address</label>
                  <input
                    type="text"
                    value={editUserData.address}
                    onChange={(e) => setEditUserData({ ...editUserData, address: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditUserData(null); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-655 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
