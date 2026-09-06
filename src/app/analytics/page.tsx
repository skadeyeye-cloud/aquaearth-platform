'use client';

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsDashboardPage() {
  const { 
    projects, 
    opportunities, 
    invoices, 
    leaderboard, 
    allUsers, 
    digestConfig, 
    updateDigestRecipients 
  } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState('2026-09');
  const [isDigestConfigOpen, setIsDigestConfigOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [recipientsList, setRecipientsList] = useState<string[]>(digestConfig.emailRecipients);

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
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 11 • Executive Intelligence & Analytics Command Center
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Executive Analytics & Board Reporting
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-disciplinary portfolio health, financial flows, departmental staff utilization, and scheduled executive digests.
          </p>
        </div>

        {/* Period Switcher & Board Pack Export */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none"
          >
            <option value="2026-09">September 2026 (Live Rollup)</option>
            <option value="2026-08">August 2026 (Archive)</option>
            <option value="2026-Q2">Q2 2026 Executive Summary</option>
          </select>

          <button
            onClick={() => setIsDigestConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/[0.08] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Digest Config</span>
          </button>

          <button
            onClick={() => alert('Generating Board Pack PDF: Executive Command Summary compiled for Board of Directors.')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Board Pack PDF</span>
          </button>
        </div>
      </div>

      {/* Macro Command Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Live Pipeline</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">₦{(pipelineValueNgn / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">{activeOpps.length} active bidding campaigns</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Contract Volume</div>
          <div className="text-xl font-extrabold text-emerald-600 tnum">₦{(activeContractValue / 1000000).toFixed(0)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">{projects.filter(p => p.status === 'ACTIVE').length} projects under execution</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Cash Collection Inflow</div>
          <div className="text-xl font-extrabold text-purple-600 tnum">₦{(totalCollected / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">Net settled invoices in 2026</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Billable Utilization</div>
          <div className="text-xl font-extrabold text-blue-600 tnum">86.4%</div>
          <div className="text-[10px] text-slate-500 font-medium">Target: &ge;80% consulting hours</div>
        </div>
      </div>

      {/* Departmental Operational Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Disciplinary Workstream Health */}
        <div className="apple-glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Departmental Billable Load & Projects</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Live Tracking</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { dept: 'Geotechnical Engineering', lead: 'Engr. Femi Adebayo', activeCount: 2, util: '91%', color: 'bg-amber-600' },
              { dept: 'Environmental & Social (ESIA)', lead: 'Dr. Ngozi Eze', activeCount: 2, util: '88%', color: 'bg-emerald-600' },
              { dept: 'Geoinformatics & GIS Survey', lead: 'Halima Yusuf', activeCount: 1, util: '84%', color: 'bg-blue-600' },
              { dept: 'Quality Assurance (QA/QC)', lead: 'Amina Bello', activeCount: 4, util: '95%', color: 'bg-purple-600' },
            ].map((d, idx) => (
              <div key={idx} className="p-3 bg-slate-50/70 rounded-2xl border border-black/[0.04] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{d.dept}</div>
                    <div className="text-[10px] text-slate-400">Head: {d.lead}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 tnum">{d.util}</span>
                    <div className="text-[10px] text-slate-500">{d.activeCount} Projects</div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: d.util }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Monday Digest & Top KPI Leaders */}
        <div className="apple-glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Automated Executive Digest Status</span>
            </h2>
            <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
              Monday 8:00 AM Active
            </span>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2 text-xs text-purple-950">
            <div className="font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-700" />
              Next Automated Dispatch: Monday, Sept 07, 08:00 WAT
            </div>
            <p className="text-[11px] text-purple-900/80">
              Dispatches automated PDF and email summary of revenue, overdue tasks, regulatory deadlines, and leaderboards to <b>{recipientsList.length} configured recipients</b>.
            </p>
          </div>

          {/* Top Performers Podiums */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Current Top Performers (Module 13 Live Engine)
            </div>
            {leaderboard.slice(0, 3).map((item, idx) => (
              <div key={item.userId} className="p-2.5 bg-white rounded-xl border border-black/[0.04] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-500">#{idx + 1}</span>
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.jobTitle}</div>
                  </div>
                </div>
                <div className="text-right font-black text-slate-900 tnum">{item.totalScore} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Digest Recipients Configuration Modal */}
      <AnimatePresence>
        {isDigestConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDigestConfigOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Executive Digest Distribution List</h3>
                  <div className="text-[10px] text-slate-400">Configurable custom email recipients</div>
                </div>
                <button onClick={() => setIsDigestConfigOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-700">Active Recipients:</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {recipientsList.map((email) => (
                    <div key={email} className="p-2 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-700">{email}</span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Recipient Form */}
              <form onSubmit={handleAddRecipient} className="flex gap-2 pt-2 border-t border-black/[0.05]">
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex-1 p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]"
                >
                  Add
                </button>
              </form>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsDigestConfigOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold active:scale-[0.96]"
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
