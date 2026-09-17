'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Send, 
  RotateCcw, 
  Trash2, 
  FileCheck2, 
  AlertTriangle,
  Building2,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { BudgetRequest } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface CfoVettingModalProps {
  isOpen: boolean;
  budget: BudgetRequest | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CfoVettingModal({ isOpen, budget, onClose, onSuccess }: CfoVettingModalProps) {
  const { currentUser, cfoReviewBudget } = useAuth();
  const [action, setAction] = useState<'PROJECT_TO_DR_K' | 'DECLINE_REVISE' | 'DECLINE_DROP'>('PROJECT_TO_DR_K');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !budget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);
    haptics.impact();

    cfoReviewBudget(budget.id, action, notes.trim());

    haptics.success();
    setIsSubmitting(false);
    setNotes('');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">CFO Executive Vetting</h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Erica (CFO) • Official Financial Gatekeeping</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Budget Snapshot */}
          <div className="p-4 mx-5 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2 shrink-0 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900 dark:text-white">{budget.requestNumber}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                ₦{budget.amountNgn.toLocaleString()} NGN
              </span>
            </div>
            <div className="text-slate-700 dark:text-slate-200 font-medium line-clamp-1">{budget.title}</div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700/60">
              <span>Department: <strong className="text-slate-700 dark:text-slate-300">{budget.department}</strong></span>
              <span>Collated By: <strong className="text-slate-700 dark:text-slate-300">{budget.collatedByName || 'Finance Office'}</strong></span>
            </div>
            {budget.collationNotes && (
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200">Collator Note: </span>
                {budget.collationNotes}
              </div>
            )}
          </div>

          {/* Decision Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Select CFO Determination per SOP
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setAction('PROJECT_TO_DR_K'); setNotes('Figures vetted and reconciled against operational cashflow forecasts. Projected for MD approval.'); }}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    action === 'PROJECT_TO_DR_K'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Send className="w-4 h-4 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold">Project to MD</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Dr. Kaine / Bibi</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAction('DECLINE_REVISE'); setNotes('Please adjust line item allocations for logistics and re-estimate fuel surcharge.'); }}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    action === 'DECLINE_REVISE'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 mb-1.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-bold">Revise</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Return to Dept</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAction('DECLINE_DROP'); setNotes('Dropped due to capital ceiling reallocation.'); }}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    action === 'DECLINE_DROP'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Trash2 className="w-4 h-4 mb-1.5 text-rose-600 dark:text-rose-400" />
                  <span className="text-[11px] font-bold">Drop Budget</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Permanent Decline</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                CFO Executive Comments & Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Enter financial vetting notes or instructions for revision..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
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
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 ${
                  action === 'PROJECT_TO_DR_K'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : action === 'DECLINE_REVISE'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Processing...' : 'Apply CFO Vetting'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
