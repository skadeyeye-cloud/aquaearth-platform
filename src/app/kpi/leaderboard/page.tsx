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
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import KpiBreakdownModal from '@/components/kpi/KpiBreakdownModal';

export default function KpiLeaderboardPage() {
  const { leaderboard, currentUser, allUsers, tasks } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [drilldownEntry, setDrilldownEntry] = useState<KpiLeaderboardEntry | null>(null);

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

  // Determine allowed entries based on role
  let scopedEntries = leaderboard;

  if (isSuperadmin || isHr) {
    scopedEntries = leaderboard;
  } else if (isManagerOrLead) {
    const supervisedUserIds = new Set(
      allUsers
        .filter(u => u.id === currentUser.id || u.managerId === currentUser.id || u.departmentName === currentUser.departmentName)
        .map(u => u.id)
    );
    scopedEntries = leaderboard.filter(e => supervisedUserIds.has(e.userId));
  } else {
    scopedEntries = leaderboard.filter(e => e.userId === currentUser.id);
  }

  const filteredEntries = scopedEntries.filter(e => {
    return deptFilter === 'ALL' || e.departmentName.toLowerCase().includes(deptFilter.toLowerCase());
  });

  const isEmployeeOnly = !isSuperadmin && !isHr && !isManagerOrLead;
  const myEntry: KpiLeaderboardEntry = leaderboard.find(e => e.userId === currentUser.id) || {
    userId: currentUser.id,
    name: currentUser.name,
    jobTitle: currentUser.jobTitle,
    departmentName: currentUser.departmentName || 'Operations',
    avatar: currentUser.avatar,
    totalScore: 280,
    completedCount: 6,
    onTimeCount: 6,
    overdueCount: 0,
    rankPosition: 6,
    monthYear: '2026-09'
  };

  const topThree = filteredEntries.slice(0, 3);

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            <span>Module 13 • Monthly Performance Engine</span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              {isSuperadmin ? 'Superadmin Company-Wide' : isHr ? 'HR Governance View' : isManagerOrLead ? 'Department Supervisory Scope' : 'Personal Employee Record'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {isEmployeeOnly ? 'My KPI & Appraisal Score' : 'Performance KPI Leaderboard'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEmployeeOnly 
              ? 'Confidential metrics calculated from your punctual clock-ins, completed tasks, and field submissions. Click any score for full period audit breakdown.'
              : 'Appraisal scores and delivery metrics for staff under your governance. Click any personnel to inspect their score breakdown and deliverables.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.12] rounded-xl text-xs font-semibold text-slate-800 dark:text-white shadow-xs focus:outline-none"
          >
            <option value="2026-09">September 2026 (Live Cycle)</option>
            <option value="2026-08">August 2026 (Archive)</option>
            <option value="2026-07">July 2026 (Archive)</option>
          </select>

          <button 
            onClick={() => setDrilldownEntry(myEntry)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Appraisal PDF</span>
          </button>
        </div>
      </div>

      {/* Scoping Alert Banner for Individual Employees */}
      {isEmployeeOnly && (
        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <b>Confidentiality Scoped:</b> You are viewing your personal performance metrics. Click any metric card below to open the complete breakdown by Week, Month, Quarter, H1/H2, and Full Year.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Active Cycle
          </span>
        </div>
      )}

      {/* VIEW A: Individual Employee Performance Deck */}
      {isEmployeeOnly ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Score Card */}
          <div 
            onClick={() => setDrilldownEntry(myEntry)}
            className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-3 shadow-xs md:col-span-2 cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  September Appraisal Total (Click to Inspect)
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full tnum">
                Tier 1 Performer
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-2">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tnum">{myEntry.totalScore}</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-4 h-4" />
                <span>+65 pts this cycle</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
              <span>Click for historical breakdown & task audit ledger</span>
              <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                View Breakdown
              </span>
            </div>
          </div>

          {/* On-Time Punctuality Card */}
          <div 
            onClick={() => setDrilldownEntry(myEntry)}
            className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-2 shadow-xs cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Punctuality Streak</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum pt-2">
              {myEntry.onTimeCount} Days
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Target clock-in &le; 08:15 WAT (+10 pts each)
            </div>
          </div>

          {/* Deliverables Completed */}
          <div 
            onClick={() => setDrilldownEntry(myEntry)}
            className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-2 shadow-xs cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Deliverables Closed</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tnum pt-2">
              {myEntry.completedCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Tasks, field forms & QC milestones
            </div>
          </div>
        </div>
      ) : (
        /* VIEW B: Manager / Admin Supervisory Podium */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => setDrilldownEntry(topThree[1])}
              className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 relative md:order-1 order-2 shadow-xs cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                🥈 2nd Place
              </div>
              <img
                src={topThree[1].avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'}
                alt={topThree[1].name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/[0.06] dark:ring-white/10"
              />
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">{topThree[1].name}</h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{topThree[1].jobTitle}</div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tnum">{topThree[1].totalScore} <span className="text-xs font-medium text-slate-400">pts</span></div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tnum">{topThree[1].completedCount} completed items</div>
            </motion.div>
          )}

          {/* 1st Place Champion */}
          {topThree[0] && (
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={() => setDrilldownEntry(topThree[0])}
              className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white dark:to-[#0c0c0e] rounded-3xl p-6 border border-amber-300 dark:border-amber-500/30 shadow-md flex flex-col items-center text-center space-y-3 relative md:order-2 order-1 md:-mt-2 cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                <Crown className="w-3 h-3 fill-current" />
                Team Top Performer
              </div>
              <img
                src={topThree[0].avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'}
                alt={topThree[0].name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-300 dark:ring-amber-500/40 shadow-md"
              />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{topThree[0].name}</h3>
                <div className="text-xs text-amber-900/80 dark:text-amber-300/80 font-medium">{topThree[0].jobTitle}</div>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tnum">{topThree[0].totalScore} <span className="text-sm font-semibold text-amber-800/60 dark:text-amber-300/60">pts</span></div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span className="tnum">{topThree[0].onTimeCount} On-Time Streak</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div 
              whileHover={{ y: -3 }}
              onClick={() => setDrilldownEntry(topThree[2])}
              className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 relative md:order-3 order-3 shadow-xs cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                🥉 3rd Place
              </div>
              <img
                src={topThree[2].avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                alt={topThree[2].name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/[0.06] dark:ring-white/10"
              />
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">{topThree[2].name}</h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{topThree[2].jobTitle}</div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tnum">{topThree[2].totalScore} <span className="text-xs font-medium text-slate-400">pts</span></div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tnum">{topThree[2].completedCount} completed items</div>
            </motion.div>
          )}
        </div>
      )}

      {/* Standings Table (Scoped with interactive Row Click) */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              {isEmployeeOnly ? 'Your Personal Score Ledger' : 'Team Appraisal Standings'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEmployeeOnly ? 'Calculated automatically by the AquaEarth KPI Engine. Click row to inspect breakdown.' : `Showing ${filteredEntries.length} personnel in your reporting scope. Click any row for deep audit evaluation.`}
            </p>
          </div>

          {(isSuperadmin || isHr) && (
            <div className="flex items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-white/10 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">All Departments</option>
                <option value="Geotechnical">Geotechnical</option>
                <option value="Environmental">ESIA / Environmental</option>
                <option value="Geoinformatics">GIS / Survey</option>
                <option value="Quality">QA / QC</option>
                <option value="IT">IT & Digital</option>
              </select>
            </div>
          )}
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
                <th className="px-5 py-3 text-right">Total KPI Score</th>
                <th className="px-5 py-3 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
              {filteredEntries.map((entry) => {
                const isMe = entry.userId === currentUser.id;
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
                              <span className="text-[9px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-1.5 py-0.2 rounded font-bold">YOU</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{entry.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 text-[11px]">{entry.departmentName}</td>
                    <td className="px-5 py-3 text-center font-semibold text-slate-800 dark:text-slate-200 tnum">{entry.completedCount}</td>
                    <td className="px-5 py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold tnum">{entry.onTimeCount}</td>
                    <td className="px-5 py-3 text-right font-bold text-xs text-slate-900 dark:text-white tnum">{entry.totalScore} pts</td>
                    <td className="px-5 py-3 text-center">
                      <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
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

      {/* KPI Evaluation & Breakdown Drilldown Modal */}
      <KpiBreakdownModal
        isOpen={!!drilldownEntry}
        onClose={() => setDrilldownEntry(null)}
        entry={drilldownEntry}
        tasks={tasks}
        user={allUsers.find(u => u.id === drilldownEntry?.userId)}
      />
    </div>
  );
}
