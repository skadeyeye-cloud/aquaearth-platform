'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TaskItem, TaskComment, TaskAssignee } from '@/lib/types';
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
  Lock,
  Users,
  Building2,
  FileCheck2,
  Award,
  Archive,
  Eye,
  ShieldCheck,
  Briefcase,
  GitBranch,
  FileText,
  Pencil,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateTaskModal from '@/components/workspace/CreateTaskModal';
import { haptics } from '@/lib/haptics';
import { exportToXls, exportToPdf } from '@/lib/export-utils';

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
    updateTaskProgress,
    editTask 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'MY_TASKS' | 'MANAGER_BOARD' | 'DEPARTMENT_TASKS' | 'PENDING_APPROVAL' | 'COMPLETED_ARCHIVE'>('MY_TASKS');
  const [archiveSubFilter, setArchiveSubFilter] = useState<'ALL' | 'ASSIGNED_BY_ME' | 'MY_COMPLETED' | 'DEPARTMENT'>('ALL');
  const [managerStatusFilter, setManagerStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PROJECT' | 'NON_PROJECT'>('ALL');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // New task modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Completion Dialog State
  const [completingTask, setCompletingTask] = useState<TaskItem | null>(null);
  const [completingOfficerId, setCompletingOfficerId] = useState(currentUser.id);
  const [completionNotes, setCompletionNotes] = useState('');

  // Drawer comment input
  const [commentText, setCommentText] = useState('');
  const [managerApprovalNote, setManagerApprovalNote] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Edit Task & Assignees Modal State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editPriority, setEditPriority] = useState<TaskItem['priority']>('MEDIUM');
  const [editDueDate, setEditDueDate] = useState('');
  const [editEstHours, setEditEstHours] = useState(16);
  const [editTaskType, setEditTaskType] = useState<TaskItem['taskType']>('STANDARD');
  const [editPrimaryAssigneeId, setEditPrimaryAssigneeId] = useState('');
  const [editLeadUserId, setEditLeadUserId] = useState('');
  const [editContributorUserId, setEditContributorUserId] = useState('');
  const [editWriterUserId, setEditWriterUserId] = useState('');
  const [editDesignerUserId, setEditDesignerUserId] = useState('');

  const handleOpenEditTaskAndAssignees = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStage(task.stage || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || '');
    setEditEstHours(task.estimatedHours || 16);
    setEditTaskType(task.taskType || 'STANDARD');
    setEditPrimaryAssigneeId(task.assigneeId || allUsers[0]?.id || '');

    const leadAss = task.taskAssignees?.find(a => a.role === 'LEAD');
    const contribAss = task.taskAssignees?.find(a => a.role === 'CONTRIBUTOR');
    const writerAss = task.taskAssignees?.find(a => a.role === 'WRITER');
    const designerAss = task.taskAssignees?.find(a => a.role === 'DESIGNER');

    setEditLeadUserId(leadAss?.userId || '');
    setEditContributorUserId(contribAss?.userId || '');
    setEditWriterUserId(writerAss?.userId || '');
    setEditDesignerUserId(designerAss?.userId || '');
  };

  const handleSaveEditTaskAndAssignees = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim() || !editPrimaryAssigneeId) return;

    const primaryUser = allUsers.find(u => u.id === editPrimaryAssigneeId);

    const newRoles: TaskAssignee[] = [];
    if (editLeadUserId) {
      const u = allUsers.find(x => x.id === editLeadUserId);
      if (u) newRoles.push({ userId: u.id, userName: u.name, role: 'LEAD', weightPercent: 30 });
    }
    if (editContributorUserId) {
      const u = allUsers.find(x => x.id === editContributorUserId);
      if (u) newRoles.push({ userId: u.id, userName: u.name, role: 'CONTRIBUTOR', weightPercent: 20 });
    }
    if (editWriterUserId) {
      const u = allUsers.find(x => x.id === editWriterUserId);
      if (u) newRoles.push({ userId: u.id, userName: u.name, role: 'WRITER', weightPercent: 35 });
    }
    if (editDesignerUserId) {
      const u = allUsers.find(x => x.id === editDesignerUserId);
      if (u) newRoles.push({ userId: u.id, userName: u.name, role: 'DESIGNER', weightPercent: 15 });
    }

    const updates: Partial<TaskItem> = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      stage: editStage.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate,
      estimatedHours: Number(editEstHours),
      taskType: editTaskType,
      assigneeId: editPrimaryAssigneeId,
      assigneeName: primaryUser?.name || editingTask.assigneeName,
      departmentId: primaryUser?.departmentId || editingTask.departmentId,
      departmentName: primaryUser?.departmentName || editingTask.departmentName,
      taskAssignees: newRoles.length > 0 ? newRoles : undefined
    };

    editTask(editingTask.id, updates);
    if (selectedTask?.id === editingTask.id) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }
    setEditingTask(null);
    haptics.success();
  };

  // Update Task Progress & Hours Modal State
  const [updatingTask, setUpdatingTask] = useState<TaskItem | null>(null);
  const [updateProgressVal, setUpdateProgressVal] = useState<number>(0);
  const [updateStatusVal, setUpdateStatusVal] = useState<TaskItem['status']>('IN_PROGRESS');
  const [updateAdditionalHours, setUpdateAdditionalHours] = useState<number>(0);
  const [updateCommentText, setUpdateCommentText] = useState<string>('');
  const [updateCompletionNote, setUpdateCompletionNote] = useState<string>('');

  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'MANAGING_CONSULTANT' ||
                       currentUser.id === 'usr-1' ||
                       currentUser.name.toLowerCase().includes('kaine');

  const isManager = currentUser.managementTier === 'LINE_MANAGER' || 
                    currentUser.managementTier === 'TEAM_LEAD' || 
                    currentUser.managementTier === 'DEPT_HEAD' || 
                    currentUser.functionalRole === 'PROJECT_MANAGER' ||
                    currentUser.functionalRole === 'DEPUTY_MANAGING_CONSULTANT' ||
                    currentUser.accessTier === 'SUPERADMIN' ||
                    isSuperadmin;

  const canAccessManagerBoard = isSuperadmin || isManager;

  // Enforce: Manager Board is strictly for Admins and Line Managers, not standard users
  React.useEffect(() => {
    if (!canAccessManagerBoard && activeTab === 'MANAGER_BOARD') {
      setActiveTab('MY_TASKS');
    }
  }, [canAccessManagerBoard, activeTab]);

  const isTaskPM = (task: TaskItem | null) => {
    if (!task) return false;
    if (isSuperadmin) return true;
    const proj = task.projectId ? projects.find(p => p.id === task.projectId) : null;
    return Boolean(proj && (proj.leadPmId === currentUser.id || proj.projectManagerId === currentUser.id));
  };

  const handleOpenUpdateTask = (task: TaskItem) => {
    setUpdatingTask(task);
    setUpdateProgressVal(task.progressPercent || 0);
    setUpdateStatusVal(task.status);
    setUpdateAdditionalHours(0);
    setUpdateCommentText('');
    setUpdateCompletionNote('');
  };

  const handleSaveTaskUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingTask) return;

    const totalHours = (updatingTask.loggedHours || 0) + Number(updateAdditionalHours || 0);
    const isNowDone = updateProgressVal >= 100 || updateStatusVal === 'DONE';
    const isProjectPM = isTaskPM(updatingTask);

    if (isNowDone && updatingTask.projectId && !isProjectPM) {
      alert('Under Slate Labs Core Rule 4, only the designated Project Manager can finalize deliverables.');
      return;
    }

    updateTaskProgress(
      updatingTask.id,
      updateProgressVal,
      updateStatusVal,
      totalHours,
      isNowDone ? {
        completedById: currentUser.id,
        completedByName: currentUser.name,
        completionNotes: updateCompletionNote || updateCommentText || 'Deliverable finalized by PM.'
      } : undefined
    );

    if (updateCommentText.trim()) {
      addTaskComment(updatingTask.id, updateCommentText.trim());
    }

    if (selectedTask?.id === updatingTask.id) {
      setSelectedTask(prev => prev ? {
        ...prev,
        progressPercent: updateProgressVal,
        status: updateStatusVal,
        loggedHours: totalHours
      } : null);
    }

    setUpdatingTask(null);
    haptics.success();
  };

  // Subordinate user IDs for Line Managers
  const supervisedUserIds = new Set(
    allUsers
      .filter(u => u.managerId === currentUser.id || u.departmentName === currentUser.departmentName)
      .map(u => u.id)
  );

  // Helper to check if task is visible (Rule 2: Suggested tasks are hidden from team until PM confirms them)
  const isTaskVisible = (t: TaskItem) => {
    if (t.confirmed === false) {
      if (isSuperadmin) return true;
      const proj = projects.find(p => p.id === t.projectId);
      return proj?.leadPmId === currentUser.id || proj?.projectManagerId === currentUser.id;
    }
    return true;
  };

  // Helper to determine if task is assigned to current user
  const isUserAssigned = (t: TaskItem) => {
    if (t.assigneeId === currentUser.id) return true;
    if (t.assigneeName?.toLowerCase() === currentUser.name?.toLowerCase()) return true;
    if (t.assigneeIds && t.assigneeIds.includes(currentUser.id)) return true;
    if (t.taskAssignees && t.taskAssignees.some(a => a.userId === currentUser.id || a.userName?.toLowerCase() === currentUser.name?.toLowerCase())) return true;
    if (t.assignmentType === 'DEPARTMENT' && (t.departmentName === currentUser.departmentName || t.departmentId === currentUser.departmentId)) return true;
    return false;
  };

  // 1. My Active Tasks
  const myTasks = tasks.filter(t => isUserAssigned(t) && isTaskVisible(t));

  // 2. Manager Board: Tasks assigned by me OR supervised by me
  const tasksAssignedByMe = tasks.filter(t => 
    (t.assignedById === currentUser.id || 
    t.managerId === currentUser.id ||
    supervisedUserIds.has(t.assigneeId)) &&
    isTaskVisible(t)
  );

  // 3. Department Tasks
  const departmentTasks = tasks.filter(t => 
    t.assignmentType === 'DEPARTMENT' && 
    (t.departmentName === currentUser.departmentName || t.departmentId === currentUser.departmentId) &&
    isTaskVisible(t)
  );

  // 4. Pending Approval
  const pendingMyApproval = tasks.filter(t => {
    if (!isTaskVisible(t)) return false;
    if (isSuperadmin) return t.approvalStatus === 'PENDING_APPROVAL';
    return t.approvalStatus === 'PENDING_APPROVAL' && (t.managerId === currentUser.id || supervisedUserIds.has(t.assigneeId));
  });

  // 5. Completed Tasks
  const completedTasks = tasks.filter(t => t.status === 'DONE' && isTaskVisible(t));

  const getFilteredList = () => {
    let list: TaskItem[] = [];

    if (activeTab === 'MY_TASKS') {
      list = myTasks.filter(t => t.status !== 'DONE');
    } else if (activeTab === 'MANAGER_BOARD') {
      if (managerStatusFilter === 'ACTIVE') {
        list = tasksAssignedByMe.filter(t => t.status !== 'DONE');
      } else if (managerStatusFilter === 'COMPLETED') {
        list = tasksAssignedByMe.filter(t => t.status === 'DONE');
      } else {
        list = tasksAssignedByMe;
      }
    } else if (activeTab === 'DEPARTMENT_TASKS') {
      list = departmentTasks.filter(t => t.status !== 'DONE');
    } else if (activeTab === 'PENDING_APPROVAL') {
      list = isManager ? pendingMyApproval : myTasks.filter(t => t.approvalStatus === 'PENDING_APPROVAL');
    } else if (activeTab === 'COMPLETED_ARCHIVE') {
      if (archiveSubFilter === 'ASSIGNED_BY_ME') {
        list = tasks.filter(t => t.status === 'DONE' && (t.assignedById === currentUser.id || t.managerId === currentUser.id));
      } else if (archiveSubFilter === 'MY_COMPLETED') {
        list = tasks.filter(t => t.status === 'DONE' && (t.completedById === currentUser.id || t.assigneeId === currentUser.id));
      } else if (archiveSubFilter === 'DEPARTMENT') {
        list = tasks.filter(t => t.status === 'DONE' && (t.departmentName === currentUser.departmentName || t.departmentId === currentUser.departmentId));
      } else {
        list = completedTasks;
      }
    }

    return list.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (t.projectName && t.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (t.assigneeName && t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (t.departmentName && t.departmentName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesScope = scopeFilter === 'ALL' ||
                           (scopeFilter === 'PROJECT' && !!t.projectName) ||
                           (scopeFilter === 'NON_PROJECT' && !t.projectName);
      return matchesSearch && matchesPriority && matchesScope;
    });
  };

  const filteredTasks = getFilteredList();

  const handleExportTasksPdf = () => {
    const tabLabel = activeTab === 'MY_TASKS' ? 'My Active Deliverables' :
                     activeTab === 'MANAGER_BOARD' ? 'Manager Delegated Tracking Board' :
                     activeTab === 'DEPARTMENT_TASKS' ? `${currentUser.departmentName || 'Department'} Task Queue` :
                     activeTab === 'PENDING_APPROVAL' ? 'Tasks Awaiting Management Sign-Off' :
                     'Completed Deliverables Archive';

    exportToPdf({
      filename: `AquaEarth_Tasks_Deliverables_${new Date().toISOString().split('T')[0]}`,
      title: 'Commercial Deliverables & Field Tasks Execution Schedule',
      subtitle: `AquaEarth Consulting Limited — View: ${tabLabel} | Generated by: ${currentUser.name}`,
      category: 'TASK EXECUTION REPORT',
      summaryMetrics: [
        { label: 'Total Deliverables', value: String(filteredTasks.length) },
        { label: 'Completed (DONE)', value: String(filteredTasks.filter(t => t.status === 'DONE').length) },
        { label: 'In Progress / Active', value: String(filteredTasks.filter(t => t.status !== 'DONE').length) },
        { label: 'Logged Hours', value: `${filteredTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0)} hrs` }
      ],
      columns: [
        { header: 'Task / Deliverable', key: 'title' },
        { header: 'Project / Scope', key: 'projectName', format: (val) => val || 'Internal Operations' },
        { header: 'Assignee', key: 'assigneeName' },
        { header: 'Priority', key: 'priority' },
        { header: 'Status', key: 'status', format: (val) => String(val || '').replace('_', ' ') },
        { header: 'Progress', key: 'progressPercent', align: 'center', format: (val) => `${val || 0}%` },
        { header: 'Due Date', key: 'dueDate' },
        { header: 'Logged Hrs', key: 'loggedHours', align: 'right', format: (val) => `${val || 0}h` }
      ],
      data: filteredTasks,
      signatories: [
        { role: 'OPERATIONS LEAD / PM', name: currentUser.name, title: `${currentUser.jobTitle || 'Lead Consultant'}` },
        { role: 'TECHNICAL DIRECTOR', name: 'Engr. Femi Adebayo', title: 'Head of Technical Operations' },
        { role: 'MANAGING CONSULTANT', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

  const handleExportTasksXls = () => {
    const tabLabel = activeTab === 'MY_TASKS' ? 'My Active Deliverables' :
                     activeTab === 'MANAGER_BOARD' ? 'Manager Delegated Tracking Board' :
                     activeTab === 'DEPARTMENT_TASKS' ? `${currentUser.departmentName || 'Department'} Task Queue` :
                     activeTab === 'PENDING_APPROVAL' ? 'Tasks Awaiting Management Sign-Off' :
                     'Completed Deliverables Archive';

    exportToXls({
      filename: `AquaEarth_Tasks_Deliverables_${new Date().toISOString().split('T')[0]}`,
      title: 'COMMERCIAL DELIVERABLES & FIELD TASKS EXECUTION SCHEDULE',
      subtitle: `AquaEarth Consulting Limited — View: ${tabLabel} | Generated by: ${currentUser.name}`,
      category: 'TASK EXECUTION REPORT',
      metadata: {
        'Custodian': currentUser.name,
        'View': tabLabel,
        'Total Count': String(filteredTasks.length)
      },
      summaryMetrics: [
        { label: 'Total Deliverables', value: filteredTasks.length },
        { label: 'Completed Deliverables', value: filteredTasks.filter(t => t.status === 'DONE').length },
        { label: 'Logged Hours', value: `${filteredTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0)} hrs` }
      ],
      columns: [
        { header: 'Task / Deliverable', key: 'title' },
        { header: 'Project / Scope', key: 'projectName', format: (val) => val || 'Internal Operations' },
        { header: 'Assignee', key: 'assigneeName' },
        { header: 'Stage', key: 'stage' },
        { header: 'Priority', key: 'priority' },
        { header: 'Status', key: 'status', format: (val) => String(val || '').replace('_', ' ') },
        { header: 'Progress', key: 'progressPercent', align: 'center', format: (val) => `${val || 0}%` },
        { header: 'Due Date', key: 'dueDate' },
        { header: 'Logged Hours', key: 'loggedHours', align: 'right', format: (val) => val || 0 },
        { header: 'Estimated Hours', key: 'estimatedHours', align: 'right', format: (val) => val || 16 }
      ],
      data: filteredTasks
    });
    haptics.success();
  };

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

  const openCompletionModal = (task: TaskItem) => {
    if (task.isBlockedByGate) {
      alert("This task is locked by an Approval Gate. SOW / ToR client approval must be signed off by the Project Manager before field work can proceed.");
      return;
    }
    const proj = task.projectId ? projects.find(p => p.id === task.projectId) : null;
    const canComplete = isSuperadmin || (proj ? (proj.leadPmId === currentUser.id || proj.projectManagerId === currentUser.id) : isManager);
    if (!canComplete) {
      alert("In accordance with Slate Labs Core Rule 4, only the designated Project Manager (or Superadmin) has authority to sign off and finalize project deliverables for KPI credit.");
      return;
    }
    setCompletingTask(task);
    setCompletingOfficerId(currentUser.id);
    setCompletionNotes('');
  };

  const handleConfirmCompletion = () => {
    if (!completingTask) return;
    const completingUser = allUsers.find(u => u.id === completingOfficerId) || currentUser;

    updateTaskProgress(completingTask.id, 100, 'DONE', completingTask.loggedHours, {
      completedById: completingUser.id,
      completedByName: completingUser.name,
      completionNotes: completionNotes.trim() || 'Deliverable executed and verified according to QA standard.'
    });

    haptics.success();
    setCompletingTask(null);
    setCompletionNotes('');

    if (selectedTask?.id === completingTask.id) {
      setSelectedTask(null);
    }
  };

  const activeDetailTask = selectedTask ? tasks.find(t => t.id === selectedTask.id) || selectedTask : null;

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Tasks & Manager Oversight</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live KPI Linked
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track direct execution, supervise delegated deliverables, and access permanent compliance documentation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportTasksPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] transition-all cursor-pointer active:scale-[0.97]"
            title="Download PDF Report"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={handleExportTasksXls}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] transition-all cursor-pointer active:scale-[0.97]"
            title="Download Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isManager ? 'Create & Delegate Task' : 'Create Task for Approval'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={`grid gap-3 text-xs ${canAccessManagerBoard ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
        <div 
          onClick={() => setActiveTab('MY_TASKS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-1 ${
            activeTab === 'MY_TASKS'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent ring-2 ring-emerald-500/40'
              : 'bg-white dark:bg-[#0c0c0e] border-black/[0.08] dark:border-white/[0.12] hover:border-black/[0.18] dark:hover:border-white/[0.22]'
          }`}
        >
          <div className={`text-[11px] font-semibold ${activeTab === 'MY_TASKS' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
            My Active Tasks
          </div>
          <div className="text-2xl font-extrabold tnum">
            {myTasks.filter(t => t.status !== 'DONE').length}
          </div>
        </div>

        {canAccessManagerBoard && (
          <div 
            onClick={() => { setActiveTab('MANAGER_BOARD'); setManagerStatusFilter('ALL'); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-1 ${
              activeTab === 'MANAGER_BOARD'
                ? 'bg-indigo-600 text-white border-transparent ring-2 ring-indigo-400/40'
                : 'bg-white dark:bg-[#0c0c0e] border-black/[0.08] dark:border-white/[0.12] hover:border-black/[0.18] dark:hover:border-white/[0.22]'
            }`}
          >
            <div className={`text-[11px] font-semibold ${activeTab === 'MANAGER_BOARD' ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'}`}>
              Manager Board (Delegated)
            </div>
            <div className="text-2xl font-extrabold tnum">
              {tasksAssignedByMe.length}
            </div>
          </div>
        )}

        <div 
          onClick={() => setActiveTab('DEPARTMENT_TASKS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-1 ${
            activeTab === 'DEPARTMENT_TASKS'
              ? 'bg-amber-600 text-white border-transparent ring-2 ring-amber-400/40'
              : 'bg-white dark:bg-[#0c0c0e] border-black/[0.08] dark:border-white/[0.12] hover:border-black/[0.18] dark:hover:border-white/[0.22]'
          }`}
        >
          <div className={`text-[11px] font-semibold ${activeTab === 'DEPARTMENT_TASKS' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`}>
            Department Queue
          </div>
          <div className="text-2xl font-extrabold tnum">
            {departmentTasks.filter(t => t.status !== 'DONE').length}
          </div>
        </div>

        <div 
          onClick={() => { setActiveTab('COMPLETED_ARCHIVE'); setArchiveSubFilter('ALL'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-1 ${
            activeTab === 'COMPLETED_ARCHIVE'
              ? 'bg-emerald-600 text-white border-transparent ring-2 ring-emerald-400/40'
              : 'bg-white dark:bg-[#0c0c0e] border-black/[0.08] dark:border-white/[0.12] hover:border-black/[0.18] dark:hover:border-white/[0.22]'
          }`}
        >
          <div className={`text-[11px] font-semibold ${activeTab === 'COMPLETED_ARCHIVE' ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
            Documentation Archive
          </div>
          <div className="text-2xl font-extrabold tnum">
            {completedTasks.length}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
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
            My Active ({myTasks.filter(t => t.status !== 'DONE').length})
          </button>

          {/* Manager Board View (Admins and Line Managers Only) */}
          {canAccessManagerBoard && (
            <button
              onClick={() => setActiveTab('MANAGER_BOARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'MANAGER_BOARD'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Manager Tracking Board ({tasksAssignedByMe.filter(t => t.status !== 'DONE').length})</span>
            </button>
          )}

          {/* Department Queue */}
          <button
            onClick={() => setActiveTab('DEPARTMENT_TASKS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'DEPARTMENT_TASKS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{currentUser.departmentName ? currentUser.departmentName.split(' ')[0] : 'Dept'} Queue ({departmentTasks.filter(t => t.status !== 'DONE').length})</span>
          </button>

          {/* Approvals */}
          <button
            onClick={() => setActiveTab('PENDING_APPROVAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'PENDING_APPROVAL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Approvals ({isManager ? pendingMyApproval.length : myTasks.filter(t => t.approvalStatus === 'PENDING_APPROVAL').length})</span>
          </button>

          {/* Documentation Archive */}
          <button
            onClick={() => setActiveTab('COMPLETED_ARCHIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'COMPLETED_ARCHIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Documentation Archive ({completedTasks.length})</span>
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
              placeholder="Search deliverables..."
              className="w-full pl-8 pr-2.5 py-1 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={scopeFilter}
            onChange={(e: any) => setScopeFilter(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Scopes</option>
            <option value="PROJECT">📁 Projects</option>
            <option value="NON_PROJECT">🏢 Internal</option>
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

      {/* Sub-Filters for Manager Board & Archive */}
      {activeTab === 'MANAGER_BOARD' && canAccessManagerBoard && (
        <div className="p-3 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-950 dark:text-indigo-200 text-[11px]">
              Manager Tracking Filter:
            </span>
            <div className="flex items-center gap-1 bg-white/70 dark:bg-black/40 p-1 rounded-xl border border-indigo-500/20">
              <button
                onClick={() => setManagerStatusFilter('ALL')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  managerStatusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Delegated ({tasksAssignedByMe.length})
              </button>
              <button
                onClick={() => setManagerStatusFilter('ACTIVE')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  managerStatusFilter === 'ACTIVE' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                In Progress ({tasksAssignedByMe.filter(t => t.status !== 'DONE').length})
              </button>
              <button
                onClick={() => setManagerStatusFilter('COMPLETED')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  managerStatusFilter === 'COMPLETED' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Completed Archive ({tasksAssignedByMe.filter(t => t.status === 'DONE').length})
              </button>
            </div>
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
            ℹ️ Tasks assigned by you remain visible here even after completion for auditing & records.
          </span>
        </div>
      )}

      {activeTab === 'COMPLETED_ARCHIVE' && (
        <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-950 dark:text-emerald-200 text-[11px]">
              Documentation Scope:
            </span>
            <div className="flex items-center gap-1 bg-white/70 dark:bg-black/40 p-1 rounded-xl border border-emerald-500/20">
              <button
                onClick={() => setArchiveSubFilter('ALL')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  archiveSubFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Company Records ({completedTasks.length})
              </button>
              <button
                onClick={() => setArchiveSubFilter('ASSIGNED_BY_ME')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  archiveSubFilter === 'ASSIGNED_BY_ME' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Assigned by Me ({tasks.filter(t => t.status === 'DONE' && (t.assignedById === currentUser.id || t.managerId === currentUser.id)).length})
              </button>
              <button
                onClick={() => setArchiveSubFilter('MY_COMPLETED')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  archiveSubFilter === 'MY_COMPLETED' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Executed by Me ({tasks.filter(t => t.status === 'DONE' && (t.completedById === currentUser.id || t.assigneeId === currentUser.id)).length})
              </button>
              <button
                onClick={() => setArchiveSubFilter('DEPARTMENT')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  archiveSubFilter === 'DEPARTMENT' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Department Archive
              </button>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            🔒 Permanently locked documentation repository. All verified KPI points are archived.
          </span>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 stroke-1" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No deliverables found</div>
            <p className="text-xs text-slate-400">There are no tasks in this view matching your filter parameters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'DONE';
            const isPending = task.approvalStatus === 'PENDING_APPROVAL';
            const isRejected = task.approvalStatus === 'REJECTED';
            const percent = task.progressPercent || (isDone ? 100 : task.status === 'IN_PROGRESS' ? 50 : 0);

            // Due date check
            const isOverdue = !isDone && new Date(task.dueDate).getTime() < new Date().getTime();

            return (
              <motion.div
                key={task.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border transition-all cursor-pointer shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  selectedTask?.id === task.id
                    ? 'border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white'
                    : isDone
                    ? 'border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-500/[0.02]'
                    : isOverdue
                    ? 'border-red-500/30 dark:border-red-500/30'
                    : 'border-black/[0.08] dark:border-white/[0.12] hover:border-black/[0.18] dark:hover:border-white/[0.22]'
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${
                      task.priority === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400' :
                      task.priority === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
                    }`}>
                      {task.priority}
                    </span>

                    {/* Assignment Scope Badge */}
                    {task.assignmentType === 'DEPARTMENT' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Building2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Dept Deliverable ({task.departmentName})</span>
                      </span>
                    ) : task.assignmentType === 'MULTIPLE' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>Squad Deliverable</span>
                      </span>
                    ) : null}

                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-md border border-black/[0.05] dark:border-white/[0.08] whitespace-nowrap shrink-0">
                      {task.moduleOrigin}
                    </span>

                    {isPending && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3" />
                        Awaiting Manager Approval
                      </span>
                    )}

                    {isOverdue && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <AlertCircle className="w-3 h-3" />
                        Overdue Deadline
                      </span>
                    )}

                    {/* Regulatory / Starter Template Badges */}
                    {task.taskType === 'APPROVAL_GATE' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>SOW/ToR Gate</span>
                      </span>
                    )}

                    {task.isBlockedByGate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock className="w-3 h-3 text-rose-600" />
                        <span>Blocked by Gate</span>
                      </span>
                    )}

                    {task.taskType === 'REPORT' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <FileText className="w-3 h-3 text-purple-600" />
                        <span>Final Report</span>
                      </span>
                    )}

                    {task.taskType === 'DECISION_GATE' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                        <GitBranch className="w-3 h-3 text-indigo-600" />
                        <span>PERA Decision Gate</span>
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate flex items-center gap-2">
                    <span>{task.title}</span>
                    {task.completedByName && (
                      <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                        (Executed by: {task.completedByName})
                      </span>
                    )}
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
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Corporate Operations</span>
                      </span>
                    )}

                    <span className="whitespace-nowrap shrink-0">
                      Target: <b className="text-slate-700 dark:text-slate-300">{task.assigneeName}</b>
                    </span>

                    {task.assignedByName && (
                      <span className="whitespace-nowrap shrink-0">
                        Assigned By: <b className="text-indigo-600 dark:text-indigo-400">{task.assignedByName}</b>
                      </span>
                    )}

                    <span className="whitespace-nowrap shrink-0">
                      Due: <b className={`tnum ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{task.dueDate}</b>
                    </span>

                    {task.comments && task.comments.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap shrink-0">
                        <MessageSquare className="w-3 h-3 text-indigo-500" />
                        {task.comments.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Meter & Quick Action */}
                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-black/[0.05] dark:border-white/[0.08]">
                  <div 
                    onClick={!isDone && !task.isBlockedByGate ? (e) => {
                      e.stopPropagation();
                      handleOpenUpdateTask(task);
                    } : undefined}
                    className={`w-28 space-y-1 ${!isDone && !task.isBlockedByGate ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    title={!isDone && !task.isBlockedByGate ? 'Click to update progress milestone' : undefined}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                        Progress {isDone && <Lock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />}
                      </span>
                      <span className={`tnum ${isDone ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-900 dark:text-white'}`}>{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isDone ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : isPending ? 'bg-amber-400' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {!isDone && !task.isBlockedByGate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUpdateTask(task);
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-xs active:scale-[0.96] whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer transition-all"
                      title="Update progress milestone, log field hours, or submit for PM sign-off"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Update Progress</span>
                    </button>
                  )}

                  {!isDone && (task.approvalStatus === 'APPROVED' || !task.approvalStatus) && isTaskPM(task) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCompletionModal(task);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow-xs active:scale-[0.96] whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer transition-all"
                      title="Finalize Deliverable (+KPI)"
                    >
                      <Check className="w-3 h-3" />
                      <span>Complete</span>
                    </button>
                  )}

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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0">
                        {activeDetailTask.moduleOrigin}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                        activeDetailTask.priority === 'URGENT' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {activeDetailTask.priority}
                      </span>
                      {activeDetailTask.assignmentType === 'DEPARTMENT' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap shrink-0">
                          🏢 Department Deliverable
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {activeDetailTask.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(() => {
                      const proj = activeDetailTask.projectId ? projects.find(p => p.id === activeDetailTask.projectId) : null;
                      const canEditThisTask = isSuperadmin || isManager || (proj ? (proj.leadPmId === currentUser.id || proj.projectManagerId === currentUser.id) : false) || activeDetailTask.assignedById === currentUser.id;
                      if (!canEditThisTask) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => handleOpenEditTaskAndAssignees(activeDetailTask)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Edit Task & Assignees"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Edit</span>
                        </button>
                      );
                    })()}
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Task Details & Metadata */}
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-2 text-xs">
                  {activeDetailTask.description && (
                    <p className="text-slate-700 dark:text-slate-300">
                      {activeDetailTask.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <div>Target: <b className="text-slate-800 dark:text-slate-200">{activeDetailTask.assigneeName}</b></div>
                    <div>Due Date: <b className="text-slate-800 dark:text-slate-200 tnum">{activeDetailTask.dueDate}</b></div>
                    <div>Assigned By: <b className="text-indigo-600 dark:text-indigo-400">{activeDetailTask.assignedByName || 'Management'}</b></div>
                    <div>Supervising Manager: <b className="text-slate-800 dark:text-slate-200">{activeDetailTask.managerName || 'Leadership'}</b></div>
                    <div>Scope: <b className="text-slate-800 dark:text-slate-200">{activeDetailTask.projectName || 'Corporate Operations'}</b></div>
                    <div>Logged Hours: <b className="text-slate-800 dark:text-slate-200 tnum">{activeDetailTask.loggedHours || 0} hrs</b></div>
                  </div>
                </div>

                {/* Documentation & KPI Record (If Completed) */}
                {activeDetailTask.status === 'DONE' && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Completed Deliverable Archive</span>
                      </span>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap shrink-0 shadow-xs">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
                      <div>Execution Officer: <b className="text-emerald-700 dark:text-emerald-400 font-bold">{activeDetailTask.completedByName || activeDetailTask.assigneeName}</b></div>
                      <div>Completion Timestamp: <b className="tnum font-semibold">{activeDetailTask.completedAt || activeDetailTask.dueDate}</b></div>
                      {activeDetailTask.completionNotes && (
                        <div className="p-2.5 bg-white/80 dark:bg-black/40 rounded-xl border border-emerald-500/20 text-[11px]">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">Execution Notes & Proof:</span>
                          <p>{activeDetailTask.completionNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* KPI Impact Breakdown */}
                    <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/30 space-y-1 text-[11px]">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                        🏅 Verified Appraisal KPI Points Awarded:
                      </span>
                      {activeDetailTask.assignmentType === 'DEPARTMENT' ? (
                        <ul className="list-disc list-inside text-[10px] text-emerald-800 dark:text-emerald-300 space-y-0.5">
                          <li>Executing Officer ({activeDetailTask.completedByName || 'Champion'}): <b>+20 pts</b></li>
                          <li>Department Colleagues ({activeDetailTask.departmentName}): <b>+6 pts each</b></li>
                          <li>Line Manager / Dept Head: <b>+8 pts</b></li>
                        </ul>
                      ) : (
                        <ul className="list-disc list-inside text-[10px] text-emerald-800 dark:text-emerald-300 space-y-0.5">
                          <li>Assignee ({activeDetailTask.assigneeName}): <b>+15 pts</b> (Primary Deliverable Execution)</li>
                          <li>Line Manager / Assigner: <b>+6 pts</b> (Supervisory Delivery Credit)</li>
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Gate-Blocked Advisory Banner */}
                {activeDetailTask.isBlockedByGate && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-300">
                    <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold">Locked by SOW / ToR Approval Gate</div>
                      <p className="text-[11px] text-rose-800/90 dark:text-rose-300/90 leading-relaxed">
                        In accordance with EIA regulatory compliance, field data acquisition cannot commence until the Terms of Reference (TOR) / Scope of Work (SOW) client approval gate is signed off by the Project Manager.
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Milestone Slider (If Active and Not Gate Blocked) */}
                {activeDetailTask.status !== 'DONE' && activeDetailTask.approvalStatus !== 'REJECTED' && !activeDetailTask.isBlockedByGate && (() => {
                  const activeDetailProject = activeDetailTask.projectId ? projects.find(p => p.id === activeDetailTask.projectId) : null;
                  const canCompleteActiveTask = isSuperadmin || (activeDetailProject ? (activeDetailProject.leadPmId === currentUser.id || activeDetailProject.projectManagerId === currentUser.id) : isManager);

                  return (
                    <div className="p-4 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Progress Milestone</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateTask(activeDetailTask)}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Detailed Logger & Hours &rarr;</span>
                          </button>
                          <span className="tnum font-extrabold text-sm">{activeDetailTask.progressPercent || 0}%</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={canCompleteActiveTask ? 100 : 90}
                        step={5}
                        value={activeDetailTask.progressPercent || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateTaskProgress(activeDetailTask.id, val);
                          setSelectedTask(prev => prev ? { ...prev, progressPercent: val } : null);
                        }}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            updateTaskProgress(activeDetailTask.id, 25, 'IN_PROGRESS');
                            setSelectedTask(prev => prev ? { ...prev, progressPercent: 25, status: 'IN_PROGRESS' } : null);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold active:scale-[0.96] whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          25%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateTaskProgress(activeDetailTask.id, 50, 'IN_PROGRESS');
                            setSelectedTask(prev => prev ? { ...prev, progressPercent: 50, status: 'IN_PROGRESS' } : null);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold active:scale-[0.96] whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateTaskProgress(activeDetailTask.id, 75, 'IN_PROGRESS');
                            setSelectedTask(prev => prev ? { ...prev, progressPercent: 75, status: 'IN_PROGRESS' } : null);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold active:scale-[0.96] whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          75%
                        </button>
                        
                        {canCompleteActiveTask ? (
                          <button
                            type="button"
                            onClick={() => openCompletionModal(activeDetailTask)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold ml-auto shadow-xs active:scale-[0.96] whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Finalize Deliverable (+KPI)</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 ml-auto flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                updateTaskProgress(activeDetailTask.id, 90, 'UNDER_REVIEW');
                                setSelectedTask(prev => prev ? { ...prev, progressPercent: 90, status: 'UNDER_REVIEW' } : null);
                                addTaskComment(activeDetailTask.id, `${currentUser.name} marked progress at 90% and requested PM sign-off.`);
                                haptics.success();
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-xs active:scale-[0.96] whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer"
                              title="Set to 90% and request PM sign-off"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit for Sign-Off (90%)</span>
                            </button>
                            <div 
                              title="Under Slate Labs Core Rule 4, only the designated Project Manager can mark deliverables completed."
                              className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-not-allowed opacity-90"
                            >
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>PM Sign-Off Required (Rule 4)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Threaded Time-Stamped Comments Feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      Collaborative Comments & Audit Trail
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

      {/* Task Completion & KPI Attribution Modal */}
      <AnimatePresence>
        {completingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#0c0c0e] rounded-3xl border border-black/[0.08] dark:border-white/[0.12] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Finalize Deliverable & Credit KPI
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Record completion documentation and execute weighted appraisal distribution.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCompletingTask(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Task Title</span>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {completingTask.title}
                </div>
              </div>

              {/* Completing Officer Selector (Vital for Department tasks) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Executing Officer (Carried Out Work) *
                </label>
                <select
                  value={completingOfficerId}
                  onChange={(e) => setCompletingOfficerId(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#121216] border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                >
                  <option value={currentUser.id}>
                    👤 {currentUser.name} (Myself — {currentUser.jobTitle})
                  </option>
                  {allUsers
                    .filter(u => u.id !== currentUser.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.jobTitle} ({u.departmentName})
                      </option>
                    ))}
                </select>
              </div>

              {/* Completion Notes */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Execution Documentation & Resolution Notes *
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Summarize key findings, client submission link, or deliverables produced for audit documentation..."
                  className="w-full p-2.5 bg-white dark:bg-[#121216] border border-black/[0.1] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* KPI Impact Distribution Preview */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Weighted KPI Points Breakdown:</span>
                </div>
                {completingTask.assignmentType === 'DEPARTMENT' ? (
                  <div className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 space-y-0.5">
                    <div>🏆 Executing Champion ({allUsers.find(u => u.id === completingOfficerId)?.name || 'Completer'}): <b>+20 pts</b></div>
                    <div>👥 {completingTask.departmentName || 'Department'} Staff: <b>+6 pts each</b> (Shared Team Boost)</div>
                    <div>👔 Department Head / Line Manager: <b>+8 pts</b> (Oversight Credit)</div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 space-y-0.5">
                    <div>👤 Assignee ({completingTask.assigneeName}): <b>+15 pts</b></div>
                    <div>👔 Line Manager ({completingTask.assignedByName || 'Manager'}): <b>+6 pts</b></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCompletion}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.96] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm & Lock Deliverable (+KPI)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task & Assignees Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingTask(null)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F6F4F0]">Edit Task & Assignees</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Modify deliverable scope, schedule, and team role allocation</p>
                  </div>
                </div>
                <button onClick={() => setEditingTask(null)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleSaveEditTaskAndAssignees} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Description / Scope</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Technical scope, requirements, standard specifications..."
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Stage / Phase</label>
                    <input
                      type="text"
                      value={editStage}
                      onChange={(e) => setEditStage(e.target.value)}
                      placeholder="e.g. 3 Field data gathering"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Task Type</label>
                    <select
                      value={editTaskType}
                      onChange={(e: any) => setEditTaskType(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      <option value="STANDARD">Standard Task</option>
                      <option value="REPORT">Final Report Deliverable</option>
                      <option value="APPROVAL_GATE">Approval Gate (Hard-Block)</option>
                      <option value="DECISION_GATE">Decision Gate (Route Branch)</option>
                      <option value="ONGOING">Ongoing / Continuous</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e: any) => setEditPriority(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High Priority</option>
                      <option value="CRITICAL">Critical SLA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Est. Hours</label>
                    <input
                      type="number"
                      min={1}
                      value={editEstHours}
                      onChange={(e) => setEditEstHours(Number(e.target.value))}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono tnum text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                </div>

                {/* Primary Assignee */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Primary Assignee *
                  </label>
                  <select
                    required
                    value={editPrimaryAssigneeId}
                    onChange={(e) => setEditPrimaryAssigneeId(e.target.value)}
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.jobTitle} ({u.departmentName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slate Labs Rule 3: Role-Based Assignees */}
                <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-bold text-[11px] text-slate-900 dark:text-white">Multi-Role Assignees (Slate Labs Rule 3)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Optional Role Allocation</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Lead Specialist (30% KPI)
                      </label>
                      <select
                        value={editLeadUserId}
                        onChange={(e) => setEditLeadUserId(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-[11px]"
                      >
                        <option value="">(None / Same as Primary)</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.departmentName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Field Contributor (20% KPI)
                      </label>
                      <select
                        value={editContributorUserId}
                        onChange={(e) => setEditContributorUserId(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-[11px]"
                      >
                        <option value="">(None)</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.departmentName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Report Writer (35% KPI)
                      </label>
                      <select
                        value={editWriterUserId}
                        onChange={(e) => setEditWriterUserId(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-[11px]"
                      >
                        <option value="">(None)</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.departmentName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Brand/IT Designer (15% KPI)
                      </label>
                      <select
                        value={editDesignerUserId}
                        onChange={(e) => setEditDesignerUserId(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-[11px]"
                      >
                        <option value="">(None)</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.departmentName})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setEditingTask(null)} className="px-3 py-1.5 text-[#86868B]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs active:scale-[0.98]">
                    Save Task & Assignees
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update Task Progress & Field Time Modal */}
      <AnimatePresence>
        {updatingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUpdatingTask(null)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F6F4F0]">Update Task Progress</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{updatingTask.title}</p>
                  </div>
                </div>
                <button onClick={() => setUpdatingTask(null)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleSaveTaskUpdate} className="space-y-4">
                {/* Task Context Card */}
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">{updatingTask.stage || updatingTask.projectName || 'General Deliverable'}</span>
                    <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Due: {updatingTask.dueDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Assigned to: <b className="text-slate-800 dark:text-slate-200">{updatingTask.assigneeName}</b> • Current Progress: <b className="text-indigo-600 dark:text-indigo-400 font-mono">{updatingTask.progressPercent || 0}%</b>
                  </div>
                </div>

                {/* Core Rule 4 Notice if Non-PM */}
                {!isTaskPM(updatingTask) && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span><b>Core Rule 4:</b> Assignees can advance work up to 90% and submit for review. Only the Project Manager marks completion.</span>
                  </div>
                )}

                {/* Progress Milestone Slider */}
                <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Progress Milestone</span>
                    <span className="text-sm font-extrabold font-mono text-indigo-600 dark:text-indigo-400 tnum">{updateProgressVal}%</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={isTaskPM(updatingTask) ? 100 : 90}
                    step={5}
                    value={updateProgressVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const isPM = isTaskPM(updatingTask);
                      setUpdateProgressVal(val);
                      if (val === 0) setUpdateStatusVal('NOT_STARTED');
                      else if (val >= 100 && isPM) setUpdateStatusVal('DONE');
                      else if (val >= 90 && !isPM) setUpdateStatusVal('UNDER_REVIEW');
                      else setUpdateStatusVal('IN_PROGRESS');
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => { setUpdateProgressVal(25); setUpdateStatusVal('IN_PROGRESS'); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        updateProgressVal === 25 ? 'bg-indigo-600 text-white' : 'bg-black/[0.04] dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      25% Started
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUpdateProgressVal(50); setUpdateStatusVal('IN_PROGRESS'); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        updateProgressVal === 50 ? 'bg-indigo-600 text-white' : 'bg-black/[0.04] dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      50% Halfway
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUpdateProgressVal(75); setUpdateStatusVal('IN_PROGRESS'); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        updateProgressVal === 75 ? 'bg-indigo-600 text-white' : 'bg-black/[0.04] dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      75% Advanced
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUpdateProgressVal(90); setUpdateStatusVal('UNDER_REVIEW'); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        updateProgressVal === 90 ? 'bg-amber-600 text-white' : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      90% Ready for Sign-Off
                    </button>
                    {isTaskPM(updatingTask) && (
                      <button
                        type="button"
                        onClick={() => { setUpdateProgressVal(100); setUpdateStatusVal('DONE'); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ml-auto ${
                          updateProgressVal === 100 ? 'bg-emerald-600 text-white' : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        100% Finalize
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Status</label>
                    <select
                      value={updateStatusVal}
                      onChange={(e: any) => setUpdateStatusVal(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="UNDER_REVIEW">Under Review / Ready for PM Sign-off</option>
                      {isTaskPM(updatingTask) && <option value="DONE">Completed (100% Signed Off)</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      + Log Additional Hours (hrs)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={updateAdditionalHours}
                      onChange={(e) => setUpdateAdditionalHours(Number(e.target.value))}
                      placeholder="e.g. 3.5"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono tnum text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Currently logged: {updatingTask.loggedHours || 0} hrs</span>
                  </div>
                </div>

                {/* Progress Update / Handover Note */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Operational Note / Handover Comment
                  </label>
                  <textarea
                    rows={2}
                    value={updateCommentText}
                    onChange={(e) => setUpdateCommentText(e.target.value)}
                    placeholder="e.g. Completed initial site survey and updated GIS layer coordinates."
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                {/* PM Completion Notes (if marking complete) */}
                {isTaskPM(updatingTask) && (updateProgressVal === 100 || updateStatusVal === 'DONE') && (
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      PM Final Sign-Off Deliverable Acceptance Note *
                    </label>
                    <input
                      type="text"
                      value={updateCompletionNote}
                      onChange={(e) => setUpdateCompletionNote(e.target.value)}
                      placeholder="e.g. Technical peer review verified; signed off for milestone billing."
                      className="w-full p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-950 dark:text-emerald-200"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setUpdatingTask(null)} className="px-3 py-1.5 text-[#86868B]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs active:scale-[0.98]">
                    Save Progress Update
                  </button>
                </div>
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
