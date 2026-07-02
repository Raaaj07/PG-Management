import React, { useState, useEffect } from 'react';
import { db } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Building, Clock, Save, Lock, AlertCircle } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [hostelData, setHostelData] = useState({
    name: '',
    type: 'PG',
    address: '',
    curfewTime: '10:00 PM',
    lateFine: '200',
    guestPolicy: 'Allowed until 8:00 PM. Overnight stay requires prior approval.'
  });
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    phone: '+91 99999 88888'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    // Fetch current hostel info
    const hostels = db.getHostels();
    const currentHostel = hostels.find(h => h.id === user.hostelId);
    if (currentHostel) {
      setHostelData({
        name: currentHostel.name,
        type: currentHostel.type || 'PG',
        address: currentHostel.address,
        curfewTime: currentHostel.curfewTime || '10:00 PM',
        lateFine: currentHostel.lateFine || '200',
        guestPolicy: currentHostel.guestPolicy || 'Allowed until 8:00 PM. Overnight stay requires prior approval.'
      });
    }
    
    // Fetch admin user profile details
    setAdminProfile({
      name: user.name,
      email: user.email,
      phone: user.phone || '+91 99999 88888'
    });
  }, [user]);

  const showNotification = (msg, type = 'success') => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    
    // Save hostel edits
    const hostels = db.getHostels();
    const idx = hostels.findIndex(h => h.id === user.hostelId);
    if (idx !== -1) {
      hostels[idx] = {
        ...hostels[idx],
        name: hostelData.name,
        type: hostelData.type,
        address: hostelData.address,
        curfewTime: hostelData.curfewTime,
        lateFine: hostelData.lateFine,
        guestPolicy: hostelData.guestPolicy
      };
      db.saveHostels(hostels);
    }

    // Save admin user name/profile changes
    const users = db.getUsers();
    const userIdx = users.findIndex(u => u.id === user.id);
    if (userIdx !== -1) {
      users[userIdx] = {
        ...users[userIdx],
        name: adminProfile.name,
        phone: adminProfile.phone
      };
      db.saveUsers(users);
      
      // Update local storage session
      localStorage.setItem('auth_user', JSON.stringify(users[userIdx]));
    }

    showNotification('General settings and hostel details updated successfully!');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showNotification('Please fill in password fields.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New password and confirmation do not match.', 'error');
      return;
    }

    // Simulate password updates
    showNotification('Password updated successfully! (Sandbox simulation)');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Profile & PG Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Modify PG branding profiles, configure curfew hours, fine rules, and secure login settings.
        </p>
      </div>

      {/* Alert Notifications */}
      {alert.show && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold transition-all ${
          alert.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-955/30 text-emerald-650 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
            : 'bg-red-50 dark:bg-red-955/30 text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/30'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          General & Hostel Info
        </button>
        <button
          onClick={() => setActiveTab('curfew')}
          className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'curfew'
              ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Curfew & Policies
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-455 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-xs">
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Building className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
              General Hostel Properties
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Hostel / PG Name *
                </label>
                <input
                  type="text"
                  required
                  value={hostelData.name}
                  onChange={(e) => setHostelData({ ...hostelData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Hostel Category
                </label>
                <select
                  value={hostelData.type}
                  onChange={(e) => setHostelData({ ...hostelData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="PG">Paying Guest (PG)</option>
                  <option value="Hostel">Standard Hostel</option>
                  <option value="Co-Living">Co-Living Space</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={hostelData.address}
                  onChange={(e) => setHostelData({ ...hostelData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pt-4 pb-3">
              <Settings className="w-4.5 h-4.5 text-indigo-555 dark:text-indigo-400" />
              Admin User Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminProfile.name}
                  onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Contact Mobile Number
                </label>
                <input
                  type="text"
                  value={adminProfile.phone}
                  onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 mb-1.5">
                  Email ID (Username - Cannot Edit)
                </label>
                <input
                  type="email"
                  disabled
                  value={adminProfile.email}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-450 dark:text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </form>
        )}

        {activeTab === 'curfew' && (
          <form onSubmit={handleSaveGeneral} className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Clock className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
              Curfew & Penalties Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Gate Closure / Curfew Time *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:00 PM"
                  value={hostelData.curfewTime}
                  onChange={(e) => setHostelData({ ...hostelData, curfewTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Late Entry Penalty Fine (INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={hostelData.lateFine}
                  onChange={(e) => setHostelData({ ...hostelData, lateFine: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Curfew Rule & Guest Policy Description
                </label>
                <textarea
                  rows="4"
                  value={hostelData.guestPolicy}
                  onChange={(e) => setHostelData({ ...hostelData, guestPolicy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-655 text-white rounded-xl text-xs font-bold hover:bg-indigo-755 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Policies
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Lock className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
              Reset Portal Login Password
            </h3>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Shield className="w-4 h-4" /> Save New Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
