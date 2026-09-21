'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Landmark, 
  Building2, 
  DollarSign, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface RecordClientReceiptModalProps {
  isOpen: boolean;
  defaultProjectId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CORPORATE_ACCOUNTS = [
  'Zenith Bank - 1014882910 (Corporate Operations)',
  'Access Bank - 0029384812 (Treasury & Retained Earnings)',
  'Standard Chartered - 5001928471 (Foreign Currency Domiciliary)',
  'First Bank - 2039182391 (Lekki Branch Tax Clearing)'
];

export function RecordClientReceiptModal({
  isOpen,
  defaultProjectId,
  onClose,
  onSuccess
}: RecordClientReceiptModalProps) {
  const { projects, invoices, currentUser, recordClientReceipt, getProjectFinancials } = useAuth();

  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id || ''));
  const [amountNgn, setAmountNgn] = useState<number>(5000000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReference, setPaymentReference] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [whtDeductedNgn, setWhtDeductedNgn] = useState<number>(250000);
  const [vatPaidNgn, setVatPaidNgn] = useState<number>(375000);
  const [bankAccount, setBankAccount] = useState(CORPORATE_ACCOUNTS[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [defaultProjectId, projects, isOpen]);

  // When amount changes, auto-suggest 5% WHT and 7.5% VAT
  const handleAmountChange = (val: number) => {
    setAmountNgn(val);
    setWhtDeductedNgn(Math.round(val * 0.05));
    setVatPaidNgn(Math.round(val * 0.075));
  };

  if (!isOpen) return null;

  const selectedProject = projects.find(p => p.id === projectId);
  const projectInvoices = invoices.filter(i => i.projectId === projectId);
  const financials = selectedProject ? getProjectFinancials(selectedProject.id) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select a project.');
      return;
    }
    if (amountNgn <= 0) {
      setError('Amount received must be greater than ₦0.');
      return;
    }
    if (!paymentReference.trim()) {
      setError('Wire / Transaction Reference is required for audit verification.');
      return;
    }
    if (!milestoneDescription.trim()) {
      setError('Payment description / milestone purpose is required.');
      return;
    }

    setIsSubmitting(true);
    haptics.impact();

    try {
      recordClientReceipt({
        receiptNumber: `REC-2026-${Date.now().toString().slice(-4)}`,
        projectId,
        projectName: selectedProject?.title || 'Unknown Project',
        clientId: selectedProject?.clientId || 'Unknown Client ID',
        clientName: selectedProject?.clientName || 'Unknown Client',
        amountNgn: Number(amountNgn),
        currency: 'NGN',
        paymentDate,
        paymentReference: paymentReference.trim(),
        milestoneDescription: milestoneDescription.trim(),
        invoiceId: invoiceId || undefined,
        whtDeductedNgn: Number(whtDeductedNgn) || 0,
        vatPaidNgn: Number(vatPaidNgn) || 0,
        bankAccount,
        recordedById: currentUser.id,
        recordedByName: currentUser.name,
        notes: notes.trim() || undefined
      });

      haptics.success();
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record client receipt.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">
                  Record Client Payment Receipt
                </h3>
                <p className="text-xs text-[#86868B]">
                  Treasury wire inflow & contract collection ledger
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F6F4F0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Project Select */}
            <div>
              <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Target Project *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-[#86868B]" />
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-[#1C1C1E]">
                      {p.projectCode} • {p.title} (₦{(p.contractValue || 0) / 1000000}M)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financial Telemetry Banner */}
            {financials && selectedProject && (
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#86868B]">Client: <strong className="text-[#1D1D1F] dark:text-[#F6F4F0]">{selectedProject.clientName}</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    Collected: ₦{(financials.totalReceivedNgn / 1000000).toFixed(2)}M / ₦{(financials.contractValueNgn / 1000000).toFixed(2)}M ({financials.collectionPercent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${Math.min(100, financials.collectionPercent)}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Amount Received (NGN ₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#86868B]">₦</span>
                  <input
                    type="number"
                    min="1"
                    step="10000"
                    required
                    value={amountNgn}
                    onChange={e => handleAmountChange(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <p className="text-[10px] text-[#86868B] mt-1 font-mono">
                  {amountNgn >= 1000000 ? `₦${(amountNgn / 1000000).toFixed(2)}M NGN` : `₦${amountNgn.toLocaleString()} NGN`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Payment / Value Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Wire Reference & Milestone Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  NIBSS / Wire Reference *
                </label>
                <input
                  type="text"
                  required
                  value={paymentReference}
                  onChange={e => setPaymentReference(e.target.value)}
                  placeholder="e.g. NIBSS-CHEV-2026-081192"
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Milestone Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneDescription}
                  onChange={e => setMilestoneDescription(e.target.value)}
                  placeholder="e.g. Advance Mobilization Payment (30%)"
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Receiving Account & Linked Invoice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Receiving Bank Account
                </label>
                <select
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {CORPORATE_ACCOUNTS.map(acc => (
                    <option key={acc} value={acc} className="bg-white dark:bg-[#1C1C1E]">
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Linked Invoice (Optional)
                </label>
                <select
                  value={invoiceId}
                  onChange={e => setInvoiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" className="bg-white dark:bg-[#1C1C1E]">None / Direct Wire</option>
                  {projectInvoices.map(inv => (
                    <option key={inv.id} value={inv.id} className="bg-white dark:bg-[#1C1C1E]">
                      {inv.invoiceNumber} (₦{(inv.netPayableNgn / 1000000).toFixed(1)}M - {inv.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tax Components (WHT & VAT) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  WHT Deducted at Source (₦ 5%)
                </label>
                <input
                  type="number"
                  min="0"
                  value={whtDeductedNgn}
                  onChange={e => setWhtDeductedNgn(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  VAT Component (₦ 7.5%)
                </label>
                <input
                  type="number"
                  min="0"
                  value={vatPaidNgn}
                  onChange={e => setVatPaidNgn(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Treasury Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Treasury Notes & Audit Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Bank settlement confirmation, client remittance advice reference..."
                className="w-full px-3.5 py-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F6F4F0] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Record Payment Inflow'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
