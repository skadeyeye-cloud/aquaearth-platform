'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Copy, Check, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  tokenData: { tempToken: string; message: string } | null;
}

export function PasswordResetModal({ isOpen, onClose, user, tokenData }: PasswordResetModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user || !tokenData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenData.tempToken);
    haptics.impact();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between bg-emerald-50/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Cryptographic Access Token
                </h3>
                <p className="text-[11px] text-slate-500">
                  Temporary password reset credentials issued
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* User Details */}
            <div className="p-3.5 bg-slate-50 border border-black/[0.06] rounded-2xl space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient Account</div>
              <div className="font-bold text-xs text-slate-900">{user.name}</div>
              <div className="text-[11px] text-slate-500">{user.email} • {user.jobTitle} ({user.departmentName})</div>
            </div>

            {/* Token Display Box */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700">
                One-Time Secure Access Token (Valid for 24 Hours)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-slate-900 text-emerald-400 font-mono text-sm font-bold tracking-wider rounded-xl select-all border border-black/20 text-center">
                  {tokenData.tempToken}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 active:scale-95 ${
                    copied
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                  title="Copy Token"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && (
                <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Token copied to clipboard!
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-1.5 text-[11px] text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Clock className="w-3.5 h-3.5" />
                <span>Security Guidelines</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[10.5px] text-amber-800/90 leading-relaxed">
                <li>Deliver this token only via verified corporate channels (encrypted email or WhatsApp).</li>
                <li>The staff member will be forced to specify a new complex password upon first authentication.</li>
                <li>This token expires automatically in exactly 24 hours.</li>
              </ul>
            </div>
          </div>

          <div className="px-6 py-3 border-t border-black/[0.05] bg-slate-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.96]"
            >
              Done & Logged
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
