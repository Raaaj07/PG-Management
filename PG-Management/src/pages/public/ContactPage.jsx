import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { db } from '../../data/mockData';

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [pgInfo, setPgInfo] = useState({
    name: 'Elite Residency PG',
    address: 'Sector 62, Noida, UP'
  });

  useEffect(() => {
    const hostels = db.getHostels();
    if (hostels && hostels.length > 0) {
      setPgInfo({
        name: hostels[0].name,
        address: hostels[0].address
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Contact Information */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-955 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Contact Us</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Have queries about room availability, amenities, pricing, or admissions? Send a message and our PG warden or management will respond within 24 hours.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-450">Email Address</h4>
                  <p className="text-sm font-bold">contact@eliteresidency.com</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-indigo-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-455">Admissions & Support</h4>
                  <p className="text-sm font-bold">+91 99999 88888</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-indigo-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-455">PG Address</h4>
                  <p className="text-sm font-bold">{pgInfo.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-6">
            © {new Date().getFullYear()} {pgInfo.name} Management
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-955 p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-xl transition-colors flex flex-col justify-center">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-2">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Inquiry Received!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out. We have received your inquiry and our warden will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-955 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Your Inquiry / Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Ask about room availability, food menu, curfew flexibility, etc."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-955 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/15"
              >
                Send Message / Inquiry
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
