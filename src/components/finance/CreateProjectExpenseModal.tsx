'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Receipt, 
  Building2, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Wrench,
  FlaskConical,
  Compass,
  FileCheck2,
  Package,
  Layers
} from 'lucide-react';
import { ProjectExpenseCategory, ExpensePaymentMethod, ExpenseStatus } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface CreateProjectExpenseModalProps {
  isOpen: boolean;
  defaultProjectId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: Array<{ id: ProjectExpenseCategory; label: string; icon: any; color: string }> = [
  { id: 'EQUIPMENT_RENTAL', label: 'Equipment & Vessel Rental', icon: Wrench, color: 'text-amber-600 bg-amber-500/10' },
  { id: 'FIELD_OPERATIONS', label: 'Field Operations & Muster', icon: Compass, color: 'text-indigo-600 bg-indigo-500/10' },
  { id: 'LAB_TESTING', label: 'Laboratory Testing & Geotech', icon: FlaskConical, color: 'text-cyan-600 bg-cyan-500/10' },
  { id: 'LOGISTICS_TRAVEL', label: 'Logistics, Marine & Transit', icon: Truck, color: 'text-blue-600 bg-blue-500/10' },
  { id: 'REGULATORY_PERMITS', label: 'Regulatory & Port Permits', icon: FileCheck2, color: 'text-emerald-600 bg-emerald-500/10' },
  { id: 'SUBCONTRACTOR', label: 'Subcontractor / Specialist', icon: Building2, color: 'text-purple-600 bg-purple-500/10' },
  { id: 'MATERIALS_CONSUMABLES', label: 'Materials & PPE Consumables', icon: Package, color: 'text-orange-600 bg-orange-500/10' },
  { id: 'MISCELLANEOUS', label: 'Miscellaneous Direct Cost', icon: Layers, color: 'text-slate-600 bg-slate-500/10' }
];

export function CreateProjectExpenseModal({
  isOpen,
  defaultProjectId,
  onClose,
  onSuccess
}: CreateProjectExpenseModalProps) {
  const { projects, currentUser, createProjectExpense } = useAuth();

  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id || ''));
  const [category, setCategory] = useState<ProjectExpenseCategory>('FIELD_OPERATIONS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountNgn, setAmountNgn] = useState<number>(250000);
  const [vendor, setVendor] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>('BANK_TRANSFER');
  const [status, setStatus] = useState<ExpenseStatus>('PAID');
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

  if (!isOpen) return null;

  const selectedProject = projects.find(p => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select a valid project.');
      return;
    }
    if (!title.trim()) {
      setError('Expense title is required.');
      return;
    }
    if (amountNgn <= 0) {
      setError('Expense amount must be greater than ₦0.');
      return;
    }
    if (!vendor.trim()) {
      setError('Vendor / Payee name is required.');
      return;
    }

    setIsSubmitting(true);
    haptics.impact();

    try {
      createProjectExpense({
        expenseNumber: `EXP-2026-${Date.now().toString().slice(-4)}`,
        projectId,
        projectName: selectedProject?.title || 'Unknown Project',
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        amountNgn: Number(amountNgn),
        currency: 'NGN',
        date,
        vendor: vendor.trim(),
        receiptNumber: receiptNumber.trim() || undefined,
        status,
        paymentMethod,
        recordedById: currentUser.id,
        recordedByName: currentUser.name,
        approvedByName: currentUser.name,
        notes: notes.trim() || undefined
      });

      haptics.success();
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to log project expense.');
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
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">
                  Log Project Direct Expense
                </h3>
                <p className="text-xs text-[#86868B]">
                  Financial ledger & project cost accounting
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-[#1C1C1E]">
                      {p.projectCode} • {p.title} (₦{(p.contractValue || 0) / 1000000}M)
                    </option>
                  ))}
                </select>
              </div>
              {selectedProject && (
                <div className="mt-1.5 text-xs text-[#86868B] flex items-center justify-between">
                  <span>Client: <strong className="text-[#1D1D1F] dark:text-[#F6F4F0]">{selectedProject.clientName}</strong></span>
                  <span>Lead PM: <strong className="text-[#1D1D1F] dark:text-[#F6F4F0]">{selectedProject.leadPmName || 'Unassigned'}</strong></span>
                </div>
              )}
            </div>

            {/* Category Grid */}
            <div>
              <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                Expense Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500' 
                          : 'border-black/10 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-semibold line-clamp-1 text-[#1D1D1F] dark:text-[#F6F4F0]">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Expense Title / Line Item *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Geotechnical Sampling Vessel Charter - 7 Days"
                className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Amount (NGN ₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#86868B]">₦</span>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    required
                    value={amountNgn}
                    onChange={e => setAmountNgn(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
                <p className="text-[10px] text-[#86868B] mt-1 font-mono">
                  ₦{amountNgn.toLocaleString()} NGN
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Expense Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Vendor & Receipt Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Vendor / Contractor / Payee *
                </label>
                <input
                  type="text"
                  required
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  placeholder="e.g. Oceanic Marine Offshore Logistics Ltd"
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Invoice / Receipt Reference
                </label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  placeholder="e.g. INV-OML-8921 or REC-441"
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as ExpensePaymentMethod)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="BANK_TRANSFER">Bank Wire / Electronic Transfer</option>
                    <option value="PETTY_CASH">Petty Cash Imprest</option>
                    <option value="CORPORATE_CARD">Corporate Visa / Mastercard</option>
                    <option value="VENDOR_CREDIT">Vendor Credit / Net-30</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Payment Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ExpenseStatus)}
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="PAID">PAID (Disbursed)</option>
                  <option value="APPROVED">APPROVED (Pending Settlement)</option>
                  <option value="PENDING">PENDING (Review)</option>
                  <option value="RECONCILED">RECONCILED (Audit Verified)</option>
                </select>
              </div>
            </div>

            {/* Description & Technical Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Technical Purpose & Justification
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain the scope of equipment, field logistics, lab testing, or subcontractor deliverable..."
                className="w-full px-3.5 py-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Record Project Expense'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
