'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  CreditCard, 
  Lock,
  Sparkles
} from 'lucide-react';
import { PettyCashCustodian } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface TopUpPettyCashModalProps {
  isOpen: boolean;
  defaultCustodian?: PettyCashCustodian;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 200000, 300000];

const FUNDING_SOURCES = [
  'GTBank Corporate Wire (Operating Acct)',
  'Zenith Bank Imprest Cheque',
  'Sterling Bank Geotechnical Disbursal',
  'Direct Cash Imprest from Vault',
  'Executive Emergency Advance (Dr. Kaine Edike)'
];

export function TopUpPettyCashModal({
  isOpen,
  defaultCustodian = 'GIFT',
  onClose,
  onSuccess
}: TopUpPettyCashModalProps) {
  const { currentUser, pettyCashFunds, topUpPettyCashFund } = useAuth();

  const isGift = currentUser.id === 'usr-13' || currentUser.name.toLowerCase().includes('gift');
  const isMarvelous = currentUser.id === 'usr-14' || currentUser.name.toLowerCase().includes('marvelous');

  const effectiveDefault: PettyCashCustodian = isGift ? 'GIFT' : isMarvelous ? 'MARVELOUS' : defaultCustodian;

  const [fundCustodian, setFundCustodian] = useState<PettyCashCustodian>(effectiveDefault);
  const [amountNgn, setAmountNgn] = useState<number>(50000);
  const [fundingSource, setFundingSource] = useState(FUNDING_SOURCES[0]);
  const [referenceNumber, setReferenceNumber] = useState(`REF-TRF-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isGift) {
      setFundCustodian('GIFT');
    } else if (isMarvelous) {
      setFundCustodian('MARVELOUS');
    } else {
      setFundCustodian(defaultCustodian);
    }
    setReferenceNumber(`REF-TRF-${Date.now().toString().slice(-6)}`);
    setErrorMessage(null);
  }, [isOpen, isGift, isMarvelous, defaultCustodian]);

  if (!isOpen) return null;

  const selectedFund = pettyCashFunds.find(f => f.custodian === fundCustodian) || pettyCashFunds[0];
  const currentBalance = selectedFund?.currentBalanceNgn || 0;
  const projectedBalance = currentBalance + (Number(amountNgn) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict custodian segregation guard
    if (isGift && fundCustodian === 'MARVELOUS') {
      setErrorMessage('Access Denied: Gift cannot top up Marvelous\'s imprest fund per SOP Section 4.');
      return;
    }
    if (isMarvelous && fundCustodian === 'GIFT') {
      setErrorMessage('Access Denied: Marvelous cannot top up Gift\'s imprest fund per SOP Section 4.');
      return;
    }

    if (amountNgn <= 0) {
      setErrorMessage('Top-up amount must be greater than ₦0.');
      return;
    }

    setIsSubmitting(true);
    haptics.impact();

    try {
      topUpPettyCashFund({
        fundCustodian,
        amountNgn: Number(amountNgn),
        fundingSource,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || `Fund top-up authorized by ${currentUser.name}`
      });

      haptics.success();
      setIsSubmitting(false);
      setNotes('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to top up petty cash fund.');
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
          className="bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#F5F5F7]/80 dark:bg-white/[0.03] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Top Up Petty Cash Balance</h3>
                <p className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Replenish Imprest Float & Log Bank Transfer Ref</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
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

          {/* Custodian Selector */}
          <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
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
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isMarvelous ? 'opacity-40 cursor-not-allowed border-black/[0.06] dark:border-white/[0.08]' : ''
                } ${
                  fundCustodian === 'GIFT'
                    ? 'border-emerald-500 bg-white dark:bg-[#2C2C2E] shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] hover:border-black/[0.2]'
                }`}
              >
                <div className="text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Gift's Imprest Fund
                    {isMarvelous && <Lock className="w-3 h-3 text-[#86868B]" />}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ₦{(pettyCashFunds.find(f => f.custodian === 'GIFT')?.currentBalanceNgn || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#86868B] dark:text-[#A1A1A6] mt-0.5">
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
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isGift ? 'opacity-40 cursor-not-allowed border-black/[0.06] dark:border-white/[0.08]' : ''
                } ${
                  fundCustodian === 'MARVELOUS'
                    ? 'border-emerald-500 bg-white dark:bg-[#2C2C2E] shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] hover:border-black/[0.2]'
                }`}
              >
                <div className="text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Marvelous's Fund
                    {isGift && <Lock className="w-3 h-3 text-rose-500" />}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ₦{(pettyCashFunds.find(f => f.custodian === 'MARVELOUS')?.currentBalanceNgn || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#86868B] dark:text-[#A1A1A6] mt-0.5">
                  {isGift ? 'Restricted to Marvelous' : 'Invoicing & Field Logistics'}
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Amount Selection with Quick Chips */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-between">
                <span>Top-Up Inflow Amount (₦ NGN)</span>
                <span className="text-[11px] text-[#86868B] font-mono">Min ₦5,000</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#86868B]">₦</span>
                <input
                  type="number"
                  required
                  min={5000}
                  step={5000}
                  value={amountNgn}
                  onChange={e => setAmountNgn(Number(e.target.value))}
                  className="w-full text-sm pl-8 pr-4 py-2.5 rounded-2xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono font-bold tracking-tight focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_AMOUNTS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountNgn(preset)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      amountNgn === preset
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                    }`}
                  >
                    +₦{(preset / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Funding Source / Banking Channel <span className="text-rose-500">*</span>
              </label>
              <select
                value={fundingSource}
                onChange={e => setFundingSource(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium"
              >
                {FUNDING_SOURCES.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            {/* Reference & Authorized By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Bank Ref / Cheque No.
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  placeholder="e.g. GTB-TRF-98212"
                  className="w-full text-xs px-3.5 py-2 rounded-2xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Authorized Operator
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full text-xs px-3.5 py-2 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-[#86868B] dark:text-[#A1A1A6] font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Purpose / Justification Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Purpose / Approval Justification
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Approved mid-month replenishment for field dispatch and lab consumables"
                className="w-full text-xs px-3.5 py-2 rounded-2xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7]"
              />
            </div>

            {/* Live Balance Preview Card */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868B] dark:text-[#A1A1A6]">Current Balance:</span>
                <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  ₦{currentBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">+ Top-Up Amount:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  +₦{(Number(amountNgn) || 0).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  New Available Balance:
                </span>
                <span className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  ₦{projectedBalance.toLocaleString()} NGN
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || amountNgn <= 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Crediting Fund...' : 'Top Up Fund Balance'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
