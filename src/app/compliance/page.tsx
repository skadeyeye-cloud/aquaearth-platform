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
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 8 • Nigerian Statutory Regulatory & Permitting Governance
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Statutory Compliance Tracker
          </h1>
          <p className="text-xs text-slate-500">
            Multi-agency regulatory checklists across FMEnv, NESREA, NUPRC (EGASPIN), and State Ministries with automated renewal cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]">
            <Download className="w-3.5 h-3.5" />
            <span>Export Regulatory Audit Pack</span>
          </button>
        </div>
      </div>

      {/* Expiry Warning Banner if <= 30 days */}
      {expiringSoon.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-400 rounded-3xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400 text-amber-950 rounded-xl font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm">
                {expiringSoon.length} Statutory Permit Expiring in &le;30 Days
              </div>
              <div className="text-amber-900/80 text-[11px] mt-0.5">
                {expiringSoon.map(p => `${p.permitTitle} (${p.regulatoryBody} - ${p.daysRemaining}d remaining)`).join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsRenewingPermit(expiringSoon[0])}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-2xs transition-all active:scale-[0.96] shrink-0"
          >
            Initiate Triennial Renewal
          </button>
        </div>
      )}

      {/* Compliance Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Statutory Permits</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">{compliancePermits.length} Active</div>
          <div className="text-[10px] text-slate-500 font-medium">100% in good standing</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Upcoming Renewals</div>
          <div className="text-xl font-extrabold text-amber-600 tnum">{expiringSoon.length} Impending</div>
          <div className="text-[10px] text-slate-500 font-medium">Automated 30/14/7d alerts</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Statutory Fees Tracked</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">₦{(totalFeesNgn / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">Reconciled with Finance (M10)</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Covered Regulators</div>
          <div className="text-xl font-extrabold text-emerald-600 tnum">5 Agencies</div>
          <div className="text-[10px] text-slate-500 font-medium">FMEnv, NESREA, NUPRC, LASEPA</div>
        </div>
      </div>

      {/* Filter by Agency (Apple Segmented Style) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold overflow-x-auto">
        {(['ALL', 'FMEnv', 'NESREA', 'NUPRC', 'STATE_MOE'] as const).map(agency => (
          <button
            key={agency}
            onClick={() => setSelectedBody(agency)}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] shrink-0 ${
              selectedBody === agency ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
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
                    permit.regulatoryBody === 'FMEnv' ? 'bg-emerald-100 text-emerald-900' :
                    permit.regulatoryBody === 'NESREA' ? 'bg-blue-100 text-blue-900' :
                    permit.regulatoryBody === 'NUPRC' ? 'bg-purple-100 text-purple-900' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {permit.regulatoryBody}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{permit.permitNumber}</span>
                </div>

                <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full tnum ${
                  isExpiring ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {permit.daysRemaining} days left
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{permit.permitTitle}</h3>
                <div className="text-[11px] text-slate-500 mt-0.5">Project: <b>{permit.projectName || 'General Facility'}</b></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-black/[0.04] space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Statutory Filing Fee:</span>
                  <span className="font-bold text-slate-900 font-mono tnum">₦{permit.statutoryFeeNgn.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cycle Type:</span>
                  <span className="font-semibold text-slate-700">{permit.isRecurringCycle ? `Recurring (${permit.cycleDurationYears} Years)` : 'One-Off Project'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Filing Officer:</span>
                  <span className="font-semibold text-slate-700">{permit.officerInCharge}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono tnum">
                  Validity: {permit.issueDate} $\rightarrow$ {permit.expiryDate}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRenewingPermit(permit)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[10px] transition-colors active:scale-[0.96]"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Renew Cycle</span>
                  </button>

                  <button
                    onClick={() => alert(`Viewing Stamped Official Permit Certificate: ${permit.permitNumber}`)}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-xl"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRenewingPermit(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Automated Cycle Spawning</span>
                  <h3 className="text-sm font-bold text-slate-900">Renew Statutory Permit</h3>
                </div>
                <button onClick={() => setIsRenewingPermit(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-[11px] space-y-1">
                <div className="font-bold">{isRenewingPermit.permitTitle}</div>
                <div className="text-[10px] text-emerald-800">
                  Agency: {isRenewingPermit.regulatoryBody} • Current Expiry: {isRenewingPermit.expiryDate}
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Confirming renewal will spawn the next statutory validity cycle ({isRenewingPermit.cycleDurationYears} Years), update compliance calendars, and log the statutory fee (₦{isRenewingPermit.statutoryFeeNgn.toLocaleString()}) for Finance cross-reconciliation.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                <button type="button" onClick={() => setIsRenewingPermit(null)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                <button
                  type="button"
                  onClick={handleConfirmRenewal}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-xl font-bold shadow-xs active:scale-[0.96] flex items-center gap-1.5"
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
