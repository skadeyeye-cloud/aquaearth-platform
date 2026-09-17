'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, DollarSign, Shield, Sparkles, Check, Building2, User } from 'lucide-react';
import { PayrollRecord, CustomBenefit } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface EditCompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecord | null;
  onSave: (updatedRecord: PayrollRecord) => void;
}

export function EditCompensationModal({
  isOpen,
  onClose,
  record,
  onSave
}: EditCompensationModalProps) {
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [hazardAllowance, setHazardAllowance] = useState<number>(0);
  const [fieldPerDiem, setFieldPerDiem] = useState<number>(0);
  const [performanceBonus, setPerformanceBonus] = useState<number>(0);
  const [pensionDeduction, setPensionDeduction] = useState<number>(0);
  const [taxPaye, setTaxPaye] = useState<number>(0);
  const [customBenefits, setCustomBenefits] = useState<CustomBenefit[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'DRAFT' | 'APPROVED' | 'DISBURSED'>('DRAFT');

  // New Benefit Form State
  const [newBenefitName, setNewBenefitName] = useState('');
  const [newBenefitAmount, setNewBenefitAmount] = useState<string>('');

  useEffect(() => {
    if (record) {
      setBaseSalary(record.baseSalaryNgn || 0);
      setHazardAllowance(record.hazardAllowanceNgn || 0);
      setFieldPerDiem(record.fieldPerDiemNgn || 0);
      setPerformanceBonus(record.performanceBonusNgn || 0);
      setPensionDeduction(record.pensionDeductionNgn || 0);
      setTaxPaye(record.taxPayeNgn || 0);
      setCustomBenefits(record.customBenefits ? [...record.customBenefits] : []);
      setPaymentStatus(record.paymentStatus || 'DRAFT');
      setNewBenefitName('');
      setNewBenefitAmount('');
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const totalCustomBenefits = customBenefits.reduce((acc, b) => acc + (Number(b.amountNgn) || 0), 0);
  const grossEarnings = baseSalary + hazardAllowance + fieldPerDiem + performanceBonus + totalCustomBenefits;
  const totalDeductions = pensionDeduction + taxPaye;
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  const handleAddCustomBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenefitName.trim()) return;
    const amount = parseFloat(newBenefitAmount) || 0;
    if (amount <= 0) return;

    const newBenefit: CustomBenefit = {
      id: `cb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newBenefitName.trim(),
      amountNgn: amount
    };

    setCustomBenefits(prev => [...prev, newBenefit]);
    setNewBenefitName('');
    setNewBenefitAmount('');
    haptics.selection();
  };

  const handleRemoveCustomBenefit = (id: string) => {
    setCustomBenefits(prev => prev.filter(b => b.id !== id));
    haptics.impact();
  };

  const handleBenefitAmountChange = (id: string, newAmountStr: string) => {
    const val = parseFloat(newAmountStr) || 0;
    setCustomBenefits(prev => prev.map(b => b.id === id ? { ...b, amountNgn: val } : b));
  };

  const handleBenefitNameChange = (id: string, newName: string) => {
    setCustomBenefits(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PayrollRecord = {
      ...record,
      baseSalaryNgn: baseSalary,
      hazardAllowanceNgn: hazardAllowance,
      fieldPerDiemNgn: fieldPerDiem,
      performanceBonusNgn: performanceBonus,
      customBenefits,
      pensionDeductionNgn: pensionDeduction,
      taxPayeNgn: taxPaye,
      netPayNgn: netPay,
      paymentStatus
    };

    onSave(updated);
    haptics.success();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0C0C0D] border border-black/[0.08] dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#FBFBFD] dark:bg-[#050505]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F6F4F0] tracking-tight">
                  Edit Compensation & Benefits
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A39E93]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{record.staffName}</span>
                  <span>•</span>
                  <span>{record.jobTitle}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{record.monthYear}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
            {/* Section 1: Base Salary & Standard Allowances */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-[#A39E93] uppercase tracking-wider">
                1. Core Remuneration & Field Allowances
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Base Salary (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-[#151517] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Performance Bonus (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={performanceBonus}
                      onChange={(e) => setPerformanceBonus(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-[#151517] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hazard Allowance (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={hazardAllowance}
                      onChange={(e) => setHazardAllowance(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-[#151517] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Field Per Diem (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={fieldPerDiem}
                      onChange={(e) => setFieldPerDiem(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-[#151517] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Custom Benefits & Subsidies */}
            <div className="space-y-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-[#A39E93] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    2. Custom Benefits & Executive Subsidies
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add custom health insurance, certifications, car, or connectivity benefits.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  +₦{totalCustomBenefits.toLocaleString()}
                </span>
              </div>

              {/* Current Custom Benefits List */}
              <div className="space-y-2">
                {customBenefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#151517] border border-black/[0.06] dark:border-white/[0.08]"
                  >
                    <input
                      type="text"
                      value={benefit.name}
                      onChange={(e) => handleBenefitNameChange(benefit.id, e.target.value)}
                      placeholder="Benefit description..."
                      className="flex-1 px-2 py-1 bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₦</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={benefit.amountNgn}
                        onChange={(e) => handleBenefitAmountChange(benefit.id, e.target.value)}
                        className="w-full pl-6 pr-2 py-1 bg-white dark:bg-[#0C0C0D] border border-black/[0.08] dark:border-white/[0.08] rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomBenefit(benefit.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Remove benefit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {customBenefits.length === 0 && (
                  <div className="p-3 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                    No custom benefits configured for this staff record yet.
                  </div>
                )}
              </div>

              {/* Add New Benefit Sub-form */}
              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl">
                <input
                  type="text"
                  placeholder="New Benefit Name (e.g. Remote Fiber Allowance)"
                  value={newBenefitName}
                  onChange={(e) => setNewBenefitName(e.target.value)}
                  className="flex-1 w-full px-3 py-1.5 bg-white dark:bg-[#0C0C0D] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <div className="relative w-full sm:w-36 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₦</span>
                  <input
                    type="number"
                    placeholder="Amount"
                    min="0"
                    step="1000"
                    value={newBenefitAmount}
                    onChange={(e) => setNewBenefitAmount(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-white dark:bg-[#0C0C0D] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-mono text-slate-900 dark:text-white text-right focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomBenefit}
                  disabled={!newBenefitName.trim() || !newBenefitAmount}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Benefit</span>
                </button>
              </div>
            </div>

            {/* Section 3: Statutory Deductions */}
            <div className="space-y-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-[#A39E93] uppercase tracking-wider">
                3. Statutory Deductions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PAYE Income Tax (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={taxPaye}
                      onChange={(e) => setTaxPaye(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-[#151517] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employee Pension 8% (NGN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={pensionDeduction}
                      onChange={(e) => setPensionDeduction(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-[#151517] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Live Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-[#A39E93]">
                <span>Gross Remuneration:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  ₦{grossEarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400">
                <span>Total Statutory Deductions:</span>
                <span className="font-mono font-semibold">
                  -₦{totalDeductions.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Net Monthly Payout:</span>
                <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tnum">
                  ₦{netPay.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Section 5: Payment Status */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Payroll Cycle Status
              </label>
              <div className="flex items-center gap-2">
                {(['DRAFT', 'APPROVED', 'DISBURSED'] as const).map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => {
                      setPaymentStatus(status);
                      haptics.selection();
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      paymentStatus === status
                        ? status === 'DISBURSED'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : status === 'APPROVED'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs active:scale-[0.97] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Compensation Figures</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
