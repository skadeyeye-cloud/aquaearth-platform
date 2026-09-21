'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  FolderKanban, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  HardDrive, 
  ArrowRight, 
  Layers, 
  FileText, 
  UploadCloud, 
  Check, 
  X, 
  Archive, 
  ChevronDown, 
  Lock, 
  Unlock, 
  Users, 
  CheckSquare, 
  Download, 
  FileSpreadsheet, 
  Pause, 
  Play, 
  Award, 
  ShieldCheck, 
  CheckCheck, 
  Trash2, 
  Edit3, 
  Pencil, 
  Sliders, 
  MessageSquare, 
  Send, 
  UserCheck, 
  GitBranch, 
  CalendarClock, 
  HelpCircle, 
  Briefcase,
  Landmark,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { 
  ProjectRecord, 
  ProjectHealth, 
  ProjectStatus, 
  TaskItem, 
  ProjectType, 
  TaskAssigneeRole,
  TaskAssignee 
} from '@/lib/types';
import { PROJECT_TEMPLATES } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { exportToXls, exportToPdf } from '@/lib/export-utils';
import { EditProjectModal } from '@/components/projects/EditProjectModal';

export default function ProjectsPage() {
  const { 
    currentUser, 
    projects, 
    clients, 
    allUsers, 
    tasks, 
    createProject, 
    editProject,
    createTaskForApproval, 
    closeOutAndArchiveProject, 
    confirmSuggestedTask, 
    confirmAllSuggestedTasks, 
    deleteSuggestedTask, 
    updateSuggestedTask, 
    editTask, 
    addTaskComment, 
    requestDueDateChange, 
    approveDueDateChange, 
    rejectDueDateChange, 
    pauseProject, 
    resumeProject, 
    selectDecisionRoute, 
    awardProjectBonus, 
    taskDateChangeRequests, 
    projectPauseEvents, 
    kpiBonusAwards, 
    updateTaskProgress 
  } = useAuth();

  const [healthFilter, setHealthFilter] = useState<'ALL' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) || null : null;

  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'MANAGING_CONSULTANT' || 
                       currentUser.id === 'usr-1' || 
                       currentUser.name.toLowerCase().includes('kaine');

  const isProjectManager = isSuperadmin || 
                          currentUser.managementTier === 'LINE_MANAGER' || 
                          currentUser.functionalRole === 'PROJECT_MANAGER' || 
                          currentUser.managementTier === 'TEAM_LEAD';

  const isHR = (currentUser.functionalRole === 'HR_ADMIN' || currentUser.departmentName === 'Human Resources') && !isSuperadmin;

  // New Project Modal State
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjCode, setNewProjCode] = useState(`PRJ-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newProjType, setNewProjType] = useState<ProjectType | 'CUSTOM'>('EIA');
  const [newProjClientId, setNewProjClientId] = useState(clients[0]?.id || '');
  const [newProjValue, setNewProjValue] = useState(65000000);
  const [newProjCurrency, setNewProjCurrency] = useState<'NGN' | 'USD' | 'EUR' | 'GBP'>('NGN');
  const [newProjStartDate, setNewProjStartDate] = useState('2026-09-20');
  const [newProjEndDate, setNewProjEndDate] = useState('2026-12-31');
  const [newProjLeadPmId, setNewProjLeadPmId] = useState(allUsers.find(u => u.managementTier === 'LINE_MANAGER')?.id || allUsers[0]?.id || '');
  const [newProjServiceLines, setNewProjServiceLines] = useState<string[]>(['Geotechnical Investigations', 'Environmental & Social (ESIA)']);
  
  // Custom manual tasks (used if newProjType === 'CUSTOM')
  const [initialTasks, setInitialTasks] = useState<Array<{ title: string; assigneeId: string; dueDate: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }>>([
    { title: 'Inception Report & Mobilization Plan', assigneeId: allUsers[0]?.id || '', dueDate: '2026-09-30', priority: 'HIGH' }
  ]);

  // Drawer Add Task Modal State
  const [isAddDrawerTaskOpen, setIsAddDrawerTaskOpen] = useState(false);
  const [drawerTaskTitle, setDrawerTaskTitle] = useState('');
  const [drawerTaskAssigneeId, setDrawerTaskAssigneeId] = useState(allUsers[0]?.id || '');
  const [drawerTaskDueDate, setDrawerTaskDueDate] = useState('2026-10-15');
  const [drawerTaskPriority, setDrawerTaskPriority] = useState<TaskItem['priority']>('MEDIUM');
  const [drawerTaskHours, setDrawerTaskHours] = useState(16);

  // Pause Modal State
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseReasonInput, setPauseReasonInput] = useState('');

  // Bonus Award Modal State (Rule 8)
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [bonusRecipientId, setBonusRecipientId] = useState(allUsers[0]?.id || '');
  const [bonusPoints, setBonusPoints] = useState(5);
  const [bonusNote, setBonusNote] = useState('');

  // Due Date Change Request Modal State
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [dueDateTaskId, setDueDateTaskId] = useState('');
  const [dueDateNewDate, setDueDateNewDate] = useState('');
  const [dueDateReason, setDueDateReason] = useState('');

  // Update Task Modal State (For Assignees & PMs)
  const [updatingTask, setUpdatingTask] = useState<TaskItem | null>(null);
  const [updateProgressVal, setUpdateProgressVal] = useState<number>(0);
  const [updateStatusVal, setUpdateStatusVal] = useState<TaskItem['status']>('NOT_STARTED');
  const [updateAdditionalHours, setUpdateAdditionalHours] = useState<number>(0);
  const [updateCommentText, setUpdateCommentText] = useState<string>('');
  const [updateCompletionNote, setUpdateCompletionNote] = useState<string>('');

  // Edit Task & Assignees Modal State (For Active & Suggested Tasks)
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

  // AI Scope Parser State
  const [isAiParserOpen, setIsAiParserOpen] = useState(false);
  const [aiParsingStep, setAiParsingStep] = useState<'UPLOAD' | 'PARSING' | 'PREVIEW'>('UPLOAD');
  const [uploadedDocName, setUploadedDocName] = useState('Shell_Bonga_North_Subsea_TOR_2026.pdf');
  
  // AI Parsed Draft State
  const [parsedTitle, setParsedTitle] = useState('Shell Bonga North Subsea Geohazard & Metocean Assessment');
  const [parsedClient, setParsedClient] = useState('Shell Petroleum Development Company (SPDC)');
  const [parsedServiceLines, setParsedServiceLines] = useState<string[]>(['Geotechnical Investigations', 'Metocean Planning & Studies', 'GIS, Hydrographic & Topographic Survey']);
  const [parsedValue, setParsedValue] = useState(165000000);
  const [parsedLeadPm, setParsedLeadPm] = useState('Engr. Femi Adebayo');

  // Project Edit Modal
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  if (isHR) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center space-y-4 bg-white dark:bg-[#0C0C0D] rounded-3xl border border-rose-200 dark:border-rose-900/50">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Access Restricted (HR Scoping Barrier)</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          In accordance with AquaEarth enterprise data isolation policy, Human Resources personnel are restricted from viewing running client projects, engineering milestones, and commercial project telemetry.
        </p>
        <div className="pt-2">
          <a href="/hr/staff" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold">
            Return to HR Human Capital
          </a>
        </div>
      </div>
    );
  }

  const filteredProjects = projects.filter(p => {
    if (healthFilter === 'ALL') return true;
    return p.health === healthFilter;
  });

  const handleSimulateAiParse = () => {
    setAiParsingStep('PARSING');
    setTimeout(() => {
      setAiParsingStep('PREVIEW');
    }, 2000);
  };

  const handleCommitAiProject = () => {
    const newCode = `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;
    createProject({
      projectCode: newCode,
      title: parsedTitle,
      projectType: 'ESIA',
      clientId: 'cli-4',
      clientName: parsedClient,
      serviceLines: parsedServiceLines,
      contractValue: parsedValue,
      currency: 'NGN',
      status: 'ACTIVE',
      health: 'ON_TRACK',
      healthReason: 'Generated via AI Scope Parser with multi-workstream dependencies.',
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: '2026-12-31',
      leadPmId: 'usr-4',
      leadPmName: parsedLeadPm,
      projectManagerId: 'usr-4',
      projectManagerName: parsedLeadPm,
      progressPercent: 0,
      budgetSpent: 0,
      vaultStorageTier: 'ACTIVE_VAULT',
      storageSizeGb: 2.1,
      workstreams: parsedServiceLines.map((sl, idx) => ({
        id: `ws-ai-${idx}`,
        serviceLine: sl,
        leadName: parsedLeadPm,
        progressPercent: 0,
        milestones: [
          { id: `m-ai-1-${idx}`, name: `${sl}: Desktop Inception & Method Statement`, workstream: sl, targetDate: '2026-09-25', status: 'PENDING', isGatePrerequisite: true, deliverablesCount: 1 },
          { id: `m-ai-2-${idx}`, name: `${sl}: Offshore Survey & Field Acquisition`, workstream: sl, targetDate: '2026-10-30', status: 'PENDING', isGatePrerequisite: true, deliverablesCount: 4 },
          { id: `m-ai-3-${idx}`, name: `${sl}: Engineering Analysis & Draft Deliverable`, workstream: sl, targetDate: '2026-11-30', status: 'PENDING', deliverablesCount: 2 }
        ]
      }))
    });

    setIsAiParserOpen(false);
    setAiParsingStep('UPLOAD');
    haptics.success();
  };

  const handleCreateCustomProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    const client = clients.find(c => c.id === newProjClientId);
    const leadPm = allUsers.find(u => u.id === newProjLeadPmId);

    const projectCreated = createProject({
      projectCode: newProjCode.trim(),
      title: newProjTitle.trim(),
      projectType: newProjType !== 'CUSTOM' ? newProjType : undefined,
      templateId: newProjType !== 'CUSTOM' ? PROJECT_TEMPLATES[newProjType]?.id : undefined,
      clientId: newProjClientId,
      clientName: client?.name || 'Direct Client Account',
      serviceLines: newProjServiceLines.length > 0 ? newProjServiceLines : ['Integrated Consulting'],
      contractValue: Number(newProjValue),
      currency: newProjCurrency,
      status: 'ACTIVE',
      health: 'ON_TRACK',
      healthReason: 'Project initialized with Slate Labs starter milestone framework.',
      startDate: newProjStartDate,
      targetEndDate: newProjEndDate,
      leadPmId: leadPm?.id || currentUser.id,
      leadPmName: leadPm?.name || currentUser.name,
      projectManagerId: leadPm?.id || currentUser.id,
      projectManagerName: leadPm?.name || currentUser.name,
      progressPercent: 0,
      budgetSpent: 0,
      vaultStorageTier: 'ACTIVE_VAULT',
      storageSizeGb: 0.5,
      workstreams: newProjServiceLines.map((sl, idx) => ({
        id: `ws-${Date.now()}-${idx}`,
        serviceLine: sl,
        leadName: leadPm?.name || currentUser.name,
        progressPercent: 0,
        milestones: [
          { id: `m-1-${idx}`, name: `${sl} Phase 1: Inception & Scoping`, workstream: sl, targetDate: newProjStartDate, status: 'PENDING', deliverablesCount: 1 },
          { id: `m-2-${idx}`, name: `${sl} Phase 2: Technical Execution`, workstream: sl, targetDate: newProjEndDate, status: 'PENDING', deliverablesCount: 2 }
        ]
      }))
    });

    // Create and assign initial manual tasks if custom type was selected
    if (newProjType === 'CUSTOM') {
      initialTasks.forEach(task => {
        if (task.title.trim()) {
          const assignedUser = allUsers.find(u => u.id === task.assigneeId) || currentUser;
          createTaskForApproval({
            title: task.title.trim(),
            description: `Deliverable milestone task for project ${newProjTitle.trim()}`,
            moduleOrigin: 'PROJECT',
            priority: task.priority,
            dueDate: task.dueDate,
            assigneeId: assignedUser.id,
            projectId: projectCreated.id,
            projectName: projectCreated.title,
            estimatedHours: 20
          });
        }
      });
    }

    setIsCreateProjectOpen(false);
    setNewProjTitle('');
    setNewProjCode(`PRJ-2026-${Math.floor(100 + Math.random() * 900)}`);
    haptics.success();
  };

  const handleAddDrawerTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !drawerTaskTitle.trim()) return;

    const assignedUser = allUsers.find(u => u.id === drawerTaskAssigneeId) || currentUser;

    createTaskForApproval({
      title: drawerTaskTitle.trim(),
      description: `Assigned task for project: ${activeProject.title}`,
      moduleOrigin: 'PROJECT',
      priority: drawerTaskPriority,
      dueDate: drawerTaskDueDate,
      assigneeId: assignedUser.id,
      projectId: activeProject.id,
      projectName: activeProject.title,
      estimatedHours: Number(drawerTaskHours)
    });

    setIsAddDrawerTaskOpen(false);
    setDrawerTaskTitle('');
    haptics.success();
  };

  // Check if current user is PM of active project
  const isCurrentProjectPM = isSuperadmin || 
                             (activeProject ? (activeProject.leadPmId === currentUser.id || activeProject.projectManagerId === currentUser.id) : false);

  // Filter tasks for active project
  const allProjectTasks = activeProject ? tasks.filter(t => t.projectId === activeProject.id) : [];
  const suggestedTasks = allProjectTasks.filter(t => t.confirmed === false);
  const activeTasks = allProjectTasks.filter(t => t.confirmed !== false);

  // Pending date change requests for active project
  const activeProjectDateRequests = activeProject ? taskDateChangeRequests.filter(r => r.projectId === activeProject.id) : [];

  // KPI bonus awards for active project
  const activeProjectBonuses = activeProject ? kpiBonusAwards.filter(b => b.projectId === activeProject.id) : [];

  const handleOpenPauseModal = () => {
    setPauseReasonInput('');
    setIsPauseModalOpen(true);
  };

  const handleConfirmPause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !pauseReasonInput.trim()) return;
    pauseProject(activeProject.id, pauseReasonInput.trim());
    setIsPauseModalOpen(false);
    haptics.success();
  };

  const handleConfirmResume = () => {
    if (!activeProject) return;
    resumeProject(activeProject.id);
    haptics.success();
  };

  const handleOpenBonusModal = () => {
    setBonusRecipientId(allUsers[0]?.id || '');
    setBonusPoints(5);
    setBonusNote('');
    setIsBonusModalOpen(true);
  };

  const handleConfirmBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !bonusRecipientId || !bonusNote.trim()) return;
    const res = awardProjectBonus(activeProject.id, bonusRecipientId, bonusPoints, bonusNote.trim());
    if (res.success) {
      setIsBonusModalOpen(false);
      haptics.success();
    } else {
      alert(res.message);
    }
  };

  const handleOpenDueDateModal = (task: TaskItem) => {
    setDueDateTaskId(task.id);
    setDueDateNewDate(task.dueDate);
    setDueDateReason('');
    setIsDueDateModalOpen(true);
  };

  const handleConfirmDueDateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDateTaskId || !dueDateNewDate || !dueDateReason.trim()) return;
    requestDueDateChange(dueDateTaskId, dueDateNewDate, dueDateReason.trim());
    setIsDueDateModalOpen(false);
    haptics.success();
  };

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
    setEditingTask(null);
    haptics.success();
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

    if (isNowDone && updatingTask.projectId && !isCurrentProjectPM) {
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

    setUpdatingTask(null);
    haptics.success();
  };

  const handleExportProjectsPdf = () => {
    exportToPdf({
      filename: `AquaEarth_Projects_Delivery_${new Date().toISOString().split('T')[0]}`,
      title: 'Commercial Projects & Milestone Delivery Schedule',
      subtitle: `AquaEarth Consulting Limited — Health Filter: ${healthFilter}`,
      category: 'PROJECT DELIVERY SCHEDULE',
      summaryMetrics: [
        { label: 'Active Engagements', value: String(filteredProjects.length) },
        { label: 'On Track', value: String(filteredProjects.filter(p => p.health === 'ON_TRACK').length) },
        { label: 'At Risk / Delayed', value: String(filteredProjects.filter(p => p.health === 'AT_RISK' || p.health === 'DELAYED').length) },
        { label: 'Portfolio Value', value: `₦${filteredProjects.reduce((a, b) => a + (b.contractValue || 0), 0).toLocaleString()}` }
      ],
      columns: [
        { header: 'Code', key: 'projectCode', width: '90px' },
        { header: 'Project Title', key: 'title' },
        { header: 'Type', key: 'projectType' },
        { header: 'Client', key: 'clientName' },
        { header: 'Lead PM', key: 'leadPmName' },
        { header: 'Health', key: 'health', format: (val) => val === 'ON_TRACK' ? 'On Track' : val === 'AT_RISK' ? 'At Risk' : 'Delayed' },
        { header: 'Progress', key: 'progressPercent', align: 'center', format: (val) => `${val}%` },
        { header: 'Status', key: 'status' }
      ],
      data: filteredProjects,
      signatories: [
        { role: 'PROJECT MANAGER', name: currentUser.name, title: `${currentUser.jobTitle || 'Lead Consultant'}` },
        { role: 'TECHNICAL DIRECTOR', name: 'Engr. Femi Adebayo', title: 'Head of Engineering' },
        { role: 'MANAGING CONSULTANT', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

  const handleExportProjectsXls = () => {
    exportToXls({
      filename: `AquaEarth_Projects_Delivery_${new Date().toISOString().split('T')[0]}`,
      title: 'COMMERCIAL PROJECTS & MILESTONE DELIVERY SCHEDULE',
      subtitle: `Health Filter: ${healthFilter} | Extracted By: ${currentUser.name}`,
      category: 'PROJECT SCHEDULE',
      metadata: {
        'Manager': currentUser.name,
        'Filter': healthFilter,
        'Total Count': String(filteredProjects.length)
      },
      summaryMetrics: [
        { label: 'Total Engagements', value: filteredProjects.length },
        { label: 'Portfolio Value', value: `₦${filteredProjects.reduce((a, b) => a + (b.contractValue || 0), 0).toLocaleString()}` }
      ],
      columns: [
        { header: 'Project Code', key: 'projectCode' },
        { header: 'Project Title', key: 'title' },
        { header: 'Project Type', key: 'projectType' },
        { header: 'Client Name', key: 'clientName' },
        { header: 'Lead PM', key: 'leadPmName' },
        { header: 'Health', key: 'health' },
        { header: 'Progress (%)', key: 'progressPercent' },
        { header: 'Contract Value (₦)', key: 'contractValue', format: (v) => Number(v || 0).toLocaleString() },
        { header: 'Status', key: 'status' },
        { header: 'Due Date', key: 'targetEndDate' }
      ],
      data: filteredProjects
    });
    haptics.success();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tracking-tight flex items-center gap-2.5">
            <span>Projects & Milestones</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Slate Labs V1.2 Framework
            </span>
          </h1>
          <p className="text-xs text-[#86868B] mt-0.5">
            Manage multi-disciplinary engagements, starter milestone templates, approval gating, and PM performance bonuses.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Create Project Button (Project Managers & Superadmins) */}
          {isProjectManager && (
            <button
              onClick={() => { haptics.selection(); setIsCreateProjectOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          )}

          {/* AI PRD / TOR Scope Parser Button */}
          <button
            onClick={() => setIsAiParserOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI PRD Scope Parser</span>
          </button>
        </div>
      </div>

      {/* RAG Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#86868B]">Active Portfolio</div>
          <div className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] font-mono tnum">{projects.length} Projects</div>
          <div className="text-[10px] text-[#86868B] font-medium">₦{(projects.reduce((acc, curr) => acc + curr.contractValue, 0) / 1000000).toFixed(0)}M Contract Value</div>
        </div>

        <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#86868B]">🟢 On Track</div>
          <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 font-mono tnum">
            {projects.filter(p => p.health === 'ON_TRACK').length}
          </div>
          <div className="text-[10px] text-[#86868B] font-medium">Within target milestone buffer</div>
        </div>

        <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#86868B]">🟡 At Risk / Paused</div>
          <div className="text-xl font-semibold text-amber-600 dark:text-amber-400 font-mono tnum">
            {projects.filter(p => p.health === 'AT_RISK' || p.isPaused).length}
          </div>
          <div className="text-[10px] text-[#86868B] font-medium">Weather / field buffer slip or hold</div>
        </div>

        <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#86868B]">50% Cold Archive Tier</div>
          <div className="text-xl font-semibold text-cyan-600 dark:text-cyan-400 font-mono tnum">
            {projects.filter(p => p.vaultStorageTier === 'COLD_ARCHIVE').length} Archived
          </div>
          <div className="text-[10px] text-[#86868B] font-medium">Data compressed in Sovereign Vault</div>
        </div>
      </div>

      {/* Health Filter Segmented Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl text-xs font-semibold overflow-x-auto">
          {(['ALL', 'ON_TRACK', 'AT_RISK', 'DELAYED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { haptics.selection(); setHealthFilter(tab); }}
              className={`px-3 py-1 rounded-xl transition-all active:scale-[0.96] whitespace-nowrap shrink-0 ${
                healthFilter === tab ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-bold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Projects' : tab === 'ON_TRACK' ? '🟢 On Track' : tab === 'AT_RISK' ? '🟡 At Risk' : '🔴 Delayed'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#86868B] font-mono tnum whitespace-nowrap shrink-0 mr-1">
            Showing {filteredProjects.length} engagement{filteredProjects.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={handleExportProjectsPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] transition-all cursor-pointer active:scale-[0.97]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleExportProjectsXls}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] transition-all cursor-pointer active:scale-[0.97]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>XLS</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((p) => {
          const isPaused = p.isPaused || p.status === 'PAUSED';
          const pType = p.projectType || 'EIA';
          const projectTasksCount = tasks.filter(t => t.projectId === p.id && t.confirmed !== false).length;
          const pendingSuggestedCount = tasks.filter(t => t.projectId === p.id && t.confirmed === false).length;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 hover:border-black/[0.12] dark:hover:border-white/[0.15] cursor-pointer transition-all shadow-xs group space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] tnum">
                    {p.projectCode}
                  </span>

                  {/* Project Type Badge */}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    {pType === 'PERA_EIA_ROUTE' ? 'PERA & EIA Route' : pType}
                  </span>

                  <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F6F4F0] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {p.title}
                  </h3>

                  {isPaused ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Pause className="w-2.5 h-2.5" />
                      PAUSED
                    </span>
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.health === 'ON_TRACK' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      p.health === 'AT_RISK' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {p.health.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tnum">
                    ₦{(p.contractValue / 1000000).toFixed(1)}M
                  </div>
                  <div className="w-24 bg-black/[0.06] dark:bg-white/[0.1] rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.progressPercent}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-[#86868B] tnum">{p.progressPercent}%</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#86868B] pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span>Client: <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{p.clientName}</b></span>
                <span>Lead PM: <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{p.leadPmName || p.projectManagerName}</b></span>
                <span>Timeline: <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{p.startDate} → {p.targetEndDate}</b></span>
                <span>Active Deliverables: <b className="text-emerald-600 dark:text-emerald-400">{projectTasksCount}</b></span>
                {pendingSuggestedCount > 0 && isProjectManager && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {pendingSuggestedCount} Suggested Staged
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal with Starter Templates */}
      <AnimatePresence>
        {isCreateProjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateProjectOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-2xl w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-5 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Initialize New Commercial Project</h3>
                  <p className="text-[11px] text-[#86868B]">Select regulatory project type to load official Slate Labs starter milestone templates.</p>
                </div>
                <button onClick={() => setIsCreateProjectOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleCreateCustomProject} className="space-y-4">
                {/* Project Type & Starter Template Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Regulatory Project Type & Starter Template *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { type: 'EIA', label: 'EIA Study', desc: 'Template A: 6-step study process (24 tasks)' },
                      { type: 'ESIA', label: 'ESIA Study', desc: 'Template A: Social & Environmental baseline (24 tasks)' },
                      { type: 'PIAR', label: 'PIAR Study', desc: 'Template A: Post-Impact remediation focus (24 tasks)' },
                      { type: 'EBS', label: 'EBS Baseline', desc: 'Template B: 6 Stages + Consultation (15 tasks)' },
                      { type: 'PERA_EIA_ROUTE', label: 'PERA & EIA Route', desc: 'Template C: Screening + Decision Gate' },
                      { type: 'CUSTOM', label: 'Custom Workspace', desc: 'Empty workspace with manual tasks' }
                    ].map(tmpl => (
                      <div
                        key={tmpl.type}
                        onClick={() => setNewProjType(tmpl.type as any)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          newProjType === tmpl.type
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 dark:text-emerald-200'
                            : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.15] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{tmpl.label}</span>
                          {newProjType === tmpl.type && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {tmpl.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {newProjType !== 'CUSTOM' && (
                    <div className="mt-2 p-2.5 bg-indigo-50/80 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 text-[10px] text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        Starter tasks will be initialized in <b>SUGGESTED</b> staging mode (hidden from team) for PM review. Includes SOW/ToR Approval Gate, Field Blocking, and IT & Design Final Report task.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={newProjTitle}
                      onChange={(e) => setNewProjTitle(e.target.value)}
                      placeholder="e.g. TotalEnergies OML-58 Geotechnical & Environmental EIA Study"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Project Code</label>
                    <input
                      type="text"
                      required
                      value={newProjCode}
                      onChange={(e) => setNewProjCode(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Client Organization *</label>
                    <select
                      value={newProjClientId}
                      onChange={(e) => setNewProjClientId(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Lead Project Manager *</label>
                    <select
                      value={newProjLeadPmId}
                      onChange={(e) => setNewProjLeadPmId(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      {allUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} — {u.jobTitle}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Contract Value</label>
                    <input
                      type="number"
                      required
                      value={newProjValue}
                      onChange={(e) => setNewProjValue(Number(e.target.value))}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono tnum text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Currency</label>
                    <select
                      value={newProjCurrency}
                      onChange={(e: any) => setNewProjCurrency(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      <option value="NGN">₦ NGN (Nigerian Naira)</option>
                      <option value="USD">$ USD (US Dollar)</option>
                      <option value="EUR">€ EUR (Euro)</option>
                      <option value="GBP">£ GBP (British Pound)</option>
                    </select>
                  </div>
                </div>

                {/* Timeline Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Mobilization / Start Date *</label>
                    <input
                      type="date"
                      required
                      value={newProjStartDate}
                      onChange={(e) => setNewProjStartDate(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Target End Date / Deliverable *</label>
                    <input
                      type="date"
                      required
                      value={newProjEndDate}
                      onChange={(e) => setNewProjEndDate(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                </div>

                {/* Initial Tasks Builder for Custom Type */}
                {newProjType === 'CUSTOM' && (
                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0]">Custom Manual Tasks</h4>
                        <p className="text-[10px] text-[#86868B]">Manually configure initial tasks for this project.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInitialTasks(prev => [...prev, { title: '', assigneeId: allUsers[0]?.id || '', dueDate: newProjEndDate, priority: 'MEDIUM' }])}
                        className="px-2.5 py-1 bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/[0.1] text-[#1D1D1F] dark:text-[#F6F4F0] rounded-lg text-[11px] font-semibold"
                      >
                        + Add Task
                      </button>
                    </div>

                    <div className="space-y-2">
                      {initialTasks.map((t, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-[#0C0C0D] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                          <div className="col-span-5">
                            <input
                              type="text"
                              placeholder="Deliverable task name..."
                              value={t.title}
                              onChange={(e) => {
                                const updated = [...initialTasks];
                                updated[idx].title = e.target.value;
                                setInitialTasks(updated);
                              }}
                              className="w-full p-1.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-lg text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                            />
                          </div>
                          <div className="col-span-4">
                            <select
                              value={t.assigneeId}
                              onChange={(e) => {
                                const updated = [...initialTasks];
                                updated[idx].assigneeId = e.target.value;
                                setInitialTasks(updated);
                              }}
                              className="w-full p-1.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-lg text-[11px] text-[#1D1D1F] dark:text-[#F6F4F0]"
                            >
                              {allUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.departmentName})</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <input
                              type="date"
                              value={t.dueDate}
                              onChange={(e) => {
                                const updated = [...initialTasks];
                                updated[idx].dueDate = e.target.value;
                                setInitialTasks(updated);
                              }}
                              className="w-full p-1.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-lg text-[11px] text-[#1D1D1F] dark:text-[#F6F4F0]"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            {initialTasks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setInitialTasks(initialTasks.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsCreateProjectOpen(false)} className="px-3.5 py-1.5 text-[#86868B] font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold shadow-xs active:scale-[0.96]">
                    Launch Project & Stage Template Tasks
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Drawer */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProjectId(null)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-2xl h-full bg-white dark:bg-[#0C0C0D] border-l border-black/[0.08] dark:border-white/[0.1] p-6 space-y-6 overflow-y-auto shadow-2xl z-10">
              {/* Drawer Top Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-[#86868B]">{activeProject.projectCode} • Portfolio Record</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {activeProject.projectType || 'EIA'}
                    </span>
                    {activeProject.isPaused && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Pause className="w-2.5 h-2.5" /> PAUSED
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] mt-1">{activeProject.title}</h2>
                  <p className="text-xs text-[#86868B]">{activeProject.clientName}</p>
                </div>
                <button onClick={() => setSelectedProjectId(null)} className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PM Actions Command Bar */}
              {isCurrentProjectPM && (
                <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.08] rounded-2xl flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setIsEditProjectOpen(true); haptics.selection(); }}
                    className="px-3 py-1.5 bg-white dark:bg-[#1C1C1E] hover:bg-slate-100 dark:hover:bg-white/10 border border-black/[0.08] dark:border-white/[0.12] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-[0.96] cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Edit Project</span>
                  </button>

                  {activeProject.isPaused ? (
                    <button
                      onClick={handleConfirmResume}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-[0.96]"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Project</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenPauseModal}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-[0.96]"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Project</span>
                    </button>
                  )}

                  <button
                    onClick={handleOpenBonusModal}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-[0.96]"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Award Bonus (+KPI)</span>
                  </button>

                  <button
                    onClick={() => setIsAddDrawerTaskOpen(true)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-[0.96] ml-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>
              )}

              {/* Paused Status Banner */}
              {activeProject.isPaused && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                      <Pause className="w-4 h-4" />
                      PROJECT CURRENTLY PAUSED (SLA CLOCK FROZEN)
                    </span>
                    {activeProject.pausedAt && (
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                        Since: {activeProject.pausedAt}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Overdue penalties and KPI timers are currently frozen. Reason: <b>{activeProject.pauseReason || 'Operational hold requested by PM.'}</b>
                    {activeProject.totalPausedDays ? ` • Total accumulated pause duration: ${activeProject.totalPausedDays} days.` : ''}
                  </p>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                    Resuming will automatically advance remaining task deadlines forward by elapsed pause days.
                  </p>
                </div>
              )}

              {/* PERA Regulatory Decision Gate Route Selector */}
              {activeProject.projectType === 'PERA_EIA_ROUTE' && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                        PERA Decision Gate
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                      {activeProject.selectedRoute ? activeProject.selectedRoute.replace(/_/g, ' ') : 'DECISION PENDING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                    Preliminary Environmental Risk Assessment screening determines whether the activity qualifies for immediate PERA Approval (Route 1) or requires a detailed multi-disciplinary EIA (Route 2).
                  </p>
                  {isCurrentProjectPM && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => { selectDecisionRoute(activeProject.id, 'ROUTE_1_PERA'); haptics.success(); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          activeProject.selectedRoute === 'ROUTE_1_PERA'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Route 1: Low Risk → Apply for PERA Approval
                      </button>
                      <button
                        onClick={() => { selectDecisionRoute(activeProject.id, 'ROUTE_2_DETAILED_EIA'); haptics.success(); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          activeProject.selectedRoute === 'ROUTE_2_DETAILED_EIA'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Route 2: High Risk → Detailed EIA (6 Steps)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Project Meta Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-xs">
                <div>
                  <div className="text-[10px] text-[#86868B]">Contract Value</div>
                  <div className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tnum">
                    ₦{(activeProject.contractValue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#86868B]">Lead PM</div>
                  <div className="font-medium text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{activeProject.leadPmName || activeProject.projectManagerName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#86868B]">Progress</div>
                  <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tnum">{activeProject.progressPercent}%</div>
                </div>
              </div>

              {/* Project Financials Navigation to Finance Module */}
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                      Project Financials, Expenses & Payments
                    </h4>
                    <p className="text-[11px] text-[#86868B]">
                      Direct project expenses, client wire receipts, and P&amp;L governance are managed in the Finance module.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/finance?tab=EXPENSES&projectId=${activeProject.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97] whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                  <span>Open in Finance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Suggested Tasks Staging Dock (Visible to PM & Superadmin) */}
              {isCurrentProjectPM && suggestedTasks.length > 0 && (
                <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                          Suggested Tasks Staging Dock ({suggestedTasks.length})
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Hidden from team members until confirmed. Review, modify assignees, or activate.
                      </p>
                    </div>
                    <button
                      onClick={() => { confirmAllSuggestedTasks(activeProject.id); haptics.success(); }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-[0.96] flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Confirm All ({suggestedTasks.length})</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {suggestedTasks.map(st => (
                      <div key={st.id} className="p-3 bg-white dark:bg-[#121216] rounded-xl border border-black/[0.06] dark:border-white/[0.08] space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {st.stage && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-black/[0.05] dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded">
                                  {st.stage}
                                </span>
                              )}
                              {st.taskType === 'APPROVAL_GATE' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> SOW/ToR Gate
                                </span>
                              )}
                              {st.taskType === 'REPORT' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 rounded flex items-center gap-0.5">
                                  <FileText className="w-2.5 h-2.5" /> Final Report (Multi-Role)
                                </span>
                              )}
                              {st.taskType === 'DECISION_GATE' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 rounded flex items-center gap-0.5">
                                  <GitBranch className="w-2.5 h-2.5" /> PERA Gate
                                </span>
                              )}
                              {st.isBlockedByGate && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 rounded flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> Field Blocked
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-white">{st.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 flex-wrap">
                              <span>Due: <b className="font-mono tnum text-slate-700 dark:text-slate-300">{st.dueDate}</b></span>
                              <span>•</span>
                              <span>Est: <b className="font-mono tnum text-slate-700 dark:text-slate-300">{st.estimatedHours || 16}h</b></span>
                              <span>•</span>
                              <span>Assignee: <b className="text-slate-700 dark:text-slate-300">{st.assigneeName || 'Unassigned'}</b></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditTaskAndAssignees(st)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.04] rounded-lg cursor-pointer"
                              title="Edit Task & Assignees"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { deleteSuggestedTask(st.id); haptics.selection(); }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { confirmSuggestedTask(st.id); haptics.success(); }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs flex items-center gap-0.5 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Tasks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] uppercase tracking-wider">
                      Active Deliverables & Milestones ({activeTasks.length})
                    </h3>
                  </div>
                  {isCurrentProjectPM && (
                    <button
                      onClick={() => setIsAddDrawerTaskOpen(true)}
                      className="px-2.5 py-1 bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] text-[#1D1D1F] dark:text-[#F6F4F0] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {activeTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#86868B] bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl">
                      {suggestedTasks.length > 0 ? (
                        <span>Review and confirm staged tasks above to activate them for team execution.</span>
                      ) : (
                        <span>No active tasks yet. Click "+ Add Task" to allocate deliverables to staff.</span>
                      )}
                    </div>
                  ) : (
                    activeTasks.map(t => {
                      const isDone = t.status === 'DONE';
                      const isGateBlocked = t.isBlockedByGate;
                      const isAssignee = t.assigneeId === currentUser.id || 
                                         t.assigneeName?.toLowerCase() === currentUser.name?.toLowerCase() ||
                                         Boolean(t.assigneeIds && t.assigneeIds.includes(currentUser.id)) ||
                                         Boolean(t.taskAssignees && t.taskAssignees.some(a => a.userId === currentUser.id || a.userName?.toLowerCase() === currentUser.name?.toLowerCase())) ||
                                         Boolean(activeProject?.teamMemberIds?.includes(currentUser.id));
                      const canEditTask = isCurrentProjectPM || isSuperadmin || isProjectManager;
                      const canUpdateTask = true; // All team members/assignees can update progress (non-PMs capped at 90% per Rule 4)

                      return (
                        <div 
                          key={t.id} 
                          className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2.5 ${
                            isDone 
                              ? 'bg-emerald-500/[0.03] border-emerald-500/20' 
                              : isGateBlocked 
                              ? 'bg-rose-500/[0.02] border-rose-500/20' 
                              : 'bg-white dark:bg-[#121216] border-black/[0.06] dark:border-white/[0.08] shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {t.stage && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-black/[0.05] dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded">
                                    {t.stage}
                                  </span>
                                )}
                                {isAssignee && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-0.5">
                                    <UserCheck className="w-2.5 h-2.5" /> Assigned to You
                                  </span>
                                )}
                                {t.taskType === 'APPROVAL_GATE' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> SOW/ToR Gate
                                  </span>
                                )}
                                {t.taskType === 'REPORT' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 rounded flex items-center gap-0.5">
                                    <FileText className="w-2.5 h-2.5" /> Final Report
                                  </span>
                                )}
                                {t.taskType === 'DECISION_GATE' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 rounded flex items-center gap-0.5">
                                    <GitBranch className="w-2.5 h-2.5" /> PERA Gate
                                  </span>
                                )}
                                {isGateBlocked && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30 rounded flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Blocked by Gate
                                  </span>
                                )}
                              </div>

                              <div className="font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] flex items-center gap-1.5">
                                <span>{t.title}</span>
                              </div>

                              {t.description && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                                  {t.description}
                                </p>
                              )}

                              <div className="text-[10px] text-[#86868B] flex items-center gap-2 flex-wrap">
                                <span>Assignee: <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{t.assigneeName}</b></span>
                                <span>•</span>
                                <span>Due: <b className="font-mono tnum text-[#1D1D1F] dark:text-[#F6F4F0]">{t.dueDate}</b></span>
                                {t.originalDueDate && t.originalDueDate !== t.dueDate && (
                                  <span className="text-amber-600 dark:text-amber-400 font-mono text-[9px]">(Orig: {t.originalDueDate})</span>
                                )}
                                <span>•</span>
                                <span>Logged: <b className="font-mono tnum text-[#1D1D1F] dark:text-[#F6F4F0]">{t.loggedHours || 0}h</b> / {t.estimatedHours || 16}h</span>
                              </div>

                              {/* Multi-role team members if configured */}
                              {t.taskAssignees && t.taskAssignees.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  {t.taskAssignees.map((ra, idx) => (
                                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded text-slate-600 dark:text-slate-400">
                                      <span className="font-semibold text-slate-800 dark:text-slate-200">{ra.role}:</span> {ra.userName}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Progress bar */}
                              <div className="w-full bg-black/[0.06] dark:bg-white/10 rounded-full h-1.5 overflow-hidden mt-1">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${t.progressPercent || 0}%` }}
                                />
                              </div>

                              {isGateBlocked && (
                                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                  🔒 Blocked: Prerequisite SOW / ToR Approval Gate must be completed by PM before field work can begin.
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                t.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                t.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                t.status === 'UNDER_REVIEW' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                'bg-black/[0.05] dark:bg-white/10 text-[#86868B]'
                              }`}>
                                {t.status.replace('_', ' ')} ({t.progressPercent || 0}%)
                              </span>

                              {/* Actions on Active Task */}
                              <div className="flex items-center gap-1 pt-1">
                                {canUpdateTask && !isDone && !isGateBlocked && (
                                  <button
                                    onClick={() => handleOpenUpdateTask(t)}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-xs active:scale-[0.96] flex items-center gap-1 cursor-pointer"
                                    title="Update progress, log hours, or submit for PM sign-off"
                                  >
                                    <Sliders className="w-3 h-3" />
                                    <span>Update</span>
                                  </button>
                                )}

                                {canEditTask && !isDone && (
                                  <button
                                    onClick={() => handleOpenEditTaskAndAssignees(t)}
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
                                    title="Edit task & assignees"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {t.taskType === 'APPROVAL_GATE' && isCurrentProjectPM && !isDone && (
                                  <button
                                    onClick={() => {
                                      updateTaskProgress(t.id, 100, 'DONE', t.loggedHours, {
                                        completedById: currentUser.id,
                                        completedByName: currentUser.name,
                                        completionNotes: 'SOW / ToR regulatory client approval granted. Field data gathering unblocked.'
                                      });
                                      haptics.success();
                                    }}
                                    className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold shadow-xs active:scale-[0.96] flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Unlock className="w-2.5 h-2.5" />
                                    <span>Sign Gate</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleOpenDueDateModal(t)}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                  title="Request Due-Date Change"
                                >
                                  <CalendarClock className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Due Date Change Requests Panel */}
              {activeProjectDateRequests.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.08] rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Due-Date Change Requests ({activeProjectDateRequests.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {activeProjectDateRequests.map(req => (
                      <div key={req.id} className="p-3 bg-white dark:bg-[#121216] rounded-xl border border-black/[0.05] dark:border-white/[0.08] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">{req.taskTitle}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                            req.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' :
                            'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Timeline Shift: <b className="font-mono text-slate-700 dark:text-slate-300">{req.oldDate}</b> → <b className="font-mono text-indigo-600 dark:text-indigo-400">{req.newDate}</b>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 italic">
                          "{req.reason}"
                        </p>
                        {req.status === 'PENDING' && isProjectManager && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => { approveDueDateChange(req.id); haptics.success(); }}
                              className="px-2.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Approve Shift
                            </button>
                            <button
                              onClick={() => { rejectDueDateChange(req.id, 'Timeline shift declined by leadership.'); haptics.selection(); }}
                              className="px-2.5 py-0.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KPI Discretionary Bonuses Awarded Ledger */}
              {activeProjectBonuses.length > 0 && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                      PM Discretionary Bonus Ledger ({activeProjectBonuses.length})
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    {activeProjectBonuses.map(b => (
                      <div key={b.id} className="p-2.5 bg-white dark:bg-[#121216] rounded-xl border border-emerald-500/20 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{b.userName}</span>
                          <span className="text-[10px] text-slate-400 ml-2">by {b.awardedByName}</span>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 italic mt-0.5">"{b.note}"</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tnum whitespace-nowrap">
                          +{b.points} KPI pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workstreams & Milestones */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] uppercase tracking-wider">
                  Disciplinary Workstreams & Milestones
                </h3>
                {(activeProject.workstreams || []).map((ws) => (
                  <div key={ws.id} className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">
                      <span>{ws.serviceLine}</span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 tnum">{ws.progressPercent}%</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {(ws.milestones || []).map(m => (
                        <div key={m.id} className="flex items-center justify-between text-[11px] text-[#86868B]">
                          <span>{m.name}</span>
                          <span className="font-mono tnum">{m.targetDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pause Project Modal */}
      <AnimatePresence>
        {isPauseModalOpen && activeProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPauseModalOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <Pause className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Pause Project: {activeProject.projectCode}</h3>
                </div>
                <button onClick={() => setIsPauseModalOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleConfirmPause} className="space-y-3">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pausing freezes delivery clocks and overdue penalties. When the project is resumed, remaining task due dates will automatically advance forward by the duration of the pause.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Mandatory Reason for Pause *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={pauseReasonInput}
                    onChange={(e) => setPauseReasonInput(e.target.value)}
                    placeholder="e.g. Host community access restriction / Weather hold / Client regulatory scope amendment."
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsPauseModalOpen(false)} className="px-3 py-1.5 text-[#86868B]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold cursor-pointer">
                    Freeze Project & Deadlines
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discretionary Bonus Modal (Rule 8) */}
      <AnimatePresence>
        {isBonusModalOpen && activeProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBonusModalOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Award PM Discretionary Bonus</h3>
                </div>
                <button onClick={() => setIsBonusModalOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleConfirmBonus} className="space-y-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/40 text-[10px] text-indigo-900 dark:text-indigo-300">
                  PMs can award up to <b>10 bonus points</b> per award to recognize exceptional execution, adverse condition turnaround, or teamwork.
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Recipient *</label>
                  <select
                    value={bonusRecipientId}
                    onChange={(e) => setBonusRecipientId(e.target.value)}
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} — {u.jobTitle} ({u.departmentName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Bonus Points (Max 10) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(Math.min(10, Math.max(1, Number(e.target.value))))}
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono tnum text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Mandatory Justification Note *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={bonusNote}
                    onChange={(e) => setBonusNote(e.target.value)}
                    placeholder="e.g. Exceptional leadership during community stakeholder townhall under tight deadline."
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsBonusModalOpen(false)} className="px-3 py-1.5 text-[#86868B]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer">
                    Award +{bonusPoints} KPI Points
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Due Date Extension Request Modal */}
      <AnimatePresence>
        {isDueDateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDueDateModalOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Request Due-Date Change</h3>
                </div>
                <button onClick={() => setIsDueDateModalOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleConfirmDueDateRequest} className="space-y-3">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Due-date changes require line manager or admin approval. Original due dates remain preserved for audit and performance metrics.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">New Proposed Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDateNewDate}
                    onChange={(e) => setDueDateNewDate(e.target.value)}
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Mandatory Reason for Extension *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={dueDateReason}
                    onChange={(e) => setDueDateReason(e.target.value)}
                    placeholder="e.g. Inclement marine weather delayed vibrocore sampling by 4 days."
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsDueDateModalOpen(false)} className="px-3 py-1.5 text-[#86868B]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-semibold cursor-pointer">
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update Project Task Modal (For Assignees & PMs) */}
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
                    <span className="font-semibold text-slate-900 dark:text-white">{updatingTask.stage || 'General Deliverable'}</span>
                    <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Due: {updatingTask.dueDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Assigned to: <b className="text-slate-800 dark:text-slate-200">{updatingTask.assigneeName}</b> • Current Progress: <b className="text-indigo-600 dark:text-indigo-400 font-mono">{updatingTask.progressPercent || 0}%</b>
                  </div>
                </div>

                {/* Core Rule 4 Notice if Non-PM */}
                {!isCurrentProjectPM && (
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
                    max={isCurrentProjectPM ? 100 : 90}
                    step={5}
                    value={updateProgressVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setUpdateProgressVal(val);
                      if (val === 0) setUpdateStatusVal('NOT_STARTED');
                      else if (val >= 100 && isCurrentProjectPM) setUpdateStatusVal('DONE');
                      else if (val >= 90 && !isCurrentProjectPM) setUpdateStatusVal('UNDER_REVIEW');
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
                    {isCurrentProjectPM && (
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
                      {isCurrentProjectPM && <option value="DONE">Completed (100% Signed Off)</option>}
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
                    placeholder="e.g. Field sampling finished at Escravos BH-02. Transferred cores to geotechnical lab."
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                {/* PM Completion Notes (if marking complete) */}
                {isCurrentProjectPM && (updateProgressVal === 100 || updateStatusVal === 'DONE') && (
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

      {/* Edit Task & Assignees Modal (For Active & Suggested Tasks) */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingTask(null)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
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

      {/* Inline Drawer Task Creator Modal */}
      <AnimatePresence>
        {isAddDrawerTaskOpen && activeProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddDrawerTaskOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Add Task to {activeProject.projectCode}</h3>
                  <p className="text-[11px] text-[#86868B]">Assigns task directly to an employee with pre-approval authority.</p>
                </div>
                <button onClick={() => setIsAddDrawerTaskOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleAddDrawerTask} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={drawerTaskTitle}
                    onChange={(e) => setDrawerTaskTitle(e.target.value)}
                    placeholder="e.g. Conduct geotechnical borehole SPT testing"
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Assign To Employee *</label>
                  <select
                    value={drawerTaskAssigneeId}
                    onChange={(e) => setDrawerTaskAssigneeId(e.target.value)}
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} — {u.jobTitle} ({u.departmentName})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={drawerTaskDueDate}
                      onChange={(e) => setDrawerTaskDueDate(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Priority</label>
                    <select
                      value={drawerTaskPriority}
                      onChange={(e: any) => setDrawerTaskPriority(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High Priority</option>
                      <option value="CRITICAL">Critical SLA</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsAddDrawerTaskOpen(false)} className="px-3 py-1.5 text-[#86868B] font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold shadow-xs active:scale-[0.96]">Assign Task to Employee</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI PRD / TOR Scope Parser Wizard Modal */}
      <AnimatePresence>
        {isAiParserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAiParserOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-xl w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-5 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">AI PRD / TOR Scope & Timeline Parser</h3>
                    <div className="text-[10px] text-[#86868B]">Automated Deliverables & Gantt Generation</div>
                  </div>
                </div>
                <button onClick={() => setIsAiParserOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              {/* Step 1: Upload */}
              {aiParsingStep === 'UPLOAD' && (
                <div className="space-y-4">
                  <p className="text-[11px] text-[#86868B]">
                    Upload a client Terms of Reference (TOR), RFP scope, or Project Requirements Document (PDF or Word .docx). The AI engine will extract multi-disciplinary service lines, required deliverables, timelines, and regulatory touchpoints.
                  </p>

                  <div className="border-2 border-dashed border-black/[0.1] dark:border-white/[0.15] hover:border-emerald-500 rounded-2xl p-8 text-center space-y-3 bg-black/[0.01] dark:bg-white/[0.02] transition-colors">
                    <UploadCloud className="w-10 h-10 text-[#86868B] mx-auto" />
                    <div>
                      <div className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0]">Drop client PRD / TOR document here</div>
                      <div className="text-[10px] text-[#86868B] mt-0.5">Supports PDF (.pdf), Microsoft Word (.docx) up to 50MB</div>
                    </div>

                    <div className="inline-block px-3 py-1 bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-[10px] font-mono text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs">
                      {uploadedDocName}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAiParserOpen(false)} className="px-3 py-1.5 text-[#86868B] font-medium">Cancel</button>
                    <button
                      type="button"
                      onClick={handleSimulateAiParse}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs active:scale-[0.96] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Parse Document with Gemini</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Parsing Spinner */}
              {aiParsingStep === 'PARSING' && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0]">Analyzing Document & Extracting Deliverables...</div>
                  <div className="text-[10px] text-[#86868B]">Classifying service lines, milestones, and FMEnv/NESREA regulatory requirements</div>
                </div>
              )}

              {/* Step 3: Interactive PM Review Wizard */}
              {aiParsingStep === 'PREVIEW' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300 text-[11px] space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Scope Successfully Extracted
                    </div>
                    <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80">
                      Identified 3 parallel workstreams (Geotechnical + Metocean + GIS) and 9 deliverable milestones.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <button type="button" onClick={() => setIsAiParserOpen(false)} className="px-3 py-1.5 text-[#86868B] font-medium">Cancel</button>
                    <button
                      type="button"
                      onClick={handleCommitAiProject}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs active:scale-[0.96] cursor-pointer"
                    >
                      Commit & Initialize Project
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Entity Modal */}
      <EditProjectModal
        isOpen={isEditProjectOpen}
        project={activeProject}
        onClose={() => setIsEditProjectOpen(false)}
      />
    </div>
  );
}
