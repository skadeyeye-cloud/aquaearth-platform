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
  ExternalLink,
  Radio,
  Eye,
  MapPin,
  Users
} from 'lucide-react';
import { CompliancePermit, RegulatoryBody } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompliancePage() {
  const { compliancePermits, projects, renewCompliancePermit } = useAuth();
  const [selectedBody, setSelectedBody] = useState<string>('ALL');
  const [isRenewingPermit, setIsRenewingPermit] = useState<CompliancePermit | null>(null);
  const [showDisplayLocations, setShowDisplayLocations] = useState(false);

  const filteredPermits = compliancePermits.filter(p => {
    return selectedBody === 'ALL' || p.regulatoryBody === selectedBody;
  });

  const expiringSoon = compliancePermits.filter(p => p.daysRemaining <= 30);
  const totalFeesNgn = compliancePermits.reduce((acc, curr) => acc + curr.statutoryFeeNgn, 0);
  const publicDisplayPermits = compliancePermits.filter(p => p.publicDisplay?.isRequired);

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
            Statutory Compliance & Regulatory Radar
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#A39E93] mt-0.5">
            FMEnv, NESREA, NUPRC permits, 21-day public display countdown, and EIA panel reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.96] cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export Regulatory Audit Pack</span>
          </button>
        </div>
      </div>

      {/* 21-Day Statutory Public Display & Panel Review Radar */}
      {publicDisplayPermits.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-blue-950/20 via-indigo-950/20 to-purple-950/20 border border-blue-500/30 rounded-3xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 animate-pulse">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    Statutory 21-Day Public Display Active
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    FMEnv EIA Panel Review Track
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {publicDisplayPermits[0].projectName} • Notice Ref: {publicDisplayPermits[0].permitNumber}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tnum">
                  {publicDisplayPermits[0].publicDisplay?.daysRemaining} Days
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Remaining of 21-Day Mandate</div>
              </div>

              <button
                type="button"
                onClick={() => setShowDisplayLocations(!showDisplayLocations)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold active:scale-[0.96] flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{showDisplayLocations ? 'Hide Reading Centers' : 'View 4 Reading Centers'}</span>
              </button>
            </div>
          </div>

          {/* 21-Day Timeline Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <span>Display Gazetted: {publicDisplayPermits[0].publicDisplay?.startDate}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                Day {21 - (publicDisplayPermits[0].publicDisplay?.daysRemaining || 14)} of 21 (33% elapsed)
              </span>
              <span>Deadline: {publicDisplayPermits[0].publicDisplay?.endDate}</span>
            </div>
            <div className="w-full h-2 bg-black/[0.08] dark:bg-white/[0.1] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.round(((21 - (publicDisplayPermits[0].publicDisplay?.daysRemaining || 14)) / 21) * 100)}%` }}
              />
            </div>
          </div>

          {/* Collapsible Display Centers */}
          {showDisplayLocations && publicDisplayPermits[0].publicDisplay?.locations && (
            <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Statutory Public Inspection Centers (FMEnv Gazetted)
                </span>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  {publicDisplayPermits[0].publicDisplay.objectionsCount || 0} Memoranda Received
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {publicDisplayPermits[0].publicDisplay.locations.map((loc, idx) => (
                  <div key={idx} className="p-2 bg-white dark:bg-black/60 rounded-xl border border-black/[0.06] dark:border-white/[0.08] flex items-start gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[10px] mt-0.5">#{idx + 1}</span>
                    <span className="text-slate-700 dark:text-slate-300 text-[11px]">{loc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Public Display Radar</div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tnum">
            {publicDisplayPermits.length > 0 ? `${publicDisplayPermits[0].publicDisplay?.daysRemaining}d Left` : 'None Active'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">21-day statutory countdown</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Statutory Fees Tracked</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">₦{(totalFeesNgn / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Reconciled with Finance (M10)</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Review Gate Tracks</div>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tnum">Panel + Internal</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">FMEnv EIA review matrix</div>
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
                  {permit.regulatoryReviewType && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                      {permit.regulatoryReviewType === 'PANEL_REVIEW' ? '🎙️ Panel Review' : '📋 Internal Review'}
                    </span>
                  )}
                  {permit.publicDisplay?.isRequired && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5" /> 21d Display
                    </span>
                  )}
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
