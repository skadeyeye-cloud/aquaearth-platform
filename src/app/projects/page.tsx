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
  Lock
} from 'lucide-react';
import { ProjectRecord, ProjectHealth, ProjectStatus } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectsPage() {
  const { projects, clients, allUsers, createProject, closeOutAndArchiveProject } = useAuth();
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED'>('ALL');
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
  
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 4 • Multi-Disciplinary Project Delivery
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Active Projects & Gantt
          </h1>
          <p className="text-xs text-slate-500">
            Multi-workstream execution (ESIA, Geotech, Metocean, GIS), automated health scoring, and close-out Vault archiving.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI PRD / TOR Scope Parser Button */}
          <button
            onClick={() => setIsAiParserOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI PRD Scope Parser</span>
          </button>
        </div>
      </div>

      {/* RAG Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Portfolio</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">{projects.length} Projects</div>
          <div className="text-[10px] text-slate-500 font-medium">₦{(projects.reduce((acc, curr) => acc + curr.contractValue, 0) / 1000000).toFixed(0)}M Contract Value</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">🟢 On Track</div>
          <div className="text-xl font-extrabold text-emerald-600 tnum">
            {projects.filter(p => p.health === 'ON_TRACK').length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Within target milestone buffer</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">🟡 At Risk</div>
          <div className="text-xl font-extrabold text-amber-600 tnum">
            {projects.filter(p => p.health === 'AT_RISK').length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Weather / field buffer slip</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">50% Cold Archive Tier</div>
          <div className="text-xl font-extrabold text-cyan-600 tnum">
            {projects.filter(p => p.vaultStorageTier === 'COLD_ARCHIVE').length} Archived
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Data compressed in Module 15</div>
        </div>
      </div>

      {/* Health Filter Segmented Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold overflow-x-auto">
          {(['ALL', 'ON_TRACK', 'AT_RISK', 'DELAYED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setHealthFilter(tab)}
              className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] whitespace-nowrap shrink-0 ${
                healthFilter === tab ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Projects' : tab === 'ON_TRACK' ? '🟢 On Track' : tab === 'AT_RISK' ? '🟡 At Risk' : '🔴 Delayed'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono tnum whitespace-nowrap shrink-0">
          Showing {filteredProjects.length} engagement{filteredProjects.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((project) => {
          const isClosedOut = project.status === 'CLOSED_OUT';
          return (
            <motion.div
              layout
              key={project.id}
              className={`apple-glass-card rounded-3xl p-5 transition-all space-y-4 ${
                isClosedOut ? 'opacity-70 bg-slate-50/50' : 'hover:border-black/[0.12] hover:shadow-md'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">{project.projectCode}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full whitespace-nowrap shrink-0 ${
                      project.health === 'ON_TRACK' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      project.health === 'AT_RISK' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {project.health.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">• {project.clientName}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded whitespace-nowrap shrink-0 ${
                      project.vaultStorageTier === 'COLD_ARCHIVE' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {project.vaultStorageTier.replace('_', ' ')} ({project.storageSizeGb} GB)
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{project.title}</h3>
                  
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {project.serviceLines.map((sl, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-100 text-slate-700 font-medium px-2 py-0.2 rounded-md whitespace-nowrap shrink-0">
                        {sl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financials & Action Buttons */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 font-mono tnum whitespace-nowrap shrink-0">
                      {project.currency} {project.contractValue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                      Spent: <b className="text-slate-600 tnum">₦{(project.budgetSpent / 1000000).toFixed(1)}M</b>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>View Gantt & Tracks</span>
                  </button>

                  {!isClosedOut && (
                    <button
                      onClick={() => closeOutAndArchiveProject(project.id)}
                      className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl text-xs font-semibold transition-all active:scale-[0.96] inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                      title="Archive to 50% Cold Archive Tier (Module 15)"
                    >
                      <Archive className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Close-Out</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar & Health Reason */}
              <div className="pt-2 border-t border-black/[0.04] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">{project.healthReason}</span>
                  <span className="font-bold text-slate-900 tnum">{project.progressPercent}% Overall Progress</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      project.health === 'ON_TRACK' ? 'bg-emerald-600' :
                      project.health === 'AT_RISK' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Multi-Workstream Gantt / Milestone Drawer Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-black/[0.08] p-6 space-y-5 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-black/[0.05] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600">{selectedProject.projectCode}</span>
                    <span className="text-[10px] text-slate-400">• Lead PM: <b>{selectedProject.leadPmName}</b></span>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 mt-0.5">{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              {/* Workstream Tracks */}
              <div className="space-y-4">
                {selectedProject.workstreams.map((ws) => (
                  <div key={ws.id} className="p-4 bg-slate-50/80 rounded-2xl border border-black/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-900">{ws.serviceLine} Workstream Track</span>
                        <span className="text-[10px] text-slate-400">• Lead: {ws.leadName}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-slate-700 tnum">{ws.progressPercent}% Track Complete</span>
                    </div>

                    {/* Milestones in this Workstream */}
                    <div className="space-y-2">
                      {ws.milestones.map((m) => (
                        <div key={m.id} className="p-3 bg-white rounded-xl border border-black/[0.04] shadow-2xs flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              m.status === 'COMPLETED' ? 'bg-emerald-500' :
                              m.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-300'
                            }`} />
                            <div>
                              <div className="font-semibold text-slate-900">{m.name}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span className="whitespace-nowrap shrink-0">Target: <b className="text-slate-600 tnum">{m.targetDate}</b></span>
                                {m.isGatePrerequisite && (
                                  <span className="text-purple-700 font-bold inline-flex items-center gap-0.5 whitespace-nowrap shrink-0">
                                    <Lock className="w-2.5 h-2.5" /> Phase Gate
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">{m.deliverablesCount} deliverable{m.deliverablesCount === 1 ? '' : 's'}</span>
                            <span className={`px-2 py-0.2 rounded text-[9px] font-bold whitespace-nowrap shrink-0 ${
                              m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800' :
                              m.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-black/[0.05]">
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

      {/* 🧠 AI PRD / TOR Scope Parser Wizard Modal */}
      <AnimatePresence>
        {isAiParserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAiParserOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-black/[0.08] p-6 space-y-5 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI PRD / TOR Scope & Timeline Parser</h3>
                    <div className="text-[10px] text-slate-400">Automated Deliverables & Gantt Generation</div>
                  </div>
                </div>
                <button onClick={() => setIsAiParserOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              {/* Step 1: Upload */}
              {aiParsingStep === 'UPLOAD' && (
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500">
                    Upload a client Terms of Reference (TOR), RFP scope, or Project Requirements Document (PDF or Word .docx). The AI engine will extract multi-disciplinary service lines, required deliverables, timelines, and regulatory touchpoints.
                  </p>

                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 transition-colors">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                    <div>
                      <div className="font-bold text-xs text-slate-800">Drop client PRD / TOR document here</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Supports PDF (.pdf), Microsoft Word (.docx) up to 50MB</div>
                    </div>

                    <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-mono text-slate-700 shadow-2xs">
                      {uploadedDocName}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAiParserOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                    <button
                      type="button"
                      onClick={handleSimulateAiParse}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs active:scale-[0.96] flex items-center gap-1.5"
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
                  <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="font-bold text-xs text-slate-800">Analyzing Document & Extracting Deliverables...</div>
                  <div className="text-[10px] text-slate-400">Classifying service lines, milestones, and FMEnv/NESREA regulatory requirements</div>
                </div>
              )}

              {/* Step 3: Interactive PM Review Wizard */}
              {aiParsingStep === 'PREVIEW' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Scope Successfully Extracted
                    </div>
                    <p className="text-[10px] text-emerald-800/80">
                      Identified 3 parallel workstreams (Geotechnical + Metocean + GIS) and 9 specific deliverable milestones. Review and fine-tune below before launching:
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Project Title</label>
                      <input type="text" value={parsedTitle} onChange={(e) => setParsedTitle(e.target.value)} className="w-full p-1.5 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-semibold" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Client</label>
                        <input type="text" value={parsedClient} onChange={(e) => setParsedClient(e.target.value)} className="w-full p-1.5 bg-slate-50 border border-black/[0.08] rounded-xl text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Contract Value (₦)</label>
                        <input type="number" value={parsedValue} onChange={(e) => setParsedValue(Number(e.target.value))} className="w-full p-1.5 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono tnum" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Detected Multi-Disciplinary Workstreams</label>
                      <div className="flex flex-wrap gap-1">
                        {parsedServiceLines.map((sl, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 font-semibold rounded-lg text-[10px] border border-black/[0.06]">
                            ✓ {sl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                    <button type="button" onClick={() => setAiParsingStep('UPLOAD')} className="px-3 py-1.5 text-slate-500 font-semibold">Back</button>
                    <button
                      type="button"
                      onClick={handleCommitAiProject}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs active:scale-[0.96] flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Launch Project</span>
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
