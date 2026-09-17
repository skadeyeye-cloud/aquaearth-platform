'use client';

import React, { useState } from 'react';
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
  Users,
  CheckSquare
} from 'lucide-react';
import { ProjectRecord, ProjectHealth, ProjectStatus, TaskItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

export default function ProjectsPage() {
  const { 
    currentUser, 
    projects, 
    clients, 
    allUsers, 
    tasks,
    createProject, 
    createTaskForApproval,
    closeOutAndArchiveProject 
  } = useAuth();

  const [healthFilter, setHealthFilter] = useState<'ALL' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED'>('ALL');
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);

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
  const [newProjClientId, setNewProjClientId] = useState(clients[0]?.id || '');
  const [newProjValue, setNewProjValue] = useState(65000000);
  const [newProjCurrency, setNewProjCurrency] = useState<'NGN' | 'USD' | 'EUR' | 'GBP'>('NGN');
  const [newProjStartDate, setNewProjStartDate] = useState('2026-09-20');
  const [newProjEndDate, setNewProjEndDate] = useState('2026-12-31');
  const [newProjLeadPmId, setNewProjLeadPmId] = useState(allUsers.find(u => u.managementTier === 'LINE_MANAGER')?.id || allUsers[0]?.id || '');
  const [newProjServiceLines, setNewProjServiceLines] = useState<string[]>(['Geotechnical Investigations', 'Environmental & Social (ESIA)']);
  
  // Initial tasks within new project
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
      clientId: newProjClientId,
      clientName: client?.name || 'Direct Client Account',
      serviceLines: newProjServiceLines.length > 0 ? newProjServiceLines : ['Integrated Consulting'],
      contractValue: Number(newProjValue),
      currency: newProjCurrency,
      status: 'ACTIVE',
      health: 'ON_TRACK',
      healthReason: 'Project newly initialized by leadership.',
      startDate: newProjStartDate,
      targetEndDate: newProjEndDate,
      leadPmId: leadPm?.id || currentUser.id,
      leadPmName: leadPm?.name || currentUser.name,
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

    // Create and assign initial tasks
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

    setIsCreateProjectOpen(false);
    setNewProjTitle('');
    setNewProjCode(`PRJ-2026-${Math.floor(100 + Math.random() * 900)}`);
    haptics.success();
  };

  const handleAddDrawerTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !drawerTaskTitle.trim()) return;

    const assignedUser = allUsers.find(u => u.id === drawerTaskAssigneeId) || currentUser;

    createTaskForApproval({
      title: drawerTaskTitle.trim(),
      description: `Assigned task for project: ${selectedProject.title}`,
      moduleOrigin: 'PROJECT',
      priority: drawerTaskPriority,
      dueDate: drawerTaskDueDate,
      assigneeId: assignedUser.id,
      projectId: selectedProject.id,
      projectName: selectedProject.title,
      estimatedHours: Number(drawerTaskHours)
    });

    setIsAddDrawerTaskOpen(false);
    setDrawerTaskTitle('');
    haptics.success();
  };

  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tracking-tight">
            Projects & Milestones
          </h1>
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
          <div className="text-[10px] uppercase font-bold text-[#86868B]">🟡 At Risk</div>
          <div className="text-xl font-semibold text-amber-600 dark:text-amber-400 font-mono tnum">
            {projects.filter(p => p.health === 'AT_RISK').length}
          </div>
          <div className="text-[10px] text-[#86868B] font-medium">Weather / field buffer slip</div>
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

        <span className="text-xs text-[#86868B] font-mono tnum whitespace-nowrap shrink-0">
          Showing {filteredProjects.length} engagement{filteredProjects.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((p) => {
          const isClosedOut = p.status === 'CLOSED_OUT';
          const isArchived = p.vaultStorageTier === 'COLD_ARCHIVE';

          return (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 hover:border-black/[0.12] dark:hover:border-white/[0.15] cursor-pointer transition-all shadow-xs group space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] tnum">
                    {p.projectCode}
                  </span>
                  <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F6F4F0] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {p.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.health === 'ON_TRACK' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    p.health === 'AT_RISK' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {p.health.replace('_', ' ')}
                  </span>
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
                <span>Lead PM: <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{p.leadPmName}</b></span>
                <span>Timeline: <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{p.startDate} → {p.targetEndDate}</b></span>
                <span>Workstreams: <b className="text-emerald-600 dark:text-emerald-400">{p.workstreams?.length || 0} active</b></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateProjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateProjectOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-2xl w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-5 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Initialize New Commercial Project</h3>
                  <p className="text-[11px] text-[#86868B]">Configure project scope, budget, timeline, and assign initial employee tasks.</p>
                </div>
                <button onClick={() => setIsCreateProjectOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleCreateCustomProject} className="space-y-4">
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

                {/* Initial Project Tasks Builder */}
                <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0]">Initial Project Tasks & Employee Assignments</h4>
                      <p className="text-[10px] text-[#86868B]">These tasks will be immediately scheduled, pre-approved, and assigned to team members.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInitialTasks(prev => [...prev, { title: '', assigneeId: allUsers[0]?.id || '', dueDate: newProjEndDate, priority: 'MEDIUM' }])}
                      className="px-2.5 py-1 bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/[0.1] text-[#1D1D1F] dark:text-[#F6F4F0] rounded-lg text-[11px] font-semibold"
                    >
                      + Add Another Task
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

                <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsCreateProjectOpen(false)} className="px-3.5 py-1.5 text-[#86868B] font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold shadow-xs active:scale-[0.96]">Launch Project & Assign Tasks</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Drawer */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-xl h-full bg-white dark:bg-[#0C0C0D] border-l border-black/[0.08] dark:border-white/[0.1] p-6 space-y-6 overflow-y-auto shadow-2xl z-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#86868B]">{selectedProject.projectCode} • Portfolio Record</span>
                  <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">{selectedProject.title}</h2>
                  <p className="text-xs text-[#86868B]">{selectedProject.clientName}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Project Meta Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-xs">
                <div>
                  <div className="text-[10px] text-[#86868B]">Contract Value</div>
                  <div className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tnum">
                    ₦{(selectedProject.contractValue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#86868B]">Lead PM</div>
                  <div className="font-medium text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{selectedProject.leadPmName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#86868B]">Progress</div>
                  <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tnum">{selectedProject.progressPercent}%</div>
                </div>
              </div>

              {/* Tasks in this Project Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] uppercase tracking-wider">
                      Tasks Assigned to Team ({projectTasks.length})
                    </h3>
                  </div>
                  {isProjectManager && (
                    <button
                      onClick={() => setIsAddDrawerTaskOpen(true)}
                      className="px-2.5 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-[11px] font-semibold"
                    >
                      + Add Task
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {projectTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#86868B] bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl">
                      No tasks assigned yet. Click "+ Add Task" to allocate tasks to staff.
                    </div>
                  ) : (
                    projectTasks.map(t => (
                      <div key={t.id} className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{t.title}</div>
                          <div className="text-[10px] text-[#86868B] flex items-center gap-2">
                            <span>Assigned to: <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{t.assigneeName}</b></span>
                            <span>•</span>
                            <span>Due: <b className="font-mono tnum">{t.dueDate}</b></span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                          t.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          t.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                          'bg-black/[0.05] dark:bg-white/10 text-[#86868B]'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Workstreams & Milestones */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] uppercase tracking-wider">
                  Disciplinary Workstreams & Milestones
                </h3>
                {(selectedProject.workstreams || []).map((ws) => (
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
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inline Drawer Task Creator Modal */}
      <AnimatePresence>
        {isAddDrawerTaskOpen && selectedProject && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddDrawerTaskOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-20 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Add Task to {selectedProject.projectCode}</h3>
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
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs active:scale-[0.96] flex items-center gap-1.5"
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
                      Identified 3 parallel workstreams (Geotechnical + Metocean + GIS) and 9 deliverable milestones:
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <button type="button" onClick={() => setIsAiParserOpen(false)} className="px-3 py-1.5 text-[#86868B] font-medium">Cancel</button>
                    <button
                      type="button"
                      onClick={handleCommitAiProject}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs active:scale-[0.96]"
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
    </div>
  );
}
