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

  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAssigneeId(currentUser.id);
      setProjectId('');
    }
  }, [currentUser.id, isOpen]);
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
  const isSelfAssignment = assigneeId === currentUser.id;
  const isPreApproved = isAdmin || (isManagerOrLead && !isSelfAssignment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const proj = projectId ? projects.find(p => p.id === projectId) : undefined;
    const scopeTag = proj ? ` (${proj.title})` : ' (General Operations)';

    createTaskForApproval({
      title: title.trim(),
      description: description.trim(),
      moduleOrigin,
      priority,
      dueDate,
      assigneeId,
      projectId: proj?.id,
      projectName: proj?.title,
      estimatedHours: Number(estimatedHours),
      initialComment: initialComment.trim()
    });

    haptics.success();

    // Trigger Apple Dynamic Island / Lockscreen Web Push
    if (isPreApproved) {
      if (!isSelfAssignment) {
        sendPushNotification({
          title: 'New Task Assigned to Officer',
          body: `${currentUser.name} (${currentUser.jobTitle}) assigned "${title.trim()}"${scopeTag} to ${selectedAssignee.name}.`,
          category: 'SYSTEM',
          actorName: currentUser.name,
          actorAvatar: currentUser.avatar,
          targetUrl: '/tasks',
          canQuickApprove: false
        });
      } else {
        sendPushNotification({
          title: 'Executive Task Released',
          body: `Task "${title.trim()}"${scopeTag} created with instant approval (No approval required).`,
          category: 'SYSTEM',
          actorName: currentUser.name,
          actorAvatar: currentUser.avatar,
          targetUrl: '/tasks',
          canQuickApprove: false
        });
      }
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
            {/* Assignee Selection Field (For Admins, Team Leads, and Line Managers) */}
            {canAssignToOthers && (
              <div className="p-3 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Assign Task To *</span>
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap shrink-0">
                    {isSelfAssignment ? 'Self-assignment' : `Assigned to: ${selectedAssignee.name}`}
                  </span>
                </div>
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
                <div className="text-[10px] text-indigo-600/80 dark:text-indigo-300/80 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-indigo-500" />
                  <span>
                    {isSelfAssignment 
                      ? (isAdmin ? 'Admins require no approval gates.' : 'Self-assigned task.')
                      : `Tasks assigned to subordinates by leadership are pre-approved.`}
                  </span>
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
