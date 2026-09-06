'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  TrendingUp, 
  Award, 
  PlaneTakeoff, 
  Check,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  FolderOpen,
  Shield,
  FolderKanban,
  CalendarCheck,
  ArrowRight,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RequestIntakeModal from '@/components/workspace/RequestIntakeModal';
import CreateTaskModal from '@/components/workspace/CreateTaskModal';

export default function MyWorkspacePage() {
  const router = useRouter();
  const { 
    currentUser, 
    tasks, 
    tickets, 
    leaderboard, 
    projects, 
    attendanceRecords, 
    allUsers, 
    updateTaskStatus, 
    submitLeaveRequest 
  } = useAuth();

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'IN_PROGRESS' | 'URGENT' | 'DONE'>('ALL');

  // Leave modal state
  const [leaveType, setLeaveType] = useState<'ANNUAL' | 'SICK' | 'CASUAL'>('ANNUAL');
  const [startDate, setStartDate] = useState('2026-09-14');
  const [endDate, setEndDate] = useState('2026-09-18');
  const [daysCount, setDaysCount] = useState(5);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myTickets = tickets.filter(t => t.requesterId === currentUser.id);
  const myKpi = leaderboard.find(l => l.userId === currentUser.id) || {
    totalScore: 280,
    rankPosition: 6,
    completedCount: 6,
    onTimeCount: 6,
    overdueCount: 0
  };

  const isAdminOrLeadership = currentUser.accessTier === 'SUPERADMIN' || 
                              currentUser.functionalRole === 'SUPERADMIN' || 
                              currentUser.functionalRole === 'MANAGING_CONSULTANT' ||
                              currentUser.functionalRole === 'HR_ADMIN' ||
                              currentUser.managementTier === 'DEPT_HEAD';

  // Admin Aggregate Metrics
  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'MOBILIZATION');
  const activeContractValue = activeProjects.reduce((acc, p) => acc + p.contractValue, 0);
  const avgProjectProgress = activeProjects.length > 0 
    ? Math.round(activeProjects.reduce((acc, p) => acc + p.progressPercent, 0) / activeProjects.length) 
    : 0;

  const totalCompanyKpi = leaderboard.reduce((acc, e) => acc + e.totalScore, 0);
  const avgCompanyKpi = leaderboard.length > 0 ? Math.round(totalCompanyKpi / leaderboard.length) : 0;
  const topKpiPerformer = leaderboard[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceRecords = attendanceRecords.filter(a => a.date === todayStr);
  const onTimeAttendanceCount = todayAttendanceRecords.filter(a => a.status === 'PRESENT').length;
  const punctualityRate = todayAttendanceRecords.length > 0 
    ? Math.round((onTimeAttendanceCount / todayAttendanceRecords.length) * 100) 
    : 100;

  const filteredTasks = myTasks.filter(t => {
    if (taskFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'NOT_STARTED';
    if (taskFilter === 'URGENT') return t.priority === 'HIGH' || t.priority === 'URGENT';
    if (taskFilter === 'DONE') return t.status === 'DONE';
    return true;
  });

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest({
      leaveType,
      startDate: startDate || '2026-09-10',
      endDate: endDate || '2026-09-15',
      daysCount: Number(daysCount),
      reason: leaveReason
    });
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setIsLeaveModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Apple Header Canvas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight flex items-center gap-2">
            <span>AquaEarth Workspace • {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {isAdminOrLeadership && (
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Executive Governance Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Good day, {currentUser.name.split(' ')[0]}
          </h1>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#16161a] border border-black/[0.08] dark:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-[#202026] text-slate-800 dark:text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.96] cursor-pointer"
          >
            <PlaneTakeoff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
            <span>Take Time Off</span>
          </button>
          <button
            type="button"
            onClick={() => setIsIntakeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#16161a] border border-black/[0.08] dark:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-[#202026] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.96] cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Admin Executive Command Deck: Summary of KPI, Running Projects, and Attendance */}
      {isAdminOrLeadership && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Executive Operations Overview (Click any widget to open module)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Live System Status • All Nodes Normal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WIDGET 1: Everyone's KPI Summary */}
            <Link
              href="/kpi/leaderboard"
              prefetch={true}
              className="block bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs apple-card-hover cursor-pointer hover:border-amber-400/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Everyone&apos;s KPI Summary</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full tnum whitespace-nowrap shrink-0">
                  {leaderboard.length} Staff Scored
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tnum">
                    {totalCompanyKpi.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts total</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Team Average: <b className="text-slate-700 dark:text-slate-300 tnum">{avgCompanyKpi} pts</b>
                  </div>
                </div>

                {topKpiPerformer && (
                  <div className="text-right">
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Top Performer</div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">{topKpiPerformer.name}</div>
                    <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tnum">{topKpiPerformer.totalScore} pts</div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px]">Monthly leaderboard & appraisal ledger</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px] whitespace-nowrap shrink-0">
                  Open KPI &rarr;
                </span>
              </div>
            </Link>

            {/* WIDGET 2: Currently Running Projects Summary */}
            <Link
              href="/projects"
              prefetch={true}
              className="block bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs apple-card-hover cursor-pointer hover:border-indigo-400/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <FolderKanban className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Currently Running Projects</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full tnum whitespace-nowrap shrink-0">
                  {activeProjects.length} in Field
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tnum">
                    {activeProjects.length} <span className="text-xs font-normal text-slate-400">Projects</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Contract Value: <b className="text-slate-700 dark:text-slate-300 tnum">₦{(activeContractValue / 1_000_000).toFixed(1)}M</b>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Avg Progress</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">{avgProjectProgress}%</div>
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mt-1 ml-auto">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${avgProjectProgress}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px]">Chevron Escravos, Total E&P, Dangote</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px] whitespace-nowrap shrink-0">
                  Open Projects &rarr;
                </span>
              </div>
            </Link>

            {/* WIDGET 3: Attendance Summary */}
            <Link
              href="/hr/attendance"
              prefetch={true}
              className="block bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs apple-card-hover cursor-pointer hover:border-emerald-400/80 transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <CalendarCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Daily Attendance Summary</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  Live Station Radar
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tnum">
                    {todayAttendanceRecords.length} <span className="text-xs font-normal text-slate-400">/ {allUsers.length} on Duty</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Punctuality: <b className="text-emerald-600 dark:text-emerald-400 tnum">{punctualityRate}% on-time</b>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Operating Stations</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Lekki • Escravos • Bonny</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">GPS Synced</div>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px]">Station timesheet & biometric roll call</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                  Open Attendance &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 3 Personal Metric Cards with Apple Depth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Score Card */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs apple-card-hover">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>September KPI</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full tnum whitespace-nowrap shrink-0">
              Rank #{myKpi.rankPosition}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tnum">{myKpi.totalScore}</div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="tnum">+65 pts</span>
            </div>
          </div>

          <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] grid grid-cols-3 text-center text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white tnum">{myKpi.completedCount}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Completed</div>
            </div>
            <div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 tnum">{myKpi.onTimeCount}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">On Time</div>
            </div>
            <div>
              <div className="font-bold text-rose-500 dark:text-rose-400 tnum">{myKpi.overdueCount}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Overdue</div>
            </div>
          </div>
        </div>

        {/* Assigned Tasks Card */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs apple-card-hover">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Assigned Tasks</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full tnum whitespace-nowrap shrink-0">
              {myTasks.filter(t => t.status !== 'DONE').length} Active
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tnum">{myTasks.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">total work items</div>
          </div>

          <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Critical Path: <b className="text-slate-800 dark:text-white">1 urgent</b></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] whitespace-nowrap shrink-0">Auto-KPI Sync</span>
          </div>
        </div>

        {/* Leave Balance Card */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-5 space-y-3 shadow-xs apple-card-hover">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <PlaneTakeoff className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>Leave Balance</span>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
              2026 Allowance
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tnum">14</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">days available of 20</div>
          </div>

          <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Used: <b className="text-slate-800 dark:text-white tnum">6 days</b></span>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-[11px]"
            >
              Request Time Off &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Segmented Tasks + Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Container */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-4 shadow-xs apple-card-hover">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>My Tasks</span>
                  <span className="text-[11px] bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 px-2 py-0.2 rounded-full font-bold tnum whitespace-nowrap shrink-0">
                    {filteredTasks.length}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Aggregated across Project, Field, QA and IT modules</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Create Task</span>
              </button>
            </div>

            {/* Apple Segmented Tab Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/10 rounded-xl text-xs font-semibold overflow-x-auto">
              {(['ALL', 'IN_PROGRESS', 'URGENT', 'DONE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTaskFilter(tab)}
                  className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] whitespace-nowrap shrink-0 ${
                    taskFilter === tab 
                      ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'IN_PROGRESS' ? 'Active' : tab === 'URGENT' ? 'Urgent' : 'Done'}
                </button>
              ))}
            </div>
          </div>

          {/* Task Feed */}
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 stroke-1" />
              <div className="text-xs font-medium">All tasks cleared under this filter</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isDone = task.status === 'DONE';
                return (
                  <motion.div
                    layout
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDone 
                        ? 'bg-slate-50/70 dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] opacity-75' 
                        : 'bg-white dark:bg-[#121215] border-black/[0.08] dark:border-white/[0.1] hover:border-black/[0.15] dark:hover:border-white/[0.2] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkmark Button */}
                      <button
                        type="button"
                        disabled={isDone}
                        onClick={isDone ? undefined : () => updateTaskStatus(task.id, 'DONE')}
                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          isDone 
                            ? 'bg-emerald-600 border-emerald-600 text-white cursor-default opacity-95 shadow-xs' 
                            : 'border-slate-300 dark:border-white/20 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 bg-white dark:bg-transparent active:scale-[0.88] cursor-pointer'
                        }`}
                        title={isDone ? 'Completed & Locked — Cannot be undone (Audit Finalized)' : 'Mark Complete (Awards +50 KPI points)'}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/10 text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0">
                            {task.moduleOrigin}
                          </span>

                          {task.projectName ? (
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[220px]">
                              {task.projectName}
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-black/[0.04] dark:bg-white/5 px-1.5 py-0.2 rounded whitespace-nowrap shrink-0">
                              Internal Operations
                            </span>
                          )}

                          {isDone ? (
                            <span className="text-[9px] font-bold ml-auto px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Done & Locked
                            </span>
                          ) : (
                            <span className={`text-[9px] font-bold ml-auto px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0 ${
                              task.priority === 'URGENT' ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                              task.priority === 'HIGH' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                              'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                        </div>

                        <div className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex-wrap">
                          <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
                            <Calendar className="w-3 h-3" />
                            <span>Due: <b className="text-slate-700 dark:text-slate-300 tnum">{task.dueDate}</b></span>
                          </div>

                          {task.estimatedHours && (
                            <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
                              <Clock className="w-3 h-3" />
                              <span className="tnum">{task.loggedHours || 0}/{task.estimatedHours} hrs</span>
                            </div>
                          )}

                          {isDone && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-auto flex items-center gap-1 whitespace-nowrap shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              Earned +50 pts • <Lock className="w-2.5 h-2.5 ml-0.5 inline" /> Immutable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Requests & Tickets */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-4 shadow-xs apple-card-hover">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active Requests</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">IT & Creative queue</p>
            </div>
            <button
              onClick={() => setIsIntakeOpen(true)}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
              No active tickets submitted
            </div>
          ) : (
            <div className="space-y-2.5">
              {myTickets.map((tkt) => (
                <div key={tkt.id} className="p-3 bg-slate-50 dark:bg-white/[0.04] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">{tkt.ticketNumber}</span>
                    <span className="px-1.5 py-0.2 rounded-full font-bold bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-black/[0.08] dark:border-white/[0.1] whitespace-nowrap shrink-0">
                      {tkt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {tkt.subject}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <span>Category: <b className="text-slate-700 dark:text-slate-300">{tkt.category}</b></span>
                    <span>{tkt.assignedToName || 'In Triage'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Universal Request Modal */}
      <RequestIntakeModal isOpen={isIntakeOpen} onClose={() => setIsIntakeOpen(false)} />

      {/* Create Task for Approval Modal */}
      <CreateTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />

      {/* Time Off Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
          <div 
            onClick={() => setIsLeaveModalOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          <div className="relative bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-2xl max-w-sm w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <PlaneTakeoff className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request Time Off</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsLeaveModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/10"
              >
                &times;
              </button>
            </div>

            {leaveSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
                <div className="text-sm font-bold text-slate-900 dark:text-white">Submitted for Approval!</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Your supervisor has been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                  <select 
                    value={leaveType} 
                    onChange={(e: any) => setLeaveType(e.target.value)} 
                    className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="w-full p-1.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                    <input 
                      type="date" 
                      required 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="w-full p-1.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Days</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30" 
                    value={daysCount} 
                    onChange={(e) => setDaysCount(Number(e.target.value))} 
                    className="w-full p-1.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white" 
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button 
                    type="button" 
                    onClick={() => setIsLeaveModalOpen(false)} 
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.96]"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
