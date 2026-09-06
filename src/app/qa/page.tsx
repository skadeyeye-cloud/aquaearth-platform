'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  MessageSquare, 
  UserCheck, 
  FileText, 
  Award, 
  Download, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Send
} from 'lucide-react';
import { QaReviewItem, QaReviewStage } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresence } from '@/lib/presence-context';

export default function QaReviewPage() {
  const { qaReviews, currentUser, advanceQaReview } = useAuth();
  const { getColleaguesInModule } = usePresence();
  const activeColleagues = getColleaguesInModule('/qa');
  const [selectedQa, setSelectedQa] = useState<QaReviewItem | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [certificateQa, setCertificateQa] = useState<QaReviewItem | null>(null);

  // Review Action Form
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewComment, setReviewComment] = useState('');

  const activeReviews = qaReviews.filter(q => q.stage !== 'APPROVED_RELEASED');
  const releasedReviews = qaReviews.filter(q => q.stage === 'APPROVED_RELEASED');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQa || !reviewComment.trim()) return;

    advanceQaReview(selectedQa.id, actionType, reviewComment);
    setSelectedQa(null);
    setReviewComment('');
  };

  const handleViewCertificate = (qa: QaReviewItem) => {
    setCertificateQa(qa);
    setIsCertificateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 7 • Technical QA/QC Review & Hard Release Gate
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            QA Review Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Rigorous 4-stage scientific sign-off chains, 48h SLA turnaround tracking, and tamper-evident release certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Hard Release Gate Active
          </span>
        </div>
      </div>

      {/* Live Multiplayer Reviewer Presence Banner */}
      {activeColleagues.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 px-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <img
                src={activeColleagues[0].avatar}
                alt={activeColleagues[0].name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-400"
              />
              <span className="font-bold text-indigo-950 dark:text-indigo-100">{activeColleagues[0].name}</span>
              <span className="text-[11px] opacity-80">({activeColleagues[0].jobTitle})</span>
              <span>is actively in this QA gate.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 font-bold">48h SLA Active</span>
            <span>{activeColleagues[0].location}</span>
          </div>
        </div>
      )}

      {/* SLA & Review Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Under Review</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">{activeReviews.length} Deliverables</div>
          <div className="text-[10px] text-slate-500 font-medium">Locked pending sign-off</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">SLA Performance</div>
          <div className="text-xl font-extrabold text-emerald-600 tnum">100% On-Time</div>
          <div className="text-[10px] text-slate-500 font-medium">48h target turnaround SLA</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Leadership Sign-Offs</div>
          <div className="text-xl font-extrabold text-purple-600 tnum">
            {qaReviews.filter(q => q.managingConsultantSigned).length} Approved
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Managing Consultant verified</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">QA KPI Points</div>
          <div className="text-xl font-extrabold text-amber-600 tnum">+25 pts / Release</div>
          <div className="text-[10px] text-slate-500 font-medium">Automated M13 engine reward</div>
        </div>
      </div>

      {/* Active Review Chains */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Active Technical Review Chains</h2>

        <div className="space-y-3">
          {activeReviews.map((qa) => (
            <motion.div
              layout
              key={qa.id}
              className="apple-glass-card rounded-3xl p-5 space-y-4 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-600 whitespace-nowrap shrink-0">{qa.projectCode}</span>
                    <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap shrink-0">
                      Current: {qa.stage.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {qa.slaDeadline}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{qa.documentTitle}</h3>
                  <div className="text-[11px] text-slate-500">
                    Lead Author: <b>{qa.authorName}</b> • Peer Reviewer: <b>{qa.peerReviewerName}</b> • QA Lead: <b>{qa.qaLeadName}</b>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedQa(qa)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Review & Advance</span>
                  </button>
                </div>
              </div>

              {/* 4-Stage Visual Stepper */}
              <div className="p-3 bg-slate-50/70 rounded-2xl border border-black/[0.04] overflow-x-auto">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] min-w-[500px]">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold border border-emerald-200 flex items-center justify-center gap-1 whitespace-nowrap shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    1. Author Submitted
                  </div>

                  <div className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                    qa.stage === 'PEER_REVIEW' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs' :
                    (qa.stage === 'QA_LEAD_REVIEW' || qa.stage === 'LEADERSHIP_SIGNOFF' || qa.stage === 'APPROVED_RELEASED') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {qa.stage === 'PEER_REVIEW' ? <Clock className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3" />}
                    2. Peer Review
                  </div>

                  <div className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                    qa.stage === 'QA_LEAD_REVIEW' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs' :
                    (qa.stage === 'LEADERSHIP_SIGNOFF' || qa.stage === 'APPROVED_RELEASED') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {qa.stage === 'QA_LEAD_REVIEW' ? <Clock className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3" />}
                    3. QA Lead Review
                  </div>

                  <div className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                    qa.stage === 'LEADERSHIP_SIGNOFF' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs' :
                    qa.stage === 'APPROVED_RELEASED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {qa.stage === 'LEADERSHIP_SIGNOFF' ? <Clock className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3" />}
                    4. Managing Sign-Off
                  </div>
                </div>
              </div>

              {/* Review Trail */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Audit Trail</div>
                {qa.reviewNotes.map((note, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-black/[0.04] text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-800">{note.author} ({note.role})</span>
                      <span className="text-slate-400 font-mono tnum">{note.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{note.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Released & Certified Deliverables */}
      <div className="space-y-4 pt-4 border-t border-black/[0.05]">
        <h2 className="text-sm font-bold text-slate-900">Released & Certified Deliverables (Hard Gate Passed)</h2>

        <div className="space-y-3">
          {releasedReviews.map((qa) => (
            <div key={qa.id} className="apple-glass-card rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-emerald-700 whitespace-nowrap shrink-0">{qa.projectCode}</span>
                  <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    QA Certified & Released
                  </span>
                </div>
                <h3 className="font-bold text-xs text-slate-900">{qa.documentTitle}</h3>
                <div className="text-[10px] text-slate-400 font-mono">
                  Cert Hash: {qa.tamperProofCertificateHash}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleViewCertificate(qa)}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-all active:scale-[0.96] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>View Cryptographic Cert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Action Modal */}
      <AnimatePresence>
        {selectedQa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQa(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase">Reviewing: {selectedQa.stage.replace(/_/g, ' ')}</span>
                  <h3 className="text-sm font-bold text-slate-900">Technical Peer & QA Sign-Off</h3>
                </div>
                <button onClick={() => setSelectedQa(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <p className="text-[11px] text-slate-500">
                Verify calculations, borehole logs, citations, and compliance with Nigerian statutory guidelines.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Decision</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('APPROVED')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 ${
                        actionType === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' : 'bg-slate-50 text-slate-700 border-black/[0.08]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Advance
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('REJECTED')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 ${
                        actionType === 'REJECTED' ? 'bg-rose-600 text-white border-rose-700 shadow-2xs' : 'bg-slate-50 text-slate-700 border-black/[0.08]'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Request Revision
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Technical Reviewer Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Note any verified data points, laboratory cross-checks, or required amendments..."
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setSelectedQa(null)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Submit Sign-Off</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cryptographic Sign-Off Certificate Modal */}
      <AnimatePresence>
        {isCertificateOpen && certificateQa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCertificateOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] p-8 space-y-6 z-10 text-xs">
              <div className="text-center space-y-1.5 border-b border-black/[0.06] pb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">AquaEarth Advisory & Quality Directorate</div>
                <h2 className="text-base font-extrabold text-slate-900">Certificate of Technical Review & QA Clearance</h2>
                <div className="text-[10px] font-mono text-slate-400">{certificateQa.projectCode}</div>
              </div>

              <div className="space-y-3 text-[11px] text-slate-600">
                <div>This document certifies that the deliverable:</div>
                <div className="p-3 bg-slate-50 rounded-xl border font-bold text-slate-900 text-xs">
                  {certificateQa.documentTitle}
                </div>
                <p>
                  has completed full 4-stage independent peer review, methodology verification, and executive leadership sign-off in accordance with AquaEarth ISO/FMEnv Quality Standards.
                </p>
              </div>

              {/* Hash & Verification Footer */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1 text-[10px] font-mono">
                <div className="text-emerald-400 font-bold">SHA-256 Tamper-Proof Cryptographic Hash</div>
                <div className="break-all opacity-80">{certificateQa.tamperProofCertificateHash}</div>
                <div className="text-[9px] text-slate-400 pt-1">Signed by: Kaine Edike (Managing Consultant) • Stamped in Nigeria Vault</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCertificateOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-semibold active:scale-[0.96]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
