'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePresence } from '@/lib/presence-context';
import { haptics } from '@/lib/haptics';
import { 
  Plus, 
  X, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FolderKanban, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  CheckCheck, 
  UserCheck 
} from 'lucide-react';
import { TaskItem } from '@/lib/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { createTaskForApproval, projects, currentUser, allUsers } = useAuth();
  const { sendPushNotification } = usePresence();

  // Role Scoping Flags
  const isAdmin = currentUser.accessTier === 'SUPERADMIN' || 
                  currentUser.functionalRole === 'SUPERADMIN' || 
                  currentUser.functionalRole === 'MANAGING_CONSULTANT';

  const isManagerOrLead = currentUser.managementTier === 'LINE_MANAGER' || 
                          currentUser.managementTier === 'TEAM_LEAD' || 
                          currentUser.managementTier === 'DEPT_HEAD';

  const canAssignToOthers = isAdmin || isManagerOrLead;

  // Subordinate user groups
  const directReports = allUsers.filter(u => u.managerId === currentUser.id);
  const departmentPeers = allUsers.filter(u => 
    u.departmentName === currentUser.departmentName && 
    u.id !== currentUser.id && 
    u.managerId !== currentUser.id
  );
  const otherStaff = allUsers.filter(u => 
    u.id !== currentUser.id && 
    u.managerId !== currentUser.id && 
    u.departmentName !== currentUser.departmentName
  );

  const AQUAEARTH_DEPARTMENTS = [
    'Geotechnical & Geophysics',
    'Environmental & Social (ESIA)',
    'Geoinformatics & Survey',
    'Quality Assurance (QA/QC)',
    'Commercial & BD',
    'Finance & Accounts',
    'IT & Digital Operations',
    'Human Resources',
    'Project Management & Commercial',
    'Executive Leadership'
  ];

  const [assignmentType, setAssignmentType] = useState<'INDIVIDUAL' | 'MULTIPLE' | 'DEPARTMENT'>('INDIVIDUAL');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([currentUser.id]);
  const [targetDepartment, setTargetDepartment] = useState<string>(currentUser.departmentName || 'Geotechnical & Geophysics');
  const [searchStaff, setSearchStaff] = useState('');
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAssignmentType('INDIVIDUAL');
      setAssigneeId(currentUser.id);
      setSelectedUserIds([currentUser.id]);
      setTargetDepartment(currentUser.departmentName || 'Geotechnical & Geophysics');
      setProjectId('');
    }
  }, [currentUser.id, currentUser.departmentName, isOpen]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleOrigin, setModuleOrigin] = useState<TaskItem['moduleOrigin']>('PROJECT');
  const [priority, setPriority] = useState<TaskItem['priority']>('MEDIUM');
  const [dueDate, setDueDate] = useState('2026-09-18');
  const [estimatedHours, setEstimatedHours] = useState(12);
  const [initialComment, setInitialComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const selectedAssignee = allUsers.find(u => u.id === assigneeId) || currentUser;
  const isSelfAssignment = assignmentType === 'INDIVIDUAL' && assigneeId === currentUser.id;
  const isPreApproved = isAdmin || (isManagerOrLead && !isSelfAssignment);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const proj = projectId ? projects.find(p => p.id === projectId) : undefined;
    const scopeTag = proj ? ` (${proj.title})` : ' (General Operations)';

    let finalAssigneeId = assigneeId;
    let finalAssigneeIds: string[] = [assigneeId];
    let finalAssigneeNames: string[] = [];

    if (assignmentType === 'MULTIPLE') {
      finalAssigneeIds = selectedUserIds.length > 0 ? selectedUserIds : [currentUser.id];
      finalAssigneeId = finalAssigneeIds[0];
      finalAssigneeNames = finalAssigneeIds.map(id => allUsers.find(u => u.id === id)?.name || id);
    } else if (assignmentType === 'DEPARTMENT') {
      const deptMembers = allUsers.filter(u => u.departmentName === targetDepartment);
      finalAssigneeIds = deptMembers.map(u => u.id);
      finalAssigneeId = deptMembers[0]?.id || currentUser.id;
      finalAssigneeNames = deptMembers.map(u => u.name);
    } else {
      finalAssigneeNames = [selectedAssignee.name];
    }

    createTaskForApproval({
      title: title.trim(),
      description: description.trim(),
      moduleOrigin,
      priority,
      dueDate,
      assigneeId: finalAssigneeId,
      assigneeIds: finalAssigneeIds,
      assigneeNames: finalAssigneeNames,
      assignmentType,
      departmentId: allUsers.find(u => u.departmentName === targetDepartment)?.departmentId,
      departmentName: assignmentType === 'DEPARTMENT' ? targetDepartment : undefined,
      projectId: proj?.id,
      projectName: proj?.title,
      estimatedHours: Number(estimatedHours),
      initialComment: initialComment.trim()
    });

    haptics.success();

    // Push notification text
    const targetLabel = assignmentType === 'DEPARTMENT' 
      ? `the ${targetDepartment} department`
      : assignmentType === 'MULTIPLE'
      ? `${finalAssigneeNames.length} team members`
      : selectedAssignee.name;

    if (isPreApproved) {
      sendPushNotification({
        title: 'New Task Assigned',
        body: `${currentUser.name} (${currentUser.jobTitle}) assigned "${title.trim()}"${scopeTag} to ${targetLabel}.`,
        category: 'SYSTEM',
        actorName: currentUser.name,
        actorAvatar: currentUser.avatar,
        targetUrl: '/tasks',
        canQuickApprove: false
      });
    } else {
      sendPushNotification({
        title: 'Task Awaiting Line Manager Sign-Off',
        body: `${currentUser.name} submitted "${title.trim()}"${scopeTag} (${priority} Priority).`,
        category: 'TASK_APPROVAL',
        actorName: currentUser.name,
        actorAvatar: currentUser.avatar,
        targetUrl: '/tasks',
        canQuickApprove: true
      });
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setTitle('');
      setDescription('');
      setInitialComment('');
      setAssigneeId(currentUser.id);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-5 sm:p-6 z-10 text-xs max-h-[78vh] flex flex-col my-auto">
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isAdmin 
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                : isManagerOrLead 
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}>
              {isAdmin ? (
                <Sparkles className="w-4.5 h-4.5" />
              ) : isManagerOrLead ? (
                <UserCheck className="w-4.5 h-4.5" />
              ) : (
                <Plus className="w-4.5 h-4.5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAdmin 
                    ? (isSelfAssignment ? 'Create Executive Task' : 'Assign Task to Officer')
                    : isManagerOrLead 
                      ? (isSelfAssignment ? 'Create Managerial Task' : 'Assign Task to Subordinate')
                      : 'Create Task for Line Manager Approval'}
                </h3>
                {isPreApproved ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0 inline-flex items-center gap-1">
                    ⚡ Pre-Approved
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap shrink-0 inline-flex items-center gap-1">
                    ⏳ Approval Required
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isAdmin 
                  ? 'Executive Authority: Tasks are released directly into workflow with zero approval gates.'
                  : isManagerOrLead 
                    ? 'Supervisor Authority: Assigned tasks to subordinates are pre-authorized for execution.'
                    : 'Routed to your Line Manager for review and KPI weighting.'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {isPreApproved 
                ? (isSelfAssignment ? 'Executive Task Released!' : `Task Assigned to ${selectedAssignee.name}!`)
                : 'Task Submitted for Approval!'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {isPreApproved 
                ? (isSelfAssignment 
                    ? 'Task is authorized and active on your workflow board.' 
                    : `${selectedAssignee.name} has been notified and the task is placed on their active schedule.`)
                : 'Your Line Manager has been notified to review this deliverable.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 overflow-y-auto pr-1 min-h-0 flex-1">
            {/* 3-Way Assignment Mode Selector */}
            {canAssignToOthers && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Delegation & Assignment Scope *</span>
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap shrink-0">
                    {assignmentType === 'DEPARTMENT' 
                      ? `Department: ${targetDepartment}`
                      : assignmentType === 'MULTIPLE' 
                      ? `${selectedUserIds.length} Officers Selected`
                      : (isSelfAssignment ? 'Self-Assignment' : `Assignee: ${selectedAssignee.name}`)}
                  </span>
                </div>

                {/* Scope Switcher Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-black/40 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAssignmentType('INDIVIDUAL')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center ${
                      assignmentType === 'INDIVIDUAL'
                        ? 'bg-white dark:bg-[#1c1c1f] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    👤 Single Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentType('MULTIPLE')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center ${
                      assignmentType === 'MULTIPLE'
                        ? 'bg-white dark:bg-[#1c1c1f] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    👥 Multiple Officers
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentType('DEPARTMENT')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center ${
                      assignmentType === 'DEPARTMENT'
                        ? 'bg-white dark:bg-[#1c1c1f] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🏢 Entire Department
                  </button>
                </div>

                {/* Mode 1: Individual Selection */}
                {assignmentType === 'INDIVIDUAL' && (
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#121216] border border-indigo-500/30 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                  >
                    <option value={currentUser.id}>
                      👤 Assign to Myself ({currentUser.name} • {currentUser.jobTitle})
                    </option>

                    {directReports.length > 0 && (
                      <optgroup label="Supervised Direct Reports (Under Your Command)">
                        {directReports.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — {u.jobTitle} ({u.departmentName})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {departmentPeers.length > 0 && (
                      <optgroup label={`${currentUser.departmentName} Team Members`}>
                        {departmentPeers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — {u.jobTitle}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {isAdmin && otherStaff.length > 0 && (
                      <optgroup label="All Enterprise Personnel (Admin Directory)">
                        {otherStaff.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — {u.jobTitle} ({u.departmentName})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}

                {/* Mode 2: Multiple Officers Selection */}
                {assignmentType === 'MULTIPLE' && (
                  <div className="space-y-2">
                    {/* Selected Badges */}
                    <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-white dark:bg-[#121216] rounded-xl border border-indigo-500/20">
                      {selectedUserIds.length === 0 ? (
                        <span className="text-[10px] text-slate-400">Select officers from list below...</span>
                      ) : (
                        selectedUserIds.map((uid) => {
                          const u = allUsers.find(x => x.id === uid);
                          if (!u) return null;
                          return (
                            <span 
                              key={uid}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-500/30"
                            >
                              <span>{u.name}</span>
                              <button
                                type="button"
                                onClick={() => toggleUserSelection(uid)}
                                className="hover:text-red-500 ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>

                    {/* Quick Staff Search & Toggle List */}
                    <input
                      type="text"
                      value={searchStaff}
                      onChange={(e) => setSearchStaff(e.target.value)}
                      placeholder="Search officers to add..."
                      className="w-full p-2 bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-[11px]"
                    />

                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-white/50 dark:bg-black/20 p-1.5 rounded-xl border border-black/[0.05] dark:border-white/[0.05]">
                      {allUsers
                        .filter(u => !searchStaff || u.name.toLowerCase().includes(searchStaff.toLowerCase()) || u.jobTitle.toLowerCase().includes(searchStaff.toLowerCase()))
                        .map((u) => {
                          const isSelected = selectedUserIds.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              onClick={() => toggleUserSelection(u.id)}
                              className={`p-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-950 dark:text-indigo-200' 
                                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] font-bold ${
                                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                  {isSelected ? '✓' : ''}
                                </span>
                                <div className="truncate">
                                  <span className="font-bold text-[11px]">{u.name}</span>
                                  <span className="text-[10px] text-slate-400 ml-1.5">({u.departmentName})</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">{u.jobTitle}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Mode 3: Entire Department Selection */}
                {assignmentType === 'DEPARTMENT' && (
                  <div className="space-y-2">
                    <select
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-[#121216] border border-indigo-500/30 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                    >
                      {AQUAEARTH_DEPARTMENTS.map((dept) => {
                        const count = allUsers.filter(u => u.departmentName === dept).length;
                        return (
                          <option key={dept} value={dept}>
                            🏢 {dept} ({count} Staff Members)
                          </option>
                        );
                      })}
                    </select>

                    <div className="p-2 bg-indigo-500/10 rounded-xl text-[10px] text-indigo-700 dark:text-indigo-300">
                      All personnel in <b>{targetDepartment}</b> will be assigned this task. Any member can pick up and finalize it.
                    </div>
                  </div>
                )}

                {/* Weighted KPI Impact Preview Policy */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-[10px]">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Weighted Appraisal & KPI Policy</span>
                  </div>
                  {assignmentType === 'DEPARTMENT' ? (
                    <p className="text-[10px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      🏆 <b>Completing Officer</b>: <b>+20 pts</b> on delivery. <br />
                      👥 <b>Department Colleagues</b>: <b>+6 pts each</b> shared success bonus. <br />
                      👔 <b>Dept Head / Manager</b>: <b>+8 pts</b> leadership oversight. <br />
                      ⚠️ <b>Overdue Penalty</b>: <b>-6 pts</b> deducted across all department staff if deadline lapses.
                    </p>
                  ) : assignmentType === 'MULTIPLE' ? (
                    <p className="text-[10px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      👥 <b>Assigned Squad</b>: <b>+15 pts</b> for timely execution (or <b>-12 pts</b> if overdue). <br />
                      👔 <b>Line Manager</b>: <b>+6 pts</b> oversight credit (or <b>-5 pts</b> if overdue).
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      👤 <b>Individual Task</b>: Assignee earns <b>+15 pts</b> on-time (or <b>-12 pts</b> overdue). Line Manager earns <b>+6 pts</b> (or <b>-5 pts</b> overdue).
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Conduct Cone Penetration Test (CPT) on Escravos Site"
                className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Scope / Objective
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify execution criteria, required equipment, and outputs..."
                className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Domain Module
                </label>
                <select
                  value={moduleOrigin}
                  onChange={(e: any) => setModuleOrigin(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
                >
                  <option value="PROJECT">Project Delivery</option>
                  <option value="FIELD">Field Data Capture</option>
                  <option value="QA">QA/QC Technical</option>
                  <option value="IT">IT & Systems</option>
                  <option value="DESIGN">Creative Design</option>
                  <option value="COMPLIANCE">Regulatory Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
                >
                  <option value="URGENT">🔴 Urgent (Immediate)</option>
                  <option value="HIGH">🟠 High Priority</option>
                  <option value="MEDIUM">🔵 Medium</option>
                  <option value="LOW">⚪ Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs tnum focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Associated Project (Optional)
                </label>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {projectId ? '📁 Project Linked' : '🏢 Internal / Operational'}
                </span>
              </div>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none"
              >
                <option value="">🏢 None — General / Internal Operational Task (Non-Project)</option>
                <optgroup label="Active Client & Engineering Projects">
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} • {p.title}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Leave as None for non-project tasks (IT systems, HR & talent, marketing/design, compliance, or general operations).
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Handover / Assignment Note (Optional)
              </label>
              <input
                type="text"
                value={initialComment}
                onChange={(e) => setInitialComment(e.target.value)}
                placeholder={canAssignToOthers && !isSelfAssignment 
                  ? `e.g. Please prioritize core sample retrieval from borehole BH-04.`
                  : "e.g. Field vehicle and GPS rover equipment requested for mobilization."}
                className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                {isPreApproved ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Pre-Approved • Instant Workflow Release
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Auto-routed to Line Manager</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 ${
                    isAdmin 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : isManagerOrLead && !isSelfAssignment
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100'
                  }`}
                >
                  {isAdmin 
                    ? (isSelfAssignment ? 'Release Task (Instant)' : `Assign to ${selectedAssignee.name.split(' ')[0]}`)
                    : isManagerOrLead && !isSelfAssignment 
                      ? `Assign to ${selectedAssignee.name.split(' ')[0]}` 
                      : 'Submit for Approval'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
