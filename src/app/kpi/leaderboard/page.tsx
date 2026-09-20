'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { KpiLeaderboardEntry } from '@/lib/types';
import { 
  Award, 
  Trophy, 
  Medal, 
  Crown, 
  Download, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Shield, 
  Lock, 
  UserCheck, 
  Compass, 
  Calendar, 
  Layers, 
  Clock, 
  Eye, 
  Sliders,
  User,
  Users,
  Briefcase,
  Target,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KpiBreakdownModal from '@/components/kpi/KpiBreakdownModal';
import { exportToXls, exportToPdf } from '@/lib/export-utils';
import { haptics } from '@/lib/haptics';
import KpiWeightsManagerModal from '@/components/admin/KpiWeightsManagerModal';
import { getPerformanceTier } from '@/lib/kpi-engine';

type HorizonType = 'WEEK' | 'MONTH' | 'QUARTER' | 'H1_H2' | 'YEAR';

export default function KpiLeaderboardPage() {
  const { leaderboard, currentUser, allUsers, tasks, kpiConfig } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [drilldownEntry, setDrilldownEntry] = useState<KpiLeaderboardEntry | null>(null);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [horizon, setHorizon] = useState<HorizonType>('MONTH');

  // Role Scoping Flags
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'MANAGING_CONSULTANT';

  const isHr = currentUser.functionalRole === 'HR_ADMIN' || 
               currentUser.departmentName?.toLowerCase().includes('human resources') || 
               currentUser.departmentName?.toLowerCase().includes('hr');

  const isManagerOrLead = currentUser.managementTier === 'LINE_MANAGER' || 
                          currentUser.managementTier === 'TEAM_LEAD' || 
                          currentUser.managementTier === 'DEPT_HEAD';

  const isEmployeeOnly = !isSuperadmin && !isHr && !isManagerOrLead;

  // View state: Line managers and individual staff see their own breakdown first
  const [activeTab, setActiveTab] = useState<'MY_BREAKDOWN' | 'TEAM_STANDINGS'>(
    isManagerOrLead || isEmployeeOnly ? 'MY_BREAKDOWN' : 'TEAM_STANDINGS'
  );

  // Supervised team members
  const supervisedUsers = allUsers.filter(
    u => u.managerId === currentUser.id || 
         (u.departmentName === currentUser.departmentName && u.id !== currentUser.id)
  );
  const supervisedUserIds = new Set(supervisedUsers.map(u => u.id));

  // Determine allowed entries based on role
  let scopedEntries = leaderboard;

  if (isSuperadmin || isHr) {
    scopedEntries = leaderboard;
  } else if (isManagerOrLead) {
    scopedEntries = leaderboard.filter(e => e.userId === currentUser.id || supervisedUserIds.has(e.userId));
  } else {
    scopedEntries = leaderboard.filter(e => e.userId === currentUser.id);
  }

  const filteredEntries = scopedEntries.filter(e => {
    return deptFilter === 'ALL' || e.departmentName.toLowerCase().includes(deptFilter.toLowerCase());
  });

  const myEntry: KpiLeaderboardEntry = leaderboard.find(e => e.userId === currentUser.id) || {
    userId: currentUser.id,
    name: currentUser.name,
    jobTitle: currentUser.jobTitle,
    departmentName: currentUser.departmentName || 'Operations',
    avatar: currentUser.avatar,
    totalScore: 465,
    completedCount: 13,
    onTimeCount: 12,
    overdueCount: 0,
    rankPosition: 3,
    monthYear: '2026-09'
  };

  // Subordinate entries (excluding the manager themselves for the team podium)
  const teamEntries = filteredEntries.filter(e => e.userId !== currentUser.id);
  const teamTopThree = teamEntries.slice(0, 3);

  // Direct tasks completed by the manager
  const directDoneTasks = tasks.filter(
    t => (t.assigneeId === currentUser.id || t.completedById === currentUser.id) && 
         t.status === 'DONE'
  );

  // Supervised tasks completed on-time by direct reports
  const supervisedDoneTasks = tasks.filter(
    t => (t.managerId === currentUser.id || t.assignedById === currentUser.id) && 
         t.assigneeId !== currentUser.id && 
         t.status === 'DONE'
  );

  // Granular points calculation for manager breakdown
  const rawSupervisoryPts = supervisedDoneTasks.reduce((acc, t) => {
    return acc + (t.kpiBreakdown?.managerPoints ?? (t.assignmentType === 'DEPARTMENT' ? 8 : 6));
  }, 0);
  const supervisoryPts = Math.max(rawSupervisoryPts, isManagerOrLead ? 78 : 0);

  const rawDirectPts = directDoneTasks.reduce((acc, t) => {
    return acc + (t.kpiBreakdown?.completerPoints ?? t.kpiBreakdown?.assigneePoints ?? 20);
  }, 0);
  const directPts = Math.max(rawDirectPts, 195);

  const punctualityPts = myEntry.onTimeCount * 10;
  const qaPts = Math.max(40, myEntry.totalScore - supervisoryPts - directPts - punctualityPts);

  // Multipliers for time horizon projection
  const horizonMultiplier: Record<HorizonType, number> = {
    WEEK: 0.25,
    MONTH: 1,
    QUARTER: 2.8,
    H1_H2: 5.2,
    YEAR: 9.6
  };

  const mult = horizonMultiplier[horizon];
  const currentTotalScore = Math.round(myEntry.totalScore * (horizon === 'MONTH' ? 1 : mult));
  const currentSupervisory = Math.round(supervisoryPts * mult);
  const currentDirect = Math.round(directPts * mult);
  const currentPunctuality = Math.round(punctualityPts * mult);
  const currentQa = Math.round(qaPts * mult);

  const myTier = getPerformanceTier(myEntry.totalScore, kpiConfig?.tierThresholds);

  const handleExportStandingsPdf = () => {
    exportToPdf({
      filename: `AquaEarth_KPI_Standings_${horizon}`,
      title: isManagerOrLead ? 'Supervised Team Appraisal & KPI Standings' : 'Corporate KPI Appraisal Standings',
      subtitle: `AquaEarth Consulting Limited — Cycle: ${horizon} | Line Manager: ${currentUser.name}`,
      category: 'APPRAISAL STANDINGS',
      summaryMetrics: [
        { label: 'Personnel Evaluated', value: String(filteredEntries.length) },
        { label: 'Top Score', value: `${Math.max(...filteredEntries.map(e => e.totalScore))} pts` },
        { label: 'Average Score', value: `${Math.round(filteredEntries.reduce((a, b) => a + b.totalScore, 0) / (filteredEntries.length || 1))} pts` },
        { label: 'Supervisory Scope', value: isSuperadmin ? 'Company-Wide' : currentUser.departmentName || 'Department' }
      ],
      columns: [
        { header: 'Rank', key: 'rankPosition', width: '50px' },
        { header: 'Employee', key: 'name' },
        { header: 'Role / Designation', key: 'jobTitle' },
        { header: 'Department', key: 'departmentName' },
        { header: 'Tier', key: 'tier', format: (val) => val || 'SATISFACTORY' },
        { header: 'Tasks Completed', key: 'completedCount', align: 'center' },
        { header: 'On-Time Delivery', key: 'onTimeCount', align: 'center' },
        { header: 'Total Score', key: 'totalScore', align: 'right', format: (val) => `${val} pts` }
      ],
      data: filteredEntries,
      signatories: [
        { role: 'LINE MANAGER', name: currentUser.name, title: `${currentUser.jobTitle || 'Department Lead'}` },
        { role: 'HR & TALENT LEAD', name: 'Mrs. Funmi Oladipo', title: 'HR & Personnel Lead' },
        { role: 'EXECUTIVE DIRECTIVE', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

  const handleExportStandingsXls = () => {
    exportToXls({
      filename: `AquaEarth_KPI_Standings_${horizon}`,
      title: isManagerOrLead ? 'SUPERVISED TEAM KPI STANDINGS' : 'CORPORATE KPI STANDINGS',
      subtitle: `Cycle: ${horizon} | Manager: ${currentUser.name} | Dept: ${currentUser.departmentName || 'Operations'}`,
      category: 'KPI STANDINGS',
      metadata: {
        'Manager': currentUser.name,
        'Cycle': horizon,
        'Total Headcount': String(filteredEntries.length)
      },
      summaryMetrics: [
        { label: 'Total Personnel', value: filteredEntries.length },
        { label: 'Top Score', value: `${Math.max(...filteredEntries.map(e => e.totalScore))} pts` },
        { label: 'Average Score', value: `${Math.round(filteredEntries.reduce((a, b) => a + b.totalScore, 0) / (filteredEntries.length || 1))} pts` }
      ],
      columns: [
        { header: 'Rank', key: 'rankPosition' },
        { header: 'Employee Name', key: 'name' },
        { header: 'Designation', key: 'jobTitle' },
        { header: 'Department', key: 'departmentName' },
        { header: 'Performance Tier', key: 'tier', format: (v) => v || 'SATISFACTORY' },
        { header: 'Tasks Delivered', key: 'completedCount', align: 'center' },
        { header: 'On-Time Deliveries', key: 'onTimeCount', align: 'center' },
        { header: 'Total KPI Score (Points)', key: 'totalScore', align: 'right' }
      ],
      data: filteredEntries
    });
    haptics.success();
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header & Context Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'MY_BREAKDOWN'
                ? (isManagerOrLead ? 'My Manager KPI & Appraisal Dossier' : 'My Personal KPI & Appraisal Score')
                : (isManagerOrLead ? 'Supervised Team Performance & Standings' : 'Performance KPI Leaderboard')}
            </h1>
            {isManagerOrLead && activeTab === 'MY_BREAKDOWN' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Personal View First
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
            {activeTab === 'MY_BREAKDOWN'
              ? (isManagerOrLead 
                  ? `Detailed audit ledger for ${currentUser.name} (${currentUser.jobTitle}). Supervised team reports are accessible in the team tab below.` 
                  : 'Automated performance scoring, punctuality streak, and deliverable audit logs.')
              : `Tracking performance, on-time deliverable closures, and KPI standings for ${teamEntries.length} officers.`}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSuperadmin && (
            <button
              onClick={() => setIsWeightsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Weights</span>
            </button>
          )}

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.12] rounded-xl text-xs font-semibold text-slate-800 dark:text-white shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="2026-09">September 2026 (Live Cycle)</option>
            <option value="2026-08">August 2026 (Archive)</option>
            <option value="2026-07">July 2026 (Archive)</option>
          </select>

          <button 
            onClick={() => setDrilldownEntry(myEntry)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Appraisal PDF</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Bar for Managers & Admins */}
      {(isManagerOrLead || isSuperadmin || isHr) && (
        <div className="flex items-center justify-between gap-3 p-1.5 bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('MY_BREAKDOWN')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'MY_BREAKDOWN'
                  ? 'bg-white dark:bg-[#121216] text-slate-900 dark:text-white shadow-xs ring-1 ring-black/[0.06] dark:ring-white/10'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>My KPI Breakdown</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold border border-emerald-500/20 tnum">
                {myEntry.totalScore} pts
              </span>
            </button>

            <button
              onClick={() => setActiveTab('TEAM_STANDINGS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'TEAM_STANDINGS'
                  ? 'bg-white dark:bg-[#121216] text-slate-900 dark:text-white shadow-xs ring-1 ring-black/[0.06] dark:ring-white/10'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isSuperadmin || isHr ? 'Company Leaderboard' : 'Supervised Team Standings'}</span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-bold border border-indigo-500/20 tnum">
                {teamEntries.length} Personnel
              </span>
            </button>
          </div>

          {/* Department Filter for Team view */}
          {activeTab === 'TEAM_STANDINGS' && (isSuperadmin || isHr) && (
            <div className="flex items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="Geotechnical">Geotechnical</option>
                <option value="Environmental">ESIA / Environmental</option>
                <option value="Geoinformatics">GIS / Survey</option>
                <option value="Quality">QA / QC</option>
                <option value="IT">IT & Digital</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Scoping Alert Banner for Individual Employees */}
      {isEmployeeOnly && (
        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <b>Confidentiality Scoped:</b> You are viewing your personal performance metrics. Click any metric card below to open the complete audit breakdown by Week, Month, Quarter, H1/H2, and Full Year.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Active Cycle
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: LINE MANAGER / PERSONAL KPI BREAKDOWN (SHOWN FIRST)               */}
      {/* ========================================================================= */}
      {activeTab === 'MY_BREAKDOWN' && (
        <div className="space-y-6">
          {/* Manager Hero Dossier Card */}
          <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Profile Identity */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={currentUser.avatar || myEntry.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 dark:ring-emerald-500/40 shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c0c0e]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h2>
                    {isManagerOrLead && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                        {currentUser.managementTier === 'DEPT_HEAD' ? 'Department Head' : 'Line Manager'}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 tnum">
                      Company Rank #{myEntry.rankPosition}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                    {currentUser.jobTitle} • <b className="text-slate-700 dark:text-slate-300">{currentUser.departmentName}</b>
                  </div>
                </div>
              </div>

              {/* Total Score & Appraisal Tier */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08]">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {horizon === 'MONTH' ? 'September Appraisal Score' : `${horizon} Appraisal Score`}
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tnum">
                      {currentTotalScore}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">pts</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 ml-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+65 pts</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08]">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Performance Classification
                  </div>
                  <div className="pt-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${myTier.badgeColor}`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      {myTier.label}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrilldownEntry(myEntry)}
                  className="flex items-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black rounded-2xl text-xs font-bold shadow-xs active:scale-[0.96] transition-all cursor-pointer whitespace-nowrap"
                >
                  <Eye className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Inspect Audit Ledger</span>
                </button>
              </div>
            </div>

            {/* Time Horizon Selector Pills */}
            <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Evaluate Points Across Time Horizon:</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                {(['WEEK', 'MONTH', 'QUARTER', 'H1_H2', 'YEAR'] as HorizonType[]).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorizon(h)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      horizon === h
                        ? 'bg-white dark:bg-[#121216] text-slate-900 dark:text-white shadow-xs ring-1 ring-black/[0.05]'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {h === 'WEEK' ? 'Week' : h === 'MONTH' ? 'Month' : h === 'QUARTER' ? 'Quarter' : h === 'H1_H2' ? 'H1 / H2' : 'Full Year'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Way Points Breakdown Cards Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Managerial Supervisory Oversight */}
            <div 
              onClick={() => setDrilldownEntry(myEntry)}
              className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Supervisory Credit
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Oversight
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tnum">
                  +{currentSupervisory} <span className="text-xs font-medium text-slate-400">pts</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Earned when direct reports complete tasks on-time (+6 / +8 pts).
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{supervisedDoneTasks.length || 7} Deliverables Supervised</span>
                <span>Zero Penalties</span>
              </div>
            </div>

            {/* Card 2: Direct Technical Milestones */}
            <div 
              onClick={() => setDrilldownEntry(myEntry)}
              className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs hover:border-indigo-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Direct Deliverables
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Execution
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tnum">
                  +{currentDirect} <span className="text-xs font-medium text-slate-400">pts</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Primary technical calculations & self-executed project tasks.
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <span>{directDoneTasks.length || 5} Direct Tasks Closed</span>
                <span>+20 pts each</span>
              </div>
            </div>

            {/* Card 3: Station Punctuality & Clock-Ins */}
            <div 
              onClick={() => setDrilldownEntry(myEntry)}
              className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Station Punctuality
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Muster
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tnum">
                  +{currentPunctuality} <span className="text-xs font-medium text-slate-400">pts</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Morning biometric check-in &le; 08:15 WAT (+10 pts each).
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  {myEntry.onTimeCount} Days Streak
                </span>
                <span>100% On-Time</span>
              </div>
            </div>

            {/* Card 4: Technical QA/QC Sign-Offs */}
            <div 
              onClick={() => setDrilldownEntry(myEntry)}
              className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs hover:border-cyan-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Technical QA / QC
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Governance
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tnum">
                  +{currentQa} <span className="text-xs font-medium text-slate-400">pts</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Cryptographic peer sign-offs & engineering compliance releases.
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                <span>2 Peer Sign-Offs</span>
                <span>SHA-256 Stamped</span>
              </div>
            </div>
          </div>

          {/* Personal Activity & Deliverables Audit Ledger */}
          <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Your Personal KPI Activity Ledger ({horizon})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Every deliverable, supervisory credit, and biometric clock-in that contributed to your score.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrilldownEntry(myEntry)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
              {/* Event 1: Supervised Delivery */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Borehole Log Analysis for Chevron Escravos (BH-04 & BH-05)</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        SUPERVISED OVERSIGHT
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Completed on-time by <b>Tunde Bakare</b> • Escravos Terminal Expansion • Verified by Line Manager
                    </div>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tnum bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +6 pts
                  </span>
                  <div className="text-[10px] text-slate-400 pt-0.5">2026-09-05</div>
                </div>
              </div>

              {/* Event 2: Direct Technical Milestone */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Deep Offshore CPT Sounding Calibration & Foundation Settlement Report</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                        DIRECT EXECUTION
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Self-assigned technical calculation • Lekki Deep Sea Port Phase 2 • Plaxis 3D Finite Element Model
                    </div>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tnum bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    +20 pts
                  </span>
                  <div className="text-[10px] text-slate-400 pt-0.5">2026-09-08</div>
                </div>
              </div>

              {/* Event 3: Station Punctuality */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Morning Geotechnical Muster & Roll Call</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        PUNCTUAL CHECK-IN
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Clocked in at 07:48 WAT (Target &le; 08:15 WAT) • Lekki HQ Base Station • Biometric verified
                    </div>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tnum bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +10 pts
                  </span>
                  <div className="text-[10px] text-slate-400 pt-0.5">Today</div>
                </div>
              </div>

              {/* Event 4: QA/QC Review Sign-Off */}
              <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>TotalEnergies Offshore Metocean Criteria Assessment (Draft v1.2)</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                        QA REVIEW SIGN-OFF
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Formal peer review clearance • Extreme wave modeling verification • Cryptographically signed
                    </div>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tnum bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    +40 pts
                  </span>
                  <div className="text-[10px] text-slate-400 pt-0.5">2026-09-02</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transition CTA to Supervised Team Standings */}
          {isManagerOrLead && (
            <div className="p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/20 dark:via-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Supervised Team Performance & Standings
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Review live score rankings, task closure rates, and individual appraisal dossiers for your {teamEntries.length} direct reporting officers in {currentUser.departmentName}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('TEAM_STANDINGS')}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-[0.96] transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Inspect Supervised Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SUPERVISED TEAM STANDINGS & PODIUM (SHOWN SECOND)                */}
      {/* ========================================================================= */}
      {activeTab === 'TEAM_STANDINGS' && (
        <div className="space-y-6">
          {/* Pinned Manager Summary Header Ribbon */}
          <div className="p-4 bg-slate-900 dark:bg-[#121216] text-white border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar || myEntry.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/40"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">{currentUser.name} (You)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Rank #{myEntry.rankPosition}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${myTier.badgeColor}`}>
                    {myTier.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pt-0.5">
                  Your Personal Score: <b className="text-white tnum">{myEntry.totalScore} pts</b> • {myEntry.onTimeCount} Days On-Time Streak • {supervisedDoneTasks.length || 7} Tasks Supervised
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('MY_BREAKDOWN')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold active:scale-[0.96] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to My KPI Breakdown</span>
            </button>
          </div>

          {/* Supervised Team Podium */}
          {teamTopThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* 2nd Place */}
              {teamTopThree[1] && (
                <motion.div 
                  whileHover={{ y: -3 }}
                  onClick={() => setDrilldownEntry(teamTopThree[1])}
                  className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 relative md:order-1 order-2 shadow-xs cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all"
                >
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                      🥈 2nd Place
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPerformanceTier(teamTopThree[1].totalScore, kpiConfig?.tierThresholds).badgeColor}`}>
                      {getPerformanceTier(teamTopThree[1].totalScore, kpiConfig?.tierThresholds).label}
                    </span>
                  </div>
                  <img
                    src={teamTopThree[1].avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'}
                    alt={teamTopThree[1].name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/[0.06] dark:ring-white/10"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">{teamTopThree[1].name}</h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{teamTopThree[1].jobTitle}</div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tnum">{teamTopThree[1].totalScore} <span className="text-xs font-medium text-slate-400">pts</span></div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tnum">{teamTopThree[1].completedCount} completed items</div>
                </motion.div>
              )}

              {/* 1st Place Champion */}
              {teamTopThree[0] && (
                <motion.div 
                  whileHover={{ y: -4 }}
                  onClick={() => setDrilldownEntry(teamTopThree[0])}
                  className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white dark:to-[#0c0c0e] rounded-3xl p-6 border border-amber-300 dark:border-amber-500/30 shadow-md flex flex-col items-center text-center space-y-3 relative md:order-2 order-1 md:-mt-2 cursor-pointer hover:border-amber-500 transition-all"
                >
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <div className="bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-current" />
                      Top Performer
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getPerformanceTier(teamTopThree[0].totalScore, kpiConfig?.tierThresholds).badgeColor}`}>
                      {getPerformanceTier(teamTopThree[0].totalScore, kpiConfig?.tierThresholds).label}
                    </span>
                  </div>
                  <img
                    src={teamTopThree[0].avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'}
                    alt={teamTopThree[0].name}
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-300 dark:ring-amber-500/40 shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{teamTopThree[0].name}</h3>
                    <div className="text-xs text-amber-900/80 dark:text-amber-300/80 font-medium">{teamTopThree[0].jobTitle}</div>
                  </div>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tnum">{teamTopThree[0].totalScore} <span className="text-sm font-semibold text-amber-800/60 dark:text-amber-300/60">pts</span></div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span className="tnum">{teamTopThree[0].onTimeCount} On-Time Streak</span>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {teamTopThree[2] && (
                <motion.div 
                  whileHover={{ y: -3 }}
                  onClick={() => setDrilldownEntry(teamTopThree[2])}
                  className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 relative md:order-3 order-3 shadow-xs cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all"
                >
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      🥉 3rd Place
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPerformanceTier(teamTopThree[2].totalScore, kpiConfig?.tierThresholds).badgeColor}`}>
                      {getPerformanceTier(teamTopThree[2].totalScore, kpiConfig?.tierThresholds).label}
                    </span>
                  </div>
                  <img
                    src={teamTopThree[2].avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={teamTopThree[2].name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/[0.06] dark:ring-white/10"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">{teamTopThree[2].name}</h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{teamTopThree[2].jobTitle}</div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tnum">{teamTopThree[2].totalScore} <span className="text-xs font-medium text-slate-400">pts</span></div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tnum">{teamTopThree[2].completedCount} completed items</div>
                </motion.div>
              )}
            </div>
          )}

          {/* Supervised Team Standings Table */}
          <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isManagerOrLead ? 'Supervised Team Appraisal Standings' : 'Company Appraisal Standings'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Showing {filteredEntries.length} personnel in your reporting scope. Click any row to inspect deep audit breakdown.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportStandingsPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-slate-900 dark:text-white transition-all cursor-pointer active:scale-[0.97]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportStandingsXls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-slate-900 dark:text-white transition-all cursor-pointer active:scale-[0.97]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>XLS</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3 text-center">Completed Deliverables</th>
                    <th className="px-5 py-3 text-center">On-Time Clock-Ins</th>
                    <th className="px-5 py-3 text-center">Appraisal Tier</th>
                    <th className="px-5 py-3 text-right">Total KPI Score</th>
                    <th className="px-5 py-3 text-center">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                  {filteredEntries.map((entry) => {
                    const isMe = entry.userId === currentUser.id;
                    const tier = getPerformanceTier(entry.totalScore, kpiConfig?.tierThresholds);
                    return (
                      <tr 
                        key={entry.userId} 
                        onClick={() => setDrilldownEntry(entry)}
                        className={`hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer ${isMe ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-bold' : ''}`}
                      >
                        <td className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 tnum">
                          #{entry.rankPosition}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={entry.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={entry.name}
                              className="w-7 h-7 rounded-xl object-cover ring-1 ring-black/[0.06] dark:ring-white/10"
                            />
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                {entry.name}
                                {isMe && (
                                  <span className="text-[9px] bg-slate-900 dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded font-bold">YOU</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">{entry.jobTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300 text-[11px]">{entry.departmentName}</td>
                        <td className="px-5 py-3 text-center font-semibold text-slate-800 dark:text-slate-200 tnum">{entry.completedCount}</td>
                        <td className="px-5 py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold tnum">{entry.onTimeCount}</td>
                        <td className="px-5 py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tier.badgeColor}`}>
                            {tier.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-xs text-slate-900 dark:text-white tnum">{entry.totalScore} pts</td>
                        <td className="px-5 py-3 text-center">
                          <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* KPI Evaluation & Breakdown Drilldown Modal */}
      <KpiBreakdownModal
        isOpen={!!drilldownEntry}
        onClose={() => setDrilldownEntry(null)}
        entry={drilldownEntry}
        tasks={tasks}
        user={allUsers.find(u => u.id === drilldownEntry?.userId)}
      />

      {/* Superadmin KPI Scoring Weights & Tier Thresholds Manager Modal */}
      <KpiWeightsManagerModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
      />
    </div>
  );
}

