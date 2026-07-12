import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { ShieldCheck, ShieldAlert, ArrowRight, User, Mail, Lock, Phone, MapPin, Briefcase } from 'lucide-react';

export const RegisterPage = () => {
  const { registerTenant, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [pgName, setPgName] = useState('Elite Residency PG');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    college: '', // Acts as Affiliation (College / Company)
    emergencyContact: '',
    address: ''
  });

  useEffect(() => {
    const fetchHostelName = async () => {
      try {
        const response = await client.get('/hostels');
        if (response.data.data && response.data.data.length > 0) {
          setPgName(response.data.data[0].name);
        }
      } catch (err) {
        console.error('Failed to load hostel details:', err);
      }
    };
    fetchHostelName();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.college) {
      setError('Please fill in all the required fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await registerTenant(formData);
    if (result.success) {
      navigate('/tenant');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="md:col-span-8 bg-white dark:bg-slate-955 p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-xl flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                {pgName}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Apply for Admission</h2>
            <p className="mt-1 text-xs text-slate-500 font-medium">Create your tenant account to register details and submit your application.</p>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-1">1. Personal & Contact Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Amit Sharma"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-950 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Email Address *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></span>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. amit@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone className="w-4 h-4" /></span>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-950 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-955 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Emergency Contact *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone className="w-4 h-4" /></span>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="Parent/Guardian Contact"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-855 pb-1 mt-6">2. Profession & Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">College / Company Affiliation *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Briefcase className="w-4 h-4" /></span>
                    <input
                      type="text"
                      required
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. Amity University or TCS"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-950 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Permanent Physical Address *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><MapPin className="w-4 h-4" /></span>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Permanent address details"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-955 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-855 pb-1 mt-6">3. Security Credentials</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Password *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-955 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-955 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/10 mt-6 transition-all disabled:opacity-60"
              >
                {loading ? 'Submitting Application...' : 'Register as Tenant & Login'}
                {!loading && <ArrowRight className="w-4.5 h-4.5" />}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Info panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="md:col-span-4 bg-gradient-to-br from-indigo-955 to-slate-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase">Tenant Registration</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Admission Process</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Your details will be registered in the system. Once logged in, the PG Admin or Warden will allocate your room (Single, Double, or Triple Sharing) and generate your monthly rent invoices.
            </p>

            <h4 className="font-semibold text-xs text-indigo-300 mb-2">Required for Check-in:</h4>
            <ul className="text-[10px] text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>Govt. ID Proof (Aadhaar / Passport)</li>
              <li>College ID / Workplace Offer Letter</li>
              <li>Two passport-sized photographs</li>
              <li>First month advance rent payment</li>
            </ul>
          </div>

          <div className="text-[10px] text-slate-500">
            Already have a tenant account?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:underline">Sign In</Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
