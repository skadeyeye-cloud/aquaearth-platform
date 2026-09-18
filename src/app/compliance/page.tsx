'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  FileCheck, 
  RotateCw, 
  Download, 
  DollarSign,
  Plus,
  Lock,
  ExternalLink
} from 'lucide-react';
import { CompliancePermit, RegulatoryBody } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompliancePage() {
  const { compliancePermits, projects, renewCompliancePermit } = useAuth();
  const [selectedBody, setSelectedBody] = useState<string>('ALL');
  const [isRenewingPermit, setIsRenewingPermit] = useState<CompliancePermit | null>(null);

  const filteredPermits = compliancePermits.filter(p => {
    return selectedBody === 'ALL' || p.regulatoryBody === selectedBody;
  });

  const expiringSoon = compliancePermits.filter(p => p.daysRemaining <= 30);
  const totalFeesNgn = compliancePermits.reduce((acc, curr) => acc + curr.statutoryFeeNgn, 0);

  const handleConfirmRenewal = () => {
    if (!isRenewingPermit) return;
    renewCompliancePermit(isRenewingPermit.id);
    setIsRenewingPermit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Statutory Compliance Tracker
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.96] cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export Regulatory Audit Pack</span>
          </button>
        </div>
      </div>

      {/* Expiry Warning Banner if <= 30 days */}
      {expiringSoon.length > 0 && (
        <div className="p-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400/50 dark:border-amber-500/40 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 dark:bg-amber-500 text-amber-950 rounded-xl font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                {expiringSoon.length} Statutory Permit Expiring in &le;30 Days
              </div>
              <div className="text-amber-900/90 dark:text-amber-300/90 text-[11px] mt-0.5 font-medium">
                {expiringSoon.map(p => `${p.permitTitle} (${p.regulatoryBody} - ${p.daysRemaining}d remaining)`).join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsRenewingPermit(expiringSoon[0])}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-2xs transition-all active:scale-[0.96] shrink-0 cursor-pointer"
          >
            Initiate Triennial Renewal
          </button>
        </div>
      )}

      {/* Compliance Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Statutory Permits</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">{compliancePermits.length} Active</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">100% in good standing</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Upcoming Renewals</div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tnum">{expiringSoon.length} Impending</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Automated 30/14/7d alerts</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Statutory Fees Tracked</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">₦{(totalFeesNgn / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Reconciled with Finance (M10)</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Covered Regulators</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">5 Agencies</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">FMEnv, NESREA, NUPRC, LASEPA</div>
        </div>
      </div>

      {/* Filter by Agency (Apple Segmented Style) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl text-xs font-semibold overflow-x-auto border border-black/[0.04] dark:border-white/[0.08]">
        {(['ALL', 'FMEnv', 'NESREA', 'NUPRC', 'STATE_MOE'] as const).map(agency => (
          <button
            key={agency}
            onClick={() => setSelectedBody(agency)}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] shrink-0 cursor-pointer ${
              selectedBody === agency
                ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {agency === 'ALL' ? 'All Regulators' : agency === 'STATE_MOE' ? 'State Ministries' : agency}
          </button>
        ))}
      </div>

      {/* Permits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPermits.map((permit) => {
          const isExpiring = permit.daysRemaining <= 30;
          return (
            <motion.div
              whileHover={{ y: -2 }}
              key={permit.id}
              className="apple-glass-card rounded-3xl p-5 space-y-3.5 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    permit.regulatoryBody === 'FMEnv' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300' :
                    permit.regulatoryBody === 'NESREA' ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300' :
                    permit.regulatoryBody === 'NUPRC' ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300' :
                    'bg-slate-100 text-slate-800 dark:bg-white/[0.08] dark:text-slate-200'
                  }`}>
                    {permit.regulatoryBody}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">{permit.permitNumber}</span>
                </div>

                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tnum ${
                  isExpiring
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/40'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40'
                }`}>
                  {permit.daysRemaining} days left
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{permit.permitTitle}</h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Project: <b className="text-slate-800 dark:text-slate-200">{permit.projectName || 'General Facility'}</b>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Statutory Filing Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono tnum">₦{permit.statutoryFeeNgn.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cycle Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{permit.isRecurringCycle ? `Recurring (${permit.cycleDurationYears} Years)` : 'One-Off Project'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Filing Officer:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{permit.officerInCharge}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tnum">
                  Validity: {permit.issueDate} → {permit.expiryDate}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRenewingPermit(permit)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-[10px] transition-colors active:scale-[0.96] cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Renew Cycle</span>
                  </button>

                  <button
                    onClick={() => alert(`Viewing Stamped Official Permit Certificate: ${permit.permitNumber}`)}
                    className="p-1.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer"
                    title="Download Stamped Certificate"
                  >
                    <FileCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Renew Permit Modal */}
      <AnimatePresence>
        {isRenewingPermit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRenewingPermit(null)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Automated Cycle Spawning</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Renew Statutory Permit</h3>
                </div>
                <button onClick={() => setIsRenewingPermit(null)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">&times;</button>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-[11px] space-y-1">
                <div className="font-bold">{isRenewingPermit.permitTitle}</div>
                <div className="text-[10px] text-emerald-800 dark:text-emerald-300">
                  Agency: {isRenewingPermit.regulatoryBody} • Current Expiry: {isRenewingPermit.expiryDate}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Confirming renewal will spawn the next statutory validity cycle ({isRenewingPermit.cycleDurationYears} Years), update compliance calendars, and log the statutory fee (₦{isRenewingPermit.statutoryFeeNgn.toLocaleString()}) for Finance cross-reconciliation.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                <button type="button" onClick={() => setIsRenewingPermit(null)} className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold cursor-pointer">Cancel</button>
                <button
                  type="button"
                  onClick={handleConfirmRenewal}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs active:scale-[0.96] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Confirm Cycle Renewal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
