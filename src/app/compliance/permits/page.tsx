'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Landmark,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { haptics } from '@/lib/haptics';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  EXPIRING_SOON: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  EXPIRED: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  RENEWAL_IN_PROGRESS: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
};

export default function CompliancePermitsPage() {
  const { compliancePermits, renewCompliancePermit } = useAuth();

  const counts = {
    ACTIVE: compliancePermits.filter(p => p.status === 'ACTIVE').length,
    EXPIRING_SOON: compliancePermits.filter(p => p.status === 'EXPIRING_SOON').length,
    EXPIRED: compliancePermits.filter(p => p.status === 'EXPIRED').length,
    totalFee: compliancePermits.reduce((s, p) => s + p.statutoryFeeNgn, 0)
  };

  const handleRenew = (permitId: string, title: string) => {
    haptics.impact();
    const confirmed = confirm(`Renew "${title}"? This records the statutory fee as reconciled and resets the compliance cycle.`);
    if (!confirmed) return;
    renewCompliancePermit(permitId);
    haptics.success();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Regulatory Compliance & Statutory Permits
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          FMEnv, NESREA, NUPRC, and state ministry permits — renewal tracking and statutory fee reconciliation.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Active</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{counts.ACTIVE}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Expiring Soon</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{counts.EXPIRING_SOON}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">Expired</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{counts.EXPIRED}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Statutory Fees</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">₦{(counts.totalFee / 1000000).toFixed(1)}M</div>
        </div>
      </div>

      <div className="space-y-3">
        {compliancePermits.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#121214] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
            No statutory permits on file.
          </div>
        )}

        {compliancePermits.map(permit => (
          <div key={permit.id} className="bg-white dark:bg-[#121214] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <Landmark className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{permit.permitTitle}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {permit.permitNumber} · {permit.regulatoryBody}
                    {permit.projectName && <> · {permit.projectName}</>}
                  </div>
                </div>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLE[permit.status]}`}>
                {permit.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" /> Issued: {permit.issueDate}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" /> Expires: {permit.expiryDate}
              </div>
              <div>Fee: ₦{permit.statutoryFeeNgn.toLocaleString()}</div>
              <div className="flex items-center gap-1.5">
                {permit.feeReconciled ? (
                  <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1"><FileCheck className="w-3 h-3" /> Fee Reconciled</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Fee Pending</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black/[0.05] dark:border-white/[0.06]">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Officer in Charge: {permit.officerInCharge}</div>
              <button
                onClick={() => handleRenew(permit.id, permit.permitTitle)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Renew Permit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
