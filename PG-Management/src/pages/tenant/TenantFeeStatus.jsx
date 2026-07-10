import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Search, CreditCard, CheckCircle, Clock, AlertCircle, ArrowUpRight, X } from 'lucide-react';

export default function TenantFeeStatus() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [error, setError] = useState(null);
  
  // Simulated checkout state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    method: 'upi',
    upiId: '',
    cardNo: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const fetchFees = async () => {
    setError(null);
    try {
      const response = await client.get('/fees');
      const myFees = response.data.data.filter(f => f.studentId === user.id);
      setFees(myFees);
    } catch (err) {
      console.error('Failed to load fees:', err);
      setError('Failed to fetch fee invoices.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchFees();
    }
  }, [user]);

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentSuccess(false);
    setPaymentLoading(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setError(null);
    
    try {
      const allFeesRes = await client.get('/fees');
      const target = allFeesRes.data.data.find(f => f.id === selectedInvoice.id);
      if (!target) {
        setPaymentLoading(false);
        return;
      }

      const dateToday = new Date().toISOString().split('T')[0];
      const updatedFee = { ...target, status: 'Pending Review', date: dateToday };
      await client.put(`/fees/${selectedInvoice.id}`, updatedFee);

      setPaymentSuccess(true);
      
      // Update local invoice state
      const updated = fees.map(f => {
        if (f.id === selectedInvoice.id) {
          return { ...f, status: 'Pending Review', date: dateToday };
        }
        return f;
      });
      setFees(updated);

      setTimeout(() => {
        setSelectedInvoice(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to pay invoice:', err);
      setError('Failed to process payment with server.');
      setSelectedInvoice(null);
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredFees = fees.filter(f => {
    if (activeTab === 'All') return true;
    return f.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Finances & Rent Invoices</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inspect monthly rental ledger sheets, trace payment dates, and complete outstanding dues online.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        {['All', 'Paid', 'Unpaid', 'Pending Review'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Invoice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFees.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-12 rounded-2xl text-center text-slate-450 dark:text-slate-500">
            No invoices found for this category.
          </div>
        ) : (
          filteredFees.map(invoice => (
            <div
              key={invoice.id}
              className="bg-white dark:bg-slate-955 border border-slate-250/60 dark:border-slate-850 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 font-mono uppercase block">{invoice.invoiceNo}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{invoice.month} Rent Charge</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-50 dark:bg-emerald-955/35 text-emerald-650 dark:text-emerald-450'
                      : invoice.status === 'Unpaid'
                      ? 'bg-red-50 dark:bg-red-955/35 text-red-655'
                      : 'bg-indigo-50 dark:bg-indigo-955/35 text-indigo-650'
                  }`}>
                    {invoice.status}
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-850 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Total Due</span>
                    <span className="text-xl font-extrabold text-indigo-650 dark:text-indigo-400">₹{invoice.amount}</span>
                  </div>
                  {invoice.date && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Processed On</span>
                      <span className="text-xs font-semibold text-slate-655 dark:text-slate-350">{invoice.date}</span>
                    </div>
                  )}
                </div>
              </div>

              {invoice.status === 'Unpaid' && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={() => handleOpenPayment(invoice)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" /> Pay Rent Online
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Simulated Checkout Sheet / Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base">Clear Rent Outstanding</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-405 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-full animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h4 className="font-extrabold text-base">Payment Submitted</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Your transaction was logged. Status changed to "Pending Review" waiting for Warden verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="p-3 bg-indigo-50/20 dark:bg-indigo-955/20 border border-indigo-200/50 dark:border-indigo-900/25 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 font-bold">Month: {selectedInvoice.month}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{selectedInvoice.invoiceNo}</span>
                  </div>
                  <span className="text-base font-extrabold text-indigo-650 dark:text-indigo-400">₹{selectedInvoice.amount}</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Payment Gateway Channel
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentDetails({ ...paymentDetails, method: 'upi' })}
                      className={`p-2 border rounded-xl transition-all cursor-pointer ${
                        paymentDetails.method === 'upi'
                          ? 'border-indigo-655 bg-indigo-50/10 text-indigo-650'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      UPI Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentDetails({ ...paymentDetails, method: 'card' })}
                      className={`p-2 border rounded-xl transition-all cursor-pointer ${
                        paymentDetails.method === 'card'
                          ? 'border-indigo-655 bg-indigo-50/10 text-indigo-650'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Credit/Debit Card
                    </button>
                  </div>
                </div>

                {paymentDetails.method === 'upi' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                      UPI Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@ybl or upi-id"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="16-digit card number"
                        value={paymentDetails.cardNo}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNo: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                          Expiration MM/YY
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={paymentDetails.cardExpiry}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          required
                          maxLength="3"
                          placeholder="CVV"
                          value={paymentDetails.cardCvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="w-full py-2 border border-slate-350 dark:border-slate-800 text-slate-655 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                  >
                    {paymentLoading ? 'Verifying Gateway...' : `Confirm UPI/Card payment`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
