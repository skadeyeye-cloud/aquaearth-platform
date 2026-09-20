'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wallet, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Droplets,
  Wrench,
  FileSpreadsheet,
  Flame,
  Lock
} from 'lucide-react';
import { PettyCashCustodian, PettyCashCategory } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface PettyCashExpenseModalProps {
  isOpen: boolean;
  defaultCustodian?: PettyCashCustodian;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PettyCashExpenseModal({ 
  isOpen, 
  defaultCustodian = 'GIFT', 
  onClose, 
  onSuccess 
}: PettyCashExpenseModalProps) {
  const { currentUser, pettyCashFunds, logPettyCashExpense } = useAuth();

  const isGift = currentUser.id === 'usr-13' || currentUser.name.toLowerCase().includes('gift');
  const isMarvelous = currentUser.id === 'usr-14' || currentUser.name.toLowerCase().includes('marvelous');

  // Enforce initial custodian per logged in user
  const effectiveDefault: PettyCashCustodian = isGift ? 'GIFT' : isMarvelous ? 'MARVELOUS' : defaultCustodian;

  const [fundCustodian, setFundCustodian] = useState<PettyCashCustodian>(effectiveDefault);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountNgn, setAmountNgn] = useState<number>(15000);
  const [category, setCategory] = useState<PettyCashCategory>('WATER_PURCHASE');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync effective custodian when modal opens or user context changes
  React.useEffect(() => {
    if (isGift) {
      setFundCustodian('GIFT');
    } else if (isMarvelous) {
      setFundCustodian('MARVELOUS');
    } else {
      setFundCustodian(defaultCustodian);
    }
    setErrorMessage(null);
  }, [isOpen, isGift, isMarvelous, defaultCustodian]);

  if (!isOpen) return null;

  const selectedFund = pettyCashFunds.find(f => f.custodian === fundCustodian) || pettyCashFunds[0];
  const projectedBalance = Math.max(0, (selectedFund?.currentBalanceNgn || 0) - amountNgn);
  const isOverdraft = amountNgn > (selectedFund?.currentBalanceNgn || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict validation
    if (isGift && fundCustodian === 'MARVELOUS') {
      setErrorMessage('Access Denied: Gift is not authorized to log vouchers for Marvelous\'s imprest fund per SOP Section 4.');
      return;
    }
    if (isMarvelous && fundCustodian === 'GIFT') {
      setErrorMessage('Access Denied: Marvelous is not authorized to log vouchers for Gift\'s imprest fund per SOP Section 4.');
      return;
    }

    if (!description.trim() || amountNgn <= 0 || isOverdraft) return;

    setIsSubmitting(true);
    haptics.impact();

    try {
      logPettyCashExpense({
        fundCustodian,
        date,
        amountNgn: Number(amountNgn),
        category,
        description: description.trim(),
        receiptUrl: receiptUrl.trim() || undefined,
        approvedByName: currentUser.name
      });

      haptics.success();
      setIsSubmitting(false);
      setDescription('');
      setReceiptUrl('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to log expense voucher.');
    }
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
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Petty Cash Expense</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">AquaEarth Imprest Ledger & Voucher Log</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Custodian Fund Selector */}
          <div className="p-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isMarvelous}
                onClick={() => {
                  if (!isMarvelous) {
                    setFundCustodian('GIFT');
                    setErrorMessage(null);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isMarvelous ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800' : ''
                } ${
                  fundCustodian === 'GIFT'
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Gift's Fund
                    {isMarvelous && <Lock className="w-3 h-3 text-slate-400" />}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ₦{(pettyCashFunds.find(f => f.custodian === 'GIFT')?.currentBalanceNgn || 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isMarvelous ? 'Restricted to Gift' : 'Collation & HQ Operations'}
                </div>
              </button>

              <button
                type="button"
                disabled={isGift}
                onClick={() => {
                  if (!isGift) {
                    setFundCustodian('MARVELOUS');
                    setErrorMessage(null);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isGift ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800' : ''
                } ${
                  fundCustodian === 'MARVELOUS'
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Marvelous's Fund
                    {isGift && <Lock className="w-3 h-3 text-rose-500" />}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ₦{(pettyCashFunds.find(f => f.custodian === 'MARVELOUS')?.currentBalanceNgn || 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isGift ? 'Restricted to Marvelous' : 'Invoicing & Field Logistics'}
                </div>
              </button>
            </div>
            {isGift && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <Lock className="w-3 h-3 shrink-0" />
                <span>Custodian Segregation: You are authenticated as Gift. Marvelous's fund is locked.</span>
              </div>
            )}
            {isMarvelous && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <Lock className="w-3 h-3 shrink-0" />
                <span>Custodian Segregation: You are authenticated as Marvelous. Gift's fund is locked.</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expense Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Amount (₦ NGN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={amountNgn}
                  onChange={e => setAmountNgn(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tnum font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SOP Expense Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PettyCashCategory)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="WATER_PURCHASE">Water Purchase (HQ Dispenser Bottles)</option>
                <option value="TRANSPORTATION_UBER">Transportation / Uber (Sample Courier)</option>
                <option value="MINOR_OPERATIONAL">Minor Operational (Generator & Facilities)</option>
                <option value="OFFICE_SUPPLIES">Office Supplies (Envelopes & Binders)</option>
                <option value="EMERGENCY_FIELD">Emergency Field Expense</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description / Purpose <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Purchased 12 refill bottles of pure water for geotechnical laboratory staff"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Receipt Reference / Voucher File Link
              </label>
              <input
                type="text"
                value={receiptUrl}
                onChange={e => setReceiptUrl(e.target.value)}
                placeholder="e.g. /receipts/water-sep17.pdf or Receipt #REC-9821"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Live Balance Impact Preview */}
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              isOverdraft 
                ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300' 
                : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
            }`}>
              <div>
                <span className="font-semibold">{selectedFund.custodianName}'s Balance After Expense:</span>
              </div>
              <div className="font-mono font-bold text-sm">
                ₦{projectedBalance.toLocaleString()} NGN
              </div>
            </div>

            {isOverdraft && (
              <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Expense exceeds available fund balance. Request replenishment from Dr. Kaine Edike first.</span>
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
                disabled={isSubmitting || isOverdraft}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Logging...' : 'Post to Imprest Ledger'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
