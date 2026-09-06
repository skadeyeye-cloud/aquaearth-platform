'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TaskItem, TaskComment } from '@/lib/types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Filter, 
  Search, 
  MessageSquare, 
  ChevronRight, 
  UserCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Layers, 
  Calendar, 
  FolderKanban, 
  Send,
  Sparkles,
  TrendingUp,
  X,
  Sliders,
  Check,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateTaskModal from '@/components/workspace/CreateTaskModal';

export default function MyTasksPage() {
  const { 
    currentUser, 
    tasks, 
    projects, 
    allUsers, 
    createTaskForApproval, 
    approveTask, 
    rejectTask, 
    addTaskComment, 
    updateTaskProgress 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'MY_TASKS' | 'PENDING_APPROVAL' | 'MANAGER_INBOX' | 'COMPLETED'>('MY_TASKS');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PROJECT' | 'NON_PROJECT'>('ALL');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // New task modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Drawer comment input
  const [commentText, setCommentText] = useState('');
  const [managerApprovalNote, setManagerApprovalNote] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isManager = currentUser.managementTier === 'LINE_MANAGER' || 
                    currentUser.managementTier === 'TEAM_LEAD' || 
                    currentUser.managementTier === 'DEPT_HEAD' || 
                    currentUser.accessTier === 'SUPERADMIN';

  // Subordinate user IDs for Line Managers
  const supervisedUserIds = new Set(
    allUsers
      .filter(u => u.managerId === currentUser.id || u.departmentName === currentUser.departmentName)
      .map(u => u.id)
  );

  // Filter tasks based on tabs
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const pendingMyApproval = tasks.filter(t => {
    if (currentUser.accessTier === 'SUPERADMIN') return t.approvalStatus === 'PENDING_APPROVAL';
    return t.approvalStatus === 'PENDING_APPROVAL' && (t.managerId === currentUser.id || supervisedUserIds.has(t.assigneeId));
  });

  const getFilteredList = () => {
    let list: TaskItem[] = [];
    if (activeTab === 'MY_TASKS') {
      list = myTasks.filter(t => t.status !== 'DONE');
    } else if (activeTab === 'PENDING_APPROVAL') {
      list = myTasks.filter(t => t.approvalStatus === 'PENDING_APPROVAL');
    } else if (activeTab === 'MANAGER_INBOX') {
      list = pendingMyApproval;
    } else if (activeTab === 'COMPLETED') {
      list = myTasks.filter(t => t.status === 'DONE');
    }

    return list.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.projectName && t.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesScope = scopeFilter === 'ALL' ||
                           (scopeFilter === 'PROJECT' && !!t.projectName) ||
                           (scopeFilter === 'NON_PROJECT' && !t.projectName);
      return matchesSearch && matchesPriority && matchesScope;
    });
  };

  const filteredTasks = getFilteredList();

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) return;
    addTaskComment(selectedTask.id, commentText.trim());
    setCommentText('');

    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const handleApprove = () => {
    if (!selectedTask) return;
    approveTask(selectedTask.id, managerApprovalNote || 'Task plan approved by Line Manager.');
    setManagerApprovalNote('');
    setSelectedTask(null);
  };

  const handleReject = () => {
    if (!selectedTask || !rejectReason) return;
    rejectTask(selectedTask.id, rejectReason);
    setRejectReason('');
    setIsRejectOpen(false);
    setSelectedTask(null);
  };

  const activeDetailTask = selectedTask ? tasks.find(t => t.id === selectedTask.id) || selectedTask : null;

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            <span>Workflow Engine • Task & Approval Center</span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
              {currentUser.jobTitle}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            My Tasks & Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create tasks for Line Manager sign-off, update completion milestones, and collaborate via timestamped comment feeds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isManager ? 'Create & Assign Task' : 'Create Task for Approval'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-xs space-y-1 apple-card-hover">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Active Assigned</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tnum">
            {myTasks.filter(t => t.status !== 'DONE').length}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-xs space-y-1 apple-card-hover">
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Awaiting Approval</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tnum">
            {myTasks.filter(t => t.approvalStatus === 'PENDING_APPROVAL').length}
          </div>
        </div>

        {isManager && (
          <div className="p-4 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-xs space-y-1 apple-card-hover">
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Manager Sign-Off Inbox</div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tnum">
              {pendingMyApproval.length}
            </div>
          </div>
        )}

        <div className="p-4 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-xs space-y-1 apple-card-hover">
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Completed History</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">
            {myTasks.filter(t => t.status === 'DONE').length}
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('MY_TASKS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'MY_TASKS'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            My Active Tasks ({myTasks.filter(t => t.status !== 'DONE').length})
          </button>

          <button
            onClick={() => setActiveTab('PENDING_APPROVAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'PENDING_APPROVAL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            My Submitted Approvals ({myTasks.filter(t => t.approvalStatus === 'PENDING_APPROVAL').length})
          </button>

          {isManager && (
            <button
              onClick={() => setActiveTab('MANAGER_INBOX')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'MANAGER_INBOX'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <span>Manager Inbox</span>
              {pendingMyApproval.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-white text-indigo-700 font-black whitespace-nowrap shrink-0">
                  {pendingMyApproval.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'COMPLETED'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Completed History ({myTasks.filter(t => t.status === 'DONE').length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-2.5 py-1 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={scopeFilter}
            onChange={(e: any) => setScopeFilter(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Scopes</option>
            <option value="PROJECT">📁 Project Deliverables</option>
            <option value="NON_PROJECT">🏢 General / Internal</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 stroke-1" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks in this category</div>
            <p className="text-xs text-slate-400">All deliverables are up to date or create a new task above.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'DONE';
            const isPending = task.approvalStatus === 'PENDING_APPROVAL';
            const isRejected = task.approvalStatus === 'REJECTED';
            const percent = task.progressPercent || (isDone ? 100 : task.status === 'IN_PROGRESS' ? 50 : 0);

            return (
              <motion.div
                key={task.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border transition-all cursor-pointer shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  selectedTask?.id === task.id
                    ? 'border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white'
                    : 'border-black/[0.08] dark:border-white/[0.12] hover:border-black/[0.18] dark:hover:border-white/[0.22]'
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md whitespace-nowrap shrink-0 ${
                      task.priority === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400' :
                      task.priority === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
                    }`}>
                      {task.priority}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-0.2 rounded-md border border-black/[0.05] dark:border-white/[0.08] whitespace-nowrap shrink-0">
                      {task.moduleOrigin}
                    </span>

                    {isPending && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3" />
                        Awaiting Line Manager Approval ({task.managerName})
                      </span>
                    )}

                    {isRejected && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 whitespace-nowrap shrink-0">
                        Revision Requested
                      </span>
                    )}

                    {isDone && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Check className="w-3 h-3" />
                        Done (+50 KPI Pts) • <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {task.title}
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 flex-wrap pt-0.5">
                    {task.projectName ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <FolderKanban className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>Project: <b className="text-slate-700 dark:text-slate-300">{task.projectName}</b></span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Internal Operations</span>
                      </span>
                    )}
                    <span className="whitespace-nowrap shrink-0">Assignee: <b className="text-slate-700 dark:text-slate-300">{task.assigneeName}</b></span>
                    <span className="whitespace-nowrap shrink-0">Due: <b className="text-slate-700 dark:text-slate-300 tnum">{task.dueDate}</b></span>
                    {task.comments && task.comments.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap shrink-0">
                        <MessageSquare className="w-3 h-3 text-indigo-500" />
                        {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Meter & Quick Action */}
                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-black/[0.05] dark:border-white/[0.08]">
                  <div className="w-28 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                        Progress {isDone && <Lock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />}
                      </span>
                      <span className={`tnum ${isDone ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-900 dark:text-white'}`}>{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isDone ? 'bg-emerald-500' : isPending ? 'bg-amber-400' : 'bg-slate-900 dark:bg-white'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Task Detail & Comments Drawer */}
      <AnimatePresence>
        {activeDetailTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg h-full bg-white dark:bg-[#0c0c0e] border-l border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-6 z-10 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-start justify-between gap-3 border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0">
                        {activeDetailTask.moduleOrigin}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded whitespace-nowrap shrink-0 ${
                        activeDetailTask.priority === 'URGENT' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {activeDetailTask.priority}
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {activeDetailTask.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Task Details */}
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-2 text-xs">
                  {activeDetailTask.description && (
                    <p className="text-slate-700 dark:text-slate-300">
                      {activeDetailTask.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <div>Assignee: <b className="text-slate-800 dark:text-slate-200">{activeDetailTask.assigneeName}</b></div>
                    <div>Due: <b className="text-slate-800 dark:text-slate-200 tnum">{activeDetailTask.dueDate}</b></div>
                    <div>Scope: <b className="text-slate-800 dark:text-slate-200">{activeDetailTask.projectName ? activeDetailTask.projectName : '🏢 Internal Operations'}</b></div>
                    <div>Line Manager: <b className="text-slate-800 dark:text-slate-200">{activeDetailTask.managerName}</b></div>
                  </div>
                </div>

                {/* Manager Approval Actions */}
                {activeDetailTask.approvalStatus === 'PENDING_APPROVAL' && isManager && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Line Manager Approval Required</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Review the task scope, priority, and timeline submitted by {activeDetailTask.assigneeName}.
                    </p>

                    <input
                      type="text"
                      value={managerApprovalNote}
                      onChange={(e) => setManagerApprovalNote(e.target.value)}
                      placeholder="Optional approval instruction note..."
                      className="w-full p-2 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs"
                    />

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={handleApprove}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-[0.96] whitespace-nowrap shrink-0"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Approve Task</span>
                      </button>

                      <button
                        onClick={() => setIsRejectOpen(!isRejectOpen)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold active:scale-[0.96] whitespace-nowrap shrink-0"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Request Revision</span>
                      </button>
                    </div>

                    {isRejectOpen && (
                      <div className="pt-2 space-y-2 border-t border-amber-500/20">
                        <textarea
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="State what needs to be revised..."
                          className="w-full p-2 bg-white dark:bg-[#121216] border border-red-300 rounded-xl text-xs"
                        />
                        <button
                          onClick={handleReject}
                          className="px-3 py-1 bg-red-600 text-white rounded-xl text-xs font-bold"
                        >
                          Submit Revision Request
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Controls / Locked State */}
                {activeDetailTask.approvalStatus === 'APPROVED' && (
                  activeDetailTask.status === 'DONE' ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Task Completed & Permanently Locked</span>
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap shrink-0 shadow-xs">
                          <Lock className="w-2.5 h-2.5" />
                          Finalized
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                        This task has been verified as 100% complete and KPI appraisal points have been credited. To guarantee regulatory compliance and appraisal audit integrity, completed deliverables cannot be reopened or undone.
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-emerald-500/20 flex-wrap gap-2">
                        <span>Completed: <b className="text-slate-800 dark:text-slate-200 tnum">{activeDetailTask.completedAt || activeDetailTask.dueDate}</b></span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Progress • +50 KPI Pts Secured</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                          Update Progress Milestone
                        </span>
                        <span className="tnum font-extrabold text-sm">{activeDetailTask.progressPercent || 0}%</span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={activeDetailTask.progressPercent || 0}
                        onChange={(e) => updateTaskProgress(activeDetailTask.id, Number(e.target.value))}
                        className="w-full accent-slate-900 dark:accent-white cursor-pointer"
                      />

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => updateTaskProgress(activeDetailTask.id, 25, 'IN_PROGRESS')}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold active:scale-[0.96] whitespace-nowrap shrink-0"
                        >
                          25%
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTaskProgress(activeDetailTask.id, 50, 'IN_PROGRESS')}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold active:scale-[0.96] whitespace-nowrap shrink-0"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTaskProgress(activeDetailTask.id, 75, 'IN_PROGRESS')}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold active:scale-[0.96] whitespace-nowrap shrink-0"
                        >
                          75%
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTaskProgress(activeDetailTask.id, 100, 'DONE')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold ml-auto shadow-xs active:scale-[0.96] whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark 100% Done (+50 KPI)</span>
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Threaded Time-Stamped Comments Feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      Collaborative Comment Feed & Audit Trail
                    </span>
                    <span className="text-[10px] text-slate-400 tnum">
                      {activeDetailTask.comments?.length || 0} Entries
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {(!activeDetailTask.comments || activeDetailTask.comments.length === 0) ? (
                      <div className="py-6 text-center text-[11px] text-slate-400">
                        No comments yet. Post an update or approval remark below.
                      </div>
                    ) : (
                      activeDetailTask.comments.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.06] space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {c.authorName}
                              <span className="text-slate-400 font-normal">({c.authorRole})</span>
                            </span>
                            <span className="text-slate-400 font-mono tnum">{c.timestamp}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                            {c.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Input Box */}
              <form onSubmit={handleAddComment} className="pt-4 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Drop a time-stamped update or instruction..."
                  className="flex-1 p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl disabled:opacity-40 transition-all active:scale-[0.96]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create & Assign Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
