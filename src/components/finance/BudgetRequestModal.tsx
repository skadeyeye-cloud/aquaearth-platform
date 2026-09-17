'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Briefcase
} from 'lucide-react';
import { BudgetCategory, BudgetType, BudgetFrequency } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface BudgetRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BudgetRequestModal({ isOpen, onClose, onSuccess }: BudgetRequestModalProps) {
  const { 
    currentUser, 
    projects, 
    submitDepartmentalBudget, 
    submitClientFacingBudget 
  } = useAuth();

  const [budgetType, setBudgetType] = useState<BudgetType>('DEPARTMENTAL');
  const [frequency, setFrequency] = useState<BudgetFrequency>('WEEKLY');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(currentUser.departmentName || 'Operations');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [amountNgn, setAmountNgn] = useState(1500000);
  const [category, setCategory] = useState<BudgetCategory>('FIELD_EXPEDITION');
  const [collatorTarget, setCollatorTarget] = useState<'GIFT' | 'MARVELOUS' | 'ERICA'>('GIFT');
  const [justification, setJustification] = useState('');
  const [miscellaneousAmountNgn, setMiscellaneousAmountNgn] = useState<number>(100000);
  const [miscellaneousJustification, setMiscellaneousJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalProposed = Number(amountNgn || 0) + Number(miscellaneousAmountNgn || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !justification.trim() || amountNgn <= 0) return;

    setIsSubmitting(true);
    haptics.impact();

    if (budgetType === 'DEPARTMENTAL') {
      submitDepartmentalBudget({
        title: title.trim(),
        department,
        amountNgn: Number(amountNgn),
        category,
        justification: justification.trim(),
        frequency,
        miscellaneousAmountNgn: Number(miscellaneousAmountNgn || 0),
        miscellaneousJustification: miscellaneousJustification.trim(),
        collatorTarget
      });
    } else {
      submitClientFacingBudget({
        title: title.trim(),
        projectId,
        amountNgn: Number(amountNgn),
        justification: justification.trim(),
        miscellaneousAmountNgn: Number(miscellaneousAmountNgn || 0),
        miscellaneousJustification: miscellaneousJustification.trim()
      });
    }

    haptics.success();
    setIsSubmitting(false);
    setTitle('');
    setJustification('');
    setMiscellaneousJustification('');
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
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Budget Request</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Official AquaEarth SOP Financial Gateway</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SOP Type Selector Tabs */}
          <div className="p-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="grid grid-cols-2 gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBudgetType('DEPARTMENTAL')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
                  budgetType === 'DEPARTMENTAL'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Departmental Budget</span>
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('CLIENT_FACING')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
                  budgetType === 'CLIENT_FACING'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Client-Facing Budget</span>
              </button>
            </div>
          </div>

          {/* SOP Governance Notice */}
          <div className="mx-5 mt-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-start gap-2.5 shrink-0 text-xs">
            <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            {budgetType === 'DEPARTMENTAL' ? (
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">Departmental SOP:</span> Submitted weekly/periodic budgets are collated by <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gift</span> or <span className="font-semibold text-emerald-600 dark:text-emerald-400">Marvelous</span>, vetted by <span className="font-semibold text-purple-600 dark:text-purple-400">Erica (CFO)</span>, and presented for final approval to <span className="font-semibold text-blue-600 dark:text-blue-400">Dr. Kaine Edike (MD)</span> or <span className="font-semibold text-blue-600 dark:text-blue-400">Bibi (2nd in Command)</span>.
              </div>
            ) : (
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">Client-Facing SOP:</span> PMs submit directly to <span className="font-semibold text-amber-600 dark:text-amber-400">Miss Ozioma (Senior Consultant)</span>, who presents directly to <span className="font-semibold text-blue-600 dark:text-blue-400">Dr. Kaine Edike</span>, with CFO notes synced.
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Budget Title / Objective <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={budgetType === 'DEPARTMENTAL' ? "e.g. Q3 Week 38 Geotechnical Field Operations & Fleet Maintenance" : "e.g. TotalEnergies Escravos Offshore Bathymetry Mobilization"}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {budgetType === 'DEPARTMENTAL' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Submission Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as BudgetFrequency)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="WEEKLY">Weekly Departmental Submission</option>
                    <option value="PER_PROJECT">Periodic / Project Advance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Route for Collation To</label>
                  <select
                    value={collatorTarget}
                    onChange={e => setCollatorTarget(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="GIFT">Gift (Finance Officer - Collation Lead)</option>
                    <option value="MARVELOUS">Marvelous (Finance Officer)</option>
                    <option value="ERICA">Erica (CFO - Direct Escalation)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Linked Client Project</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} - {p.title} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Core Allocation Amount (₦ NGN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={amountNgn}
                  onChange={e => setAmountNgn(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tnum font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Miscellaneous Contingency (₦ NGN)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={miscellaneousAmountNgn}
                  onChange={e => setMiscellaneousAmountNgn(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tnum"
                  placeholder="Optional contingency provision"
                />
              </div>
            </div>

            {/* Total Indicator Pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Combined Total Proposed:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                ₦{totalProposed.toLocaleString()} NGN
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expenditure Breakdown & Operational Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Detail the operational deliverables, equipment needed, crew per diems, or lab logistics required..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {miscellaneousAmountNgn > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Miscellaneous Justification (SOP Clause)
                </label>
                <input
                  type="text"
                  value={miscellaneousJustification}
                  onChange={e => setMiscellaneousJustification(e.target.value)}
                  placeholder="Specify unforeseen operational risks (e.g., weather standby, tidal delay, diesel surge)..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white"
                />
              </div>
            )}

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
                  budgetType === 'DEPARTMENTAL' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Routing Request...' : 'Submit to SOP Workflow'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
