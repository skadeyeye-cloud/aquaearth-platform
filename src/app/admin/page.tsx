'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Shield, 
  Award, 
  FolderKanban, 
  CalendarCheck, 
  Users, 
  GitFork, 
  Clock, 
  Lock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { 
    currentUser, 
    leaderboard, 
    projects, 
    attendanceRecords, 
    allUsers 
  } = useAuth();

  // KPI Calculations
  const totalCompanyKpi = leaderboard.reduce((acc, e) => acc + e.totalScore, 0);
  const avgCompanyKpi = leaderboard.length > 0 ? Math.round(totalCompanyKpi / leaderboard.length) : 0;
  const topKpiPerformer = leaderboard[0];

  // Running Projects
  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'MOBILIZATION');
  const activeContractValue = activeProjects.reduce((acc, p) => acc + p.contractValue, 0);
  const avgProjectProgress = activeProjects.length > 0 
    ? Math.round(activeProjects.reduce((acc, p) => acc + p.progressPercent, 0) / activeProjects.length) 
    : 0;

  // Attendance Summary
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceRecords = attendanceRecords.filter(a => a.date === todayStr);
  const onTimeAttendanceCount = todayAttendanceRecords.filter(a => a.status === 'PRESENT').length;
  const punctualityRate = todayAttendanceRecords.length > 0 
    ? Math.round((onTimeAttendanceCount / todayAttendanceRecords.length) * 100) 
    : 100;

  return (
    <div className="space-y-6 select-none">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            <span>Executive Governance • Module 1</span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Superadmin Executive Command
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Admin Operations Command
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time aggregate performance, live field contracts, and station attendance telemetry across AquaEarth operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            prefetch={true}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.12] rounded-xl text-xs font-semibold text-slate-800 dark:text-white shadow-xs hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.97]"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Access ({allUsers.length})</span>
          </Link>
          <Link
            href="/admin/audit-log"
            prefetch={true}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs active:scale-[0.97]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* 3 Core Interactive Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* WIDGET 1: Everyone's KPI Summary */}
        <Link
          href="/kpi/leaderboard"
          prefetch={true}
          className="block bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-4 shadow-xs apple-card-hover cursor-pointer hover:border-amber-400 transition-all group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Everyone&apos;s KPI Summary
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">All Company Personnel</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full tnum whitespace-nowrap shrink-0">
              {leaderboard.length} Staff
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tnum">
                {totalCompanyKpi.toLocaleString()} <span className="text-xs font-medium text-slate-400">pts</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Company Average: <b className="text-slate-800 dark:text-slate-200 tnum">{avgCompanyKpi} pts</b>
              </div>
            </div>

            {topKpiPerformer && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">Top Performer</div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[120px]">{topKpiPerformer.name}</div>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tnum">{topKpiPerformer.totalScore} pts</div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Click to inspect Leaderboard & Appraisal</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform whitespace-nowrap shrink-0">
              <span>View Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* WIDGET 2: Currently Running Projects Summary */}
        <Link
          href="/projects"
          prefetch={true}
          className="block bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-4 shadow-xs apple-card-hover cursor-pointer hover:border-indigo-400 transition-all group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Running Projects
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Live Field Operations</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full tnum whitespace-nowrap shrink-0">
              {activeProjects.length} Active
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tnum">
                {activeProjects.length} <span className="text-xs font-medium text-slate-400">Contracts</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active Value: <b className="text-slate-800 dark:text-slate-200 tnum">₦{(activeContractValue / 1_000_000).toFixed(1)}M</b>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">Milestone Pace</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tnum">{avgProjectProgress}%</div>
              <div className="w-20 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mt-1 ml-auto">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${avgProjectProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Chevron, Total E&P, Dangote</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform whitespace-nowrap shrink-0">
              <span>View Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* WIDGET 3: Attendance Summary */}
        <Link
          href="/hr/attendance"
          prefetch={true}
          className="block bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-4 shadow-xs apple-card-hover cursor-pointer hover:border-emerald-400 transition-all group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Daily Attendance Summary
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">GPS & Biometric Radar</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Live Radar
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tnum">
                {todayAttendanceRecords.length} <span className="text-xs font-medium text-slate-400">/ {allUsers.length} on Duty</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Punctuality: <b className="text-emerald-600 dark:text-emerald-400 tnum">{punctualityRate}% on-time</b>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium">Bases Active</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Lekki • Escravos • Bonny</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Synced</div>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Station timesheet & roll call</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Administrative Sub-Modules Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/admin/users"
          prefetch={true}
          className="block p-5 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-xs apple-card-hover cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between pb-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Role-Based Access Control</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Manage user roles, grant elevated tiers, and review access requests.
          </p>
        </Link>

        <Link 
          href="/admin/hierarchy"
          prefetch={true}
          className="block p-5 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-xs apple-card-hover cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between pb-2">
            <GitFork className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Organizational Hierarchy</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Inspect department reporting structures, team leads, and line managers.
          </p>
        </Link>

        <Link 
          href="/admin/audit-log"
          prefetch={true}
          className="block p-5 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-xs apple-card-hover cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between pb-2">
            <Lock className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Security & Audit Trail</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Cryptographically sealed event logs for logins, approvals, and data mutations.
          </p>
        </Link>
      </div>
    </div>
  );
}
