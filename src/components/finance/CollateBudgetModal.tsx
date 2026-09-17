'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Send, CheckCircle2 } from 'lucide-react';
import { BudgetRequest } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface CollateBudgetModalProps {
  isOpen: boolean;
  budget: BudgetRequest | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CollateBudgetModal({ isOpen, budget, onClose, onSuccess }: CollateBudgetModalProps) {
  const { currentUser, collateBudget } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !budget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);
    haptics.impact();

    collateBudget(budget.id, notes.trim());

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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Collate Departmental Budget</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Transmit to Erica (CFO) for Executive Vetting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 mx-5 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1 text-xs">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>{budget.requestNumber}</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">₦{budget.amountNgn.toLocaleString()} NGN</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300 line-clamp-1">{budget.title}</div>
            <div className="text-slate-500 text-[11px]">Dept: {budget.department} • Requester: {budget.requestedByName}</div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Collation Findings & Verification Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Confirm that line items align with quotation benchmarks and departmental limits before Erica (CFO) reviews..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

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
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting...' : 'Forward to Erica (CFO)'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
