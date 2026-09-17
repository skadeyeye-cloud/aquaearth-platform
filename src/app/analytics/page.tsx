'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  Plus, 
  X,
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsDashboardPage() {
  const { 
    currentUser,
    projects, 
    opportunities, 
    invoices, 
    leaderboard, 
    allUsers, 
    digestConfig, 
    updateDigestRecipients 
  } = useAuth();

  // Access Control: Command and Analytics board is strictly for Line Managers, Finance, and Superadmins
  const role = currentUser.functionalRole;
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || role === 'SUPERADMIN' || role === 'MANAGING_CONSULTANT' || role === 'DEPUTY_MANAGING_CONSULTANT';
  const isFinance = isSuperadmin || role === 'CFO' || role === 'FINANCE_OFFICER' || role === 'FINANCE_ADMIN' || currentUser.departmentName === 'Finance' || currentUser.departmentName === 'Finance & Accounts' || currentUser.id === 'usr-13' || currentUser.id === 'usr-14';
  const isLineManager = currentUser.managementTier !== 'NONE' || currentUser.accessTier === 'ADMIN' || role === 'PROJECT_MANAGER';
  const canAccessAnalytics = isSuperadmin || isFinance || isLineManager;

  const [selectedPeriod, setSelectedPeriod] = useState('2026-09');
  const [isDigestConfigOpen, setIsDigestConfigOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [recipientsList, setRecipientsList] = useState<string[]>(digestConfig.emailRecipients);

  if (!canAccessAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Restricted Command & Analytics Access
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          The Executive Command & Analytics Dashboard is reserved exclusively for Department Line Managers, Team Leads, and Finance Personnel.
        </p>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-6">
          Signed in as: <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> ({currentUser.jobTitle})
        </div>
        <Link
          href="/workspace"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-xs transition-all"
        >
          Return to My Workspace
        </Link>
      </div>
    );
  }

  // Macro Calculations
  const activeOpps = opportunities.filter(o => o.stage !== 'WON' && o.stage !== 'LOST');
  const pipelineValueNgn = activeOpps.reduce((acc, curr) => curr.currency === 'NGN' ? acc + curr.estimatedValue : acc + (curr.estimatedValue * 1550), 0);
  const activeContractValue = projects.reduce((acc, curr) => acc + curr.contractValue, 0);
  const totalBilled = invoices.reduce((acc, curr) => acc + curr.subtotalNgn, 0);
  const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.netPayableNgn, 0);

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || recipientsList.includes(newEmail.trim())) return;
    const updated = [...recipientsList, newEmail.trim()];
    setRecipientsList(updated);
    updateDigestRecipients(updated);
    setNewEmail('');
  };

  const handleRemoveRecipient = (email: string) => {
    const updated = recipientsList.filter(e => e !== email);
    setRecipientsList(updated);
    updateDigestRecipients(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#86868B] dark:text-[#A1A1A6] tracking-tight">
              Module 11 • Executive Intelligence & Analytics Command Center
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              Line Managers & Finance Only
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-1">
            Executive Analytics & Board Reporting
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-0.5">
            Real-time multi-disciplinary portfolio health, financial flows, departmental staff utilization, and scheduled executive digests.
          </p>
        </div>

        {/* Period Switcher & Board Pack Export */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs focus:outline-none"
          >
            <option value="2026-09">September 2026 (Live Rollup)</option>
            <option value="2026-08">August 2026 (Archive)</option>
            <option value="2026-Q2">Q2 2026 Executive Summary</option>
          </select>

          <button
            onClick={() => setIsDigestConfigOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-xl text-xs font-medium shadow-xs transition-all active:scale-[0.97]"
          >
            <Mail className="w-3.5 h-3.5 text-[#86868B] dark:text-[#A1A1A6]" />
            <span>Digest Config</span>
          </button>

          <button
            onClick={() => alert('Generating Board Pack PDF: Executive Command Summary compiled for Board of Directors.')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Board Pack PDF</span>
          </button>
        </div>
      </div>

      {/* Macro Command Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <div className="text-xs font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Live Pipeline</div>
          <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">₦{(pipelineValueNgn / 1000000).toFixed(1)}M</div>
          <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">{activeOpps.length} active bidding campaigns</div>
        </div>

        <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Contract Volume</div>
          <div className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 tnum">₦{(activeContractValue / 1000000).toFixed(0)}M</div>
          <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">{projects.filter(p => p.status === 'ACTIVE').length} projects under execution</div>
        </div>

        <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Cash Collection Inflow</div>
          <div className="text-2xl font-semibold tracking-tight text-indigo-600 dark:text-indigo-400 tnum">₦{(totalCollected / 1000000).toFixed(1)}M</div>
          <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Net settled invoices in 2026</div>
        </div>

        <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Billable Utilization</div>
          <div className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400 tnum">86.4%</div>
          <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Target: &ge;80% consulting hours</div>
        </div>
      </div>

      {/* Departmental Operational Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Disciplinary Workstream Health */}
        <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <h2 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Departmental Billable Load & Projects</span>
            </h2>
            <span className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">Live Tracking</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { dept: 'Geotechnical Engineering', lead: 'Engr. Femi Adebayo', activeCount: 2, util: '91%', color: 'bg-amber-500' },
              { dept: 'Environmental & Social (ESIA)', lead: 'Dr. Ngozi Eze', activeCount: 2, util: '88%', color: 'bg-emerald-500' },
              { dept: 'Geoinformatics & GIS Survey', lead: 'Halima Yusuf', activeCount: 1, util: '84%', color: 'bg-blue-500' },
              { dept: 'Quality Assurance (QA/QC)', lead: 'Amina Bello', activeCount: 4, util: '95%', color: 'bg-indigo-500' },
            ].map((d, idx) => (
              <div key={idx} className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{d.dept}</div>
                    <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">Head: {d.lead}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tnum">{d.util}</span>
                    <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">{d.activeCount} Projects</div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-black/[0.05] dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: d.util }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Monday Digest & Top KPI Leaders */}
        <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <h2 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Automated Executive Digest</span>
            </h2>
            <span className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium px-2.5 py-0.5 rounded-full border border-purple-500/20">
              Monday 8:00 AM Active
            </span>
          </div>

          <div className="p-4 bg-purple-500/[0.06] dark:bg-purple-500/[0.1] rounded-2xl border border-purple-500/20 space-y-1.5 text-xs text-purple-950 dark:text-purple-200">
            <div className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Next Automated Dispatch: Monday, Sept 07, 08:00 WAT</span>
            </div>
            <p className="text-[11px] text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
              Dispatches automated PDF and email summary of revenue, overdue tasks, regulatory deadlines, and leaderboards to <strong>{recipientsList.length} configured recipients</strong>.
            </p>
          </div>

          {/* Top Performers Podiums */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-medium text-[#86868B] dark:text-[#A1A1A6] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Top Performers (KPI Engine)</span>
            </div>
            {leaderboard.slice(0, 3).map((item, idx) => (
              <div key={item.userId} className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-semibold text-[#86868B] dark:text-[#A1A1A6] text-[11px]">#{idx + 1}</span>
                  <div>
                    <div className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name}</div>
                    <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">{item.jobTitle}</div>
                  </div>
                </div>
                <div className="text-right font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] tnum">{item.totalScore} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Digest Recipients Configuration Modal */}
      <AnimatePresence>
        {isDigestConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDigestConfigOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.06] dark:border-white/[0.08] p-6 space-y-4 z-10 text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
              <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Executive Digest Distribution List</h3>
                  <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">Configurable custom email recipients</div>
                </div>
                <button onClick={() => setIsDigestConfigOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-medium text-[#86868B] dark:text-[#A1A1A6]">Active Recipients:</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {recipientsList.map((email) => (
                    <div key={email} className="p-2.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">{email}</span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-[#86868B] hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Recipient Form */}
              <form onSubmit={handleAddRecipient} className="flex gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex-1 p-2 bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F5F5F7]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl font-semibold shadow-xs active:scale-[0.97]"
                >
                  Add
                </button>
              </form>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsDigestConfigOpen(false)}
                  className="px-4 py-2 bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-xl font-medium active:scale-[0.97]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
