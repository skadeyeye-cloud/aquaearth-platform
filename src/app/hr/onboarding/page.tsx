'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  CandidateApplication, 
  InterviewStage, 
  InterviewNote, 
  CandidateDocument
} from '@/lib/types';
import { 
  UserCheck, 
  Plus, 
  FileText, 
  UploadCloud, 
  FolderCheck, 
  Star, 
  ChevronRight, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  UserPlus, 
  HardDrive,
  Download,
  Building2,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

const STAGES: { id: InterviewStage; label: string; stepNumber: number; color: string }[] = [
  { id: 'PROSPECTIVE', label: 'Prospective Employee', stepNumber: 1, color: 'border-slate-300' },
  { id: 'INTERVIEW_1', label: 'Interview 1 (Screening)', stepNumber: 2, color: 'border-blue-400' },
  { id: 'INTERVIEW_2', label: 'Interview 2 (Technical)', stepNumber: 3, color: 'border-purple-400' },
  { id: 'INTERVIEW_3', label: 'Interview 3 (Executive)', stepNumber: 4, color: 'border-amber-400' },
  { id: 'PROBATIONARY', label: 'Probationary Offer', stepNumber: 5, color: 'border-emerald-400' },
  { id: 'FULL_EMPLOYMENT', label: 'Full Employment', stepNumber: 6, color: 'border-emerald-600' },
  { id: 'NON_EMPLOYMENT', label: 'Non-Employment', stepNumber: 7, color: 'border-rose-400' },
];

export default function OnboardingPipelinePage() {
  const { 
    candidateApplications, 
    advanceCandidateStage, 
    convertCandidateToEmployee,
    currentUser,
    allUsers
  } = useAuth();

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [filterStage, setFilterStage] = useState<'ALL' | InterviewStage>('ALL');
  const [isNewCandidateOpen, setIsNewCandidateOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  // New Candidate Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [appliedRole, setAppliedRole] = useState('Senior Marine Geochemist');
  const [department, setDepartment] = useState('Environmental Studies');
  const [yearsExperience, setYearsExperience] = useState(6);
  const [expectedSalaryNgn, setExpectedSalaryNgn] = useState(750000);

  // Advance Stage Form State
  const [targetStage, setTargetStage] = useState<InterviewStage>('INTERVIEW_1');
  const [rating, setRating] = useState(4);
  const [technicalAssessment, setTechnicalAssessment] = useState('');
  const [cultureAssessment, setCultureAssessment] = useState('');
  const [interviewerComments, setInterviewerComments] = useState('');
  const [recommendation, setRecommendation] = useState<'ADVANCE' | 'HOLD' | 'REJECT' | 'OFFER_PROBATION' | 'OFFER_FULL'>('ADVANCE');
  const [uploadDocTitle, setUploadDocTitle] = useState('');

  const activeCandidates = candidateApplications.filter(c => {
    if (filterStage === 'ALL') return true;
    return c.currentStage === filterStage;
  });

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    haptics.impact();
    const count = candidateApplications.length + 1;
    const candNum = `CAN-2026-${String(count).padStart(3, '0')}`;

    const newCand: CandidateApplication = {
      id: `cand-${Date.now()}`,
      candidateNumber: candNum,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      appliedRole: appliedRole.trim(),
      department: department.trim(),
      currentStage: 'PROSPECTIVE',
      yearsExperience: Number(yearsExperience),
      expectedSalaryNgn: Number(expectedSalaryNgn),
      vaultFolderId: `vault-can-${candNum.toLowerCase()}`,
      notes: [],
      documents: [
        {
          id: `cdoc-${Date.now()}`,
          title: 'Curriculum Vitae & Research Publications.pdf',
          stage: 'PROSPECTIVE',
          fileType: 'PDF Document',
          fileSizeMb: 3.4,
          uploadedAt: new Date().toISOString().split('T')[0],
          downloadUrl: '/vault/candidates/cv.pdf'
        }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };

    candidateApplications.unshift(newCand);
    haptics.success();
    setIsNewCandidateOpen(false);
    setFullName('');
    setEmail('');
  };

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    haptics.impact();

    const notePayload: Omit<InterviewNote, 'stage'> = {
      interviewerId: currentUser.id,
      interviewerName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      rating,
      technicalCompetency: technicalAssessment || 'Demonstrates strong technical fundamentals.',
      culturalFit: cultureAssessment || 'Aligned with AquaEarth precision culture.',
      recommendation,
      comments: interviewerComments || 'Candidate evaluated positively for advancement.'
    };

    const docPayload = uploadDocTitle ? {
      title: uploadDocTitle,
      fileType: 'Evaluation Docket PDF',
      fileSizeMb: 2.1,
      downloadUrl: '/vault/candidates/stage-doc.pdf'
    } : undefined;

    advanceCandidateStage(selectedCandidate.id, targetStage, notePayload, docPayload);

    // Refresh selected candidate reference
    const updated = candidateApplications.find(c => c.id === selectedCandidate.id);
    if (updated) setSelectedCandidate(updated);

    haptics.success();
    setIsAdvanceModalOpen(false);
    setTechnicalAssessment('');
    setCultureAssessment('');
    setInterviewerComments('');
    setUploadDocTitle('');
  };

  const handleConvertEmployee = (candidate: CandidateApplication) => {
    const confirmConvert = confirm(`Are you sure you want to convert ${candidate.fullName} into an active employee in allUsers? This will provision system access credentials, bind their candidate Vault dossier, and create an active payroll docket.`);
    if (!confirmConvert) return;

    haptics.impact();
    const newUserId = convertCandidateToEmployee(candidate.id, 'FIELD_STAFF');
    haptics.success();
    alert(`🎉 Success! ${candidate.fullName} is now an active AquaEarth employee (Staff ID: ${newUserId}). Baseline payroll and staff directory records have been initialized.`);
    const updated = candidateApplications.find(c => c.id === candidate.id);
    if (updated) setSelectedCandidate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 9B • Recruitment Funnel & Candidate Dossiers
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Recruitment & Onboarding Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            End-to-end recruitment funnel: Multi-stage interviews, notes carry-forward, candidate Vault dossier auto-binding, and 1-click active staff conversion.
          </p>
        </div>

        <button
          onClick={() => { setIsNewCandidateOpen(true); haptics.selection(); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register Candidate</span>
        </button>
      </div>

      {/* Pipeline Stage Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => { setFilterStage('ALL'); haptics.selection(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterStage === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          All Candidates ({candidateApplications.length})
        </button>

        {STAGES.map((st) => {
          const count = candidateApplications.filter(c => c.currentStage === st.id).length;
          return (
            <button
              key={st.id}
              onClick={() => { setFilterStage(st.id); haptics.selection(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterStage === st.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>{st.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStage === st.id ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Candidate List & Detailed Dossier Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate Cards */}
        <div className="lg:col-span-5 space-y-3">
          {activeCandidates.length === 0 ? (
            <div className="p-8 text-center text-slate-400 apple-glass-card rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No candidates in this recruitment stage</p>
            </div>
          ) : (
            activeCandidates.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              const isHired = cand.currentStage === 'FULL_EMPLOYMENT';

              return (
                <div
                  key={cand.id}
                  onClick={() => {
                    setSelectedCandidate(cand);
                    haptics.selection();
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] space-y-2.5 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {cand.candidateNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {cand.currentStage.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cand.fullName}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{cand.appliedRole} • {cand.department}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <span>{cand.yearsExperience}y exp • ₦{(cand.expectedSalaryNgn || 0).toLocaleString()}/mo</span>
                    <span className="flex items-center gap-1 text-slate-500 font-semibold">
                      <FileText className="w-3 h-3" />
                      {cand.documents.length} docs
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Candidate Dossier & Actions */}
        <div className="lg:col-span-7">
          {selectedCandidate ? (
            <div className="apple-glass-card rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedCandidate.candidateNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Current Stage: {selectedCandidate.currentStage.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {selectedCandidate.fullName}
                  </h2>
                  <p className="text-xs text-slate-500">Applied for {selectedCandidate.appliedRole} ({selectedCandidate.department})</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedCandidate.currentStage !== 'FULL_EMPLOYMENT' && selectedCandidate.currentStage !== 'NON_EMPLOYMENT' && (
                    <button
                      onClick={() => { setIsAdvanceModalOpen(true); haptics.selection(); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Advance Stage</span>
                    </button>
                  )}

                  {selectedCandidate.currentStage !== 'FULL_EMPLOYMENT' ? (
                    <button
                      onClick={() => handleConvertEmployee(selectedCandidate)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Convert to Employee</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Full Employee</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Vault Candidate Dossier Linking Banner */}
              <div className="p-3.5 rounded-2xl border border-blue-200/70 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-300">
                  <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    Linked Sovereign Vault Folder: <strong className="font-mono font-bold">{selectedCandidate.vaultFolderId || 'vault-candidates-root'}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  Auto-Bound
                </span>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{selectedCandidate.email}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Phone Number</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{selectedCandidate.phone}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Years Experience</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{selectedCandidate.yearsExperience} Years</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Expected Salary</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">₦{(selectedCandidate.expectedSalaryNgn || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Documents at Every Stage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Dossier Documents ({selectedCandidate.documents.length})
                  </h4>
                  <span className="text-[10px] text-slate-400">Uploaded across interview stages</span>
                </div>

                <div className="space-y-2">
                  {selectedCandidate.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{doc.title}</div>
                          <div className="text-[10px] text-slate-400">
                            Stage: <span className="font-semibold text-slate-600 dark:text-slate-300">{doc.stage}</span> • {doc.fileType} ({doc.fileSizeMb} MB) • Uploaded {doc.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <a
                        href={doc.downloadUrl}
                        download
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Notes Carry-Forward Across Stages */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Interview History & Cumulative Notes ({selectedCandidate.notes.length})
                  </h4>
                  <span className="text-[10px] text-slate-400">Carried forward automatically</span>
                </div>

                {selectedCandidate.notes.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    No stage interview assessments recorded yet. Click "Advance Stage" to record the first evaluation note.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCandidate.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {note.stage.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              By {note.interviewerName} on {note.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: note.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                          <div>
                            <strong className="text-slate-800 dark:text-slate-200">Technical Competency:</strong> {note.technicalCompetency}
                          </div>
                          <div>
                            <strong className="text-slate-800 dark:text-slate-200">Cultural Alignment:</strong> {note.culturalFit}
                          </div>
                        </div>

                        <div className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed italic border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5">
                          "{note.comments}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 apple-glass-card rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              <UserCheck className="w-10 h-10 mb-3 opacity-30" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Select a Candidate</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Click any candidate on the left to inspect their dossier, view historical interview evaluations, attach documents, or convert them into an active employee.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advance Stage Modal */}
      <AnimatePresence>
        {isAdvanceModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Advance Candidate: {selectedCandidate.fullName}
                </h3>
                <button onClick={() => setIsAdvanceModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">&times;</button>
              </div>

              <form onSubmit={handleAdvanceSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Next Pipeline Stage</label>
                  <select
                    value={targetStage}
                    onChange={e => setTargetStage(e.target.value as InterviewStage)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="INTERVIEW_1">Interview 1 (Screening Assessment)</option>
                    <option value="INTERVIEW_2">Interview 2 (Technical & Case Study)</option>
                    <option value="INTERVIEW_3">Interview 3 (Executive / Culture Fit)</option>
                    <option value="PROBATIONARY">Probationary Employment Offer</option>
                    <option value="FULL_EMPLOYMENT">Full Employment (Convert to Staff)</option>
                    <option value="NON_EMPLOYMENT">Non-Employment / Regret</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Rating (1 - 5 Stars)</label>
                    <select
                      value={rating}
                      onChange={e => setRating(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - Strong Competency)</option>
                      <option value={3}>⭐⭐⭐ (3 - Acceptable / Meets Standard)</option>
                      <option value={2}>⭐⭐ (2 - Significant Gaps)</option>
                      <option value={1}>⭐ (1 - Unqualified)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Interviewer Recommendation</label>
                    <select
                      value={recommendation}
                      onChange={e => setRecommendation(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    >
                      <option value="ADVANCE">Advance to Next Round</option>
                      <option value="HOLD">Hold for Comparative Review</option>
                      <option value="OFFER_PROBATION">Recommend Probationary Offer</option>
                      <option value="OFFER_FULL">Recommend Full Employment</option>
                      <option value="REJECT">Decline Application</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Technical Competency Assessment</label>
                  <input
                    type="text"
                    value={technicalAssessment}
                    onChange={e => setTechnicalAssessment(e.target.value)}
                    placeholder="e.g. Mastered bathymetric soundings, QGIS data modeling, and EIA reporting"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Cultural & Interpersonal Alignment</label>
                  <input
                    type="text"
                    value={cultureAssessment}
                    onChange={e => setCultureAssessment(e.target.value)}
                    placeholder="e.g. High rigor, strong team communication, field resilience"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Interviewer Notes & Next Round Focus</label>
                  <textarea
                    rows={3}
                    value={interviewerComments}
                    onChange={e => setInterviewerComments(e.target.value)}
                    placeholder="Notes will be preserved and carried forward automatically to subsequent interviewers..."
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Attach Document at this Stage (Optional)</label>
                  <input
                    type="text"
                    value={uploadDocTitle}
                    onChange={e => setUploadDocTitle(e.target.value)}
                    placeholder="e.g. Candidate_Technical_Assessment_Case_Submission.pdf"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => setIsAdvanceModalOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs active:scale-95">Save & Advance Candidate</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Candidate Modal */}
      <AnimatePresence>
        {isNewCandidateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register Prospective Candidate</h3>
                <button onClick={() => setIsNewCandidateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">&times;</button>
              </div>

              <form onSubmit={handleCreateCandidate} className="space-y-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Engr. Zainab Ibrahim"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="candidate@email.com"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Applied Role</label>
                    <input
                      type="text"
                      required
                      value={appliedRole}
                      onChange={e => setAppliedRole(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Department</label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    >
                      <option value="Environmental Studies">Environmental Studies</option>
                      <option value="Geotechnical & Engineering">Geotechnical & Engineering</option>
                      <option value="Business Development">Business Development</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="IT & Design Systems">IT & Design Systems</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Years of Experience</label>
                    <input
                      type="number"
                      value={yearsExperience}
                      onChange={e => setYearsExperience(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Expected Monthly Salary (₦)</label>
                    <input
                      type="number"
                      value={expectedSalaryNgn}
                      onChange={e => setExpectedSalaryNgn(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => setIsNewCandidateOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs active:scale-95">Add to Funnel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
