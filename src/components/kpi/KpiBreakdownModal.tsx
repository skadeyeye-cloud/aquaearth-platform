'use client';

import React, { useState } from 'react';
import { KpiLeaderboardEntry, TaskItem, UserProfile } from '@/lib/types';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  X, 
  Sparkles,
  Flame,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KpiBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: KpiLeaderboardEntry | null;
  tasks: TaskItem[];
  user?: UserProfile;
}

type TimeHorizon = 'WEEK' | 'MONTH' | 'QUARTER' | 'H1_H2' | 'YEAR';

export default function KpiBreakdownModal({ isOpen, onClose, entry, tasks, user }: KpiBreakdownModalProps) {
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('MONTH');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  // Filter tasks for this user
  const userCompletedTasks = tasks.filter(t => t.assigneeId === entry.userId && t.status === 'DONE');

  // Horizon multiplier/multi-period mockup
  const horizonStats = {
    WEEK: {
      label: 'This Week (Live Sprint)',
      attendancePts: 30,
      tasksPts: 50,
      qaPts: 0,
      bdPts: 0,
      totalPts: 80,
      streak: 3,
      deliverables: userCompletedTasks.slice(0, 1)
    },
    MONTH: {
      label: 'September 2026 (Active Cycle)',
      attendancePts: entry.onTimeCount * 10,
      tasksPts: entry.completedCount * 50,
      qaPts: 50,
      bdPts: 0,
      totalPts: entry.totalScore,
      streak: entry.onTimeCount,
      deliverables: userCompletedTasks
    },
    QUARTER: {
      label: 'Q3 2026 (July - September)',
      attendancePts: entry.onTimeCount * 10 + 120,
      tasksPts: entry.completedCount * 50 + 200,
      qaPts: 100,
      bdPts: 50,
      totalPts: entry.totalScore + 470,
      streak: entry.onTimeCount + 14,
      deliverables: [
        ...userCompletedTasks,
        {
          id: 'hist-q3-1',
          title: 'Escravos Tidal Baseline Model Calibration',
          moduleOrigin: 'PROJECT' as const,
          status: 'DONE' as const,
          priority: 'HIGH' as const,
          dueDate: '2026-07-22',
          completedAt: '2026-07-21',
          assigneeId: entry.userId,
          projectName: 'Chevron Escravos Terminal Expansion',
          estimatedHours: 20,
          loggedHours: 18
        }
      ]
    },
    H1_H2: {
      label: 'H2 2026 (July - December Projection)',
      attendancePts: 320,
      tasksPts: 600,
      qaPts: 200,
      bdPts: 100,
      totalPts: entry.totalScore + 750,
      streak: 28,
      deliverables: userCompletedTasks
    },
    YEAR: {
      label: '2026 Full Year Cumulative',
      attendancePts: 840,
      tasksPts: 1450,
      qaPts: 400,
      bdPts: 250,
      totalPts: entry.totalScore + 2100,
      streak: 84,
      deliverables: userCompletedTasks
    }
  };

  const currentStats = horizonStats[selectedHorizon];

  const handleDownloadReport = () => {
    setDownloadSuccess(`Generated official appraisal report: "AquaEarth_Appraisal_${entry.name.replace(/\s+/g, '_')}_${selectedHorizon}.pdf"`);
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-md" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-2xl max-w-2xl w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-5 z-10 text-xs overflow-hidden max-h-[90vh] flex flex-col justify-between"
      >
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Header Identity & Score */}
          <div className="flex items-start justify-between gap-3 border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
            <div className="flex items-center gap-3.5">
              <img
                src={entry.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={entry.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/[0.06] dark:ring-white/10 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {entry.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 tnum whitespace-nowrap shrink-0">
                    Rank #{entry.rankPosition}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {entry.jobTitle} • <b className="text-slate-700 dark:text-slate-300">{entry.departmentName}</b>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Time Horizon Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl overflow-x-auto">
            {(['WEEK', 'MONTH', 'QUARTER', 'H1_H2', 'YEAR'] as TimeHorizon[]).map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`flex-1 py-1.5 rounded-xl text-center font-bold text-[11px] transition-all whitespace-nowrap shrink-0 ${
                  selectedHorizon === h
                    ? 'bg-white dark:bg-[#121216] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {h === 'WEEK' ? 'Week' : h === 'MONTH' ? 'Month' : h === 'QUARTER' ? 'Quarter' : h === 'H1_H2' ? 'H1 / H2' : 'Full Year'}
              </button>
            ))}
          </div>

          {/* Score Deck Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Appraisal Score</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tnum tracking-tight">
                {currentStats.totalPts} <span className="text-xs font-semibold text-slate-400">pts</span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tier 1 Exceeds Target</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Punctuality Score</div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">
                {currentStats.attendancePts} <span className="text-xs font-semibold text-slate-400">pts</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                &le; 08:15 WAT (+10 pts each)
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Deliverable Deliveries</div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tnum">
                {currentStats.tasksPts} <span className="text-xs font-semibold text-slate-400">pts</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Tasks & QC Milestones (+50 pts)
              </div>
            </div>
          </div>

          {/* Breakdown Score Table */}
          <div className="p-4 bg-white dark:bg-[#121216] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] space-y-2.5">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              <span>{currentStats.label} — Point Ledger Breakdown</span>
              <span className="text-[10px] text-slate-400">NDPA Stamped</span>
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Station Clock-Ins & Shift Punctuality
                </span>
                <span className="font-bold text-slate-900 dark:text-white tnum">+{currentStats.attendancePts} pts</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  Technical Deliverables & Field Tasks Completed On-Time
                </span>
                <span className="font-bold text-slate-900 dark:text-white tnum">+{currentStats.tasksPts} pts</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                  QA/QC Peer Review Approvals & Compliance Gate Sign-Offs
                </span>
                <span className="font-bold text-slate-900 dark:text-white tnum">+{currentStats.qaPts} pts</span>
              </div>

              <div className="flex items-center justify-between py-1 font-bold">
                <span className="text-slate-900 dark:text-white">Total Period Calculated Performance</span>
                <span className="text-sm text-amber-600 dark:text-amber-400 tnum">+{currentStats.totalPts} pts</span>
              </div>
            </div>
          </div>

          {/* List of Deliverables in this Period */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">
              Deliverables Completed in Period ({currentStats.deliverables.length})
            </h3>

            {currentStats.deliverables.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-white/[0.02] rounded-xl">
                No closed deliverables in this immediate period.
              </div>
            ) : (
              currentStats.deliverables.map((task) => (
                <div key={task.id} className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">{task.title}</div>
                    <div className="text-[10px] text-slate-400">Project: {task.projectName || 'Operations'} • Completed: {task.completedAt || task.dueDate}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tnum whitespace-nowrap shrink-0">
                    +50 pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Download Notice & Footer Actions */}
        <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] space-y-2">
          {downloadSuccess && (
            <div className="p-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-center text-[11px] font-semibold">
              {downloadSuccess}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[10px] text-slate-400">
              Verified by AquaEarth Automated Appraisal Engine
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold whitespace-nowrap shrink-0"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-xs active:scale-[0.96] whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Appraisal Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
