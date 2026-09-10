'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, ShieldAlert, CheckCircle2, FileText, Tag, Briefcase } from 'lucide-react';
import { BudgetCategory } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface BudgetRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BudgetRequestModal({ isOpen, onClose, onSuccess }: BudgetRequestModalProps) {
  const { currentUser, submitBudgetRequest, projects } = useAuth();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(currentUser.departmentName || 'Operations');
  const [amountNgn, setAmountNgn] = useState(2500000);
  const [category, setCategory] = useState<BudgetCategory>('FIELD_EXPEDITION');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification of permission: Team Leads and Managers
  const canSubmit = 
    currentUser.managementTier !== 'NONE' || 
    currentUser.accessTier === 'ADMIN' || 
    currentUser.accessTier === 'SUPERADMIN' ||
    currentUser.functionalRole === 'FINANCE_ADMIN';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !justification.trim() || amountNgn <= 0) return;

    setIsSubmitting(true);
    haptics.impact();

    submitBudgetRequest({
      title: title.trim(),
      department,
      requestedById: currentUser.id,
      requestedByName: currentUser.name,
      amountNgn: Number(amountNgn),
      category,
      justification: justification.trim()
    });

    haptics.success();
    setIsSubmitting(false);
    setTitle('');
    setJustification('');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Budget Request</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Departmental & operational capital expenditure</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Governance Notice */}
          <div className="mx-6 mt-5 p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/20 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">Approval Routing:</span> Submitted budget requests are automatically routed to Admin-tier approvers (CEO / Managing Consultant, Finance Admin) and other Managers for evaluation and disbursement approval.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Request Title / Purpose <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Escravos Dredging Bathymetric Survey Mobilization Advance"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expenditure Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as BudgetCategory)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="FIELD_EXPEDITION">Field Expedition & Per Diem</option>
                  <option value="EQUIPMENT_PROCUREMENT">Equipment Procurement</option>
                  <option value="SOFTWARE_LICENSES">Software & Cloud Licenses</option>
                  <option value="SUBCONTRACTOR">Subcontractor Engagement</option>
                  <option value="OPERATIONAL_EXPENSE">General Operational Expense</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Amount Requested (₦ NGN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={amountNgn}
                  onChange={e => setAmountNgn(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tnum"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Business Justification & Expected Deliverables <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Explain the operational necessity, line items breakdown, deliverables to be achieved, and cost mitigation measures..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Routing Request...' : 'Submit for Approvals'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
