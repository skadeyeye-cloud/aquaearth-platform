'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Fingerprint
} from 'lucide-react';
import { QaReviewStage } from '@/lib/types';
import { haptics } from '@/lib/haptics';

const STAGE_LABELS: Record<QaReviewStage, string> = {
  AUTHOR_SUBMITTED: 'Author Submitted',
  PEER_REVIEW: 'Peer Review',
  QA_LEAD_REVIEW: 'QA Lead Review',
  LEADERSHIP_SIGNOFF: 'Leadership Sign-Off',
  APPROVED_RELEASED: 'Approved & Released',
  REVISION_REQUESTED: 'Revision Requested'
};

const STAGE_BADGE_STYLE: Record<QaReviewStage, string> = {
  AUTHOR_SUBMITTED: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  PEER_REVIEW: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  QA_LEAD_REVIEW: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  LEADERSHIP_SIGNOFF: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  APPROVED_RELEASED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  REVISION_REQUESTED: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
};

export default function QaReviewsPage() {
  const { qaReviews, advanceQaReview, currentUser } = useAuth();
  const [stageFilter, setStageFilter] = useState<'ALL' | QaReviewStage>('ALL');

  const filtered = qaReviews.filter(qa => stageFilter === 'ALL' || qa.stage === stageFilter);

  const counts: Record<QaReviewStage, number> = {
    AUTHOR_SUBMITTED: 0,
    PEER_REVIEW: 0,
    QA_LEAD_REVIEW: 0,
    LEADERSHIP_SIGNOFF: 0,
    APPROVED_RELEASED: 0,
    REVISION_REQUESTED: 0
  };
  qaReviews.forEach(qa => { counts[qa.stage] = (counts[qa.stage] || 0) + 1; });

  const handleApprove = (qaId: string, documentTitle: string) => {
    haptics.impact();
    const comment = prompt(`Approval comment for "${documentTitle}":`, 'Reviewed and approved for advancement.');
    if (comment === null) return;
    advanceQaReview(qaId, 'APPROVED', comment);
    haptics.success();
  };

  const handleReject = (qaId: string, documentTitle: string) => {
    haptics.impact();
    const comment = prompt(`Revision request reason for "${documentTitle}":`);
    if (!comment) return;
    advanceQaReview(qaId, 'REJECTED', comment);
    haptics.success();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            QA & Technical Review Chains
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Peer Review → QA Lead → Leadership Sign-Off gate for every document released to a client.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(STAGE_LABELS) as QaReviewStage[]).filter(s => s !== 'AUTHOR_SUBMITTED').map(stage => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`text-left p-3.5 rounded-2xl border transition-all ${
              stageFilter === stage
                ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                : 'bg-white dark:bg-[#121214] border-black/[0.06] dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{STAGE_LABELS[stage]}</div>
            <div className="text-xl font-bold mt-1">{counts[stage]}</div>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStageFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            stageFilter === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-white dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] text-slate-600 dark:text-slate-300'
          }`}
        >
          All Reviews ({qaReviews.length})
        </button>
      </div>

      {/* Review list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#121214] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
            No QA reviews in this stage. Submit a document for QA from Documents & Repository to start a review chain.
          </div>
        )}

        {filtered.map(qa => (
          <div key={qa.id} className="bg-white dark:bg-[#121214] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{qa.documentTitle}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {qa.projectCode} · Author: {qa.authorName} · SLA: {qa.slaDeadline}
                    {qa.isOverdue && <span className="ml-2 text-rose-500 font-semibold inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Overdue</span>}
                  </div>
                </div>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${STAGE_BADGE_STYLE[qa.stage]}`}>
                {STAGE_LABELS[qa.stage]}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <User className="w-3 h-3 text-slate-400" /> Peer: {qa.peerReviewerName || '—'}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <User className="w-3 h-3 text-slate-400" /> QA Lead: {qa.qaLeadName || '—'}
              </div>
              {qa.tamperProofCertificateHash && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  <Fingerprint className="w-3 h-3 shrink-0" /> {qa.tamperProofCertificateHash}
                </div>
              )}
            </div>

            {qa.reviewNotes.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-black/[0.05] dark:border-white/[0.06]">
                {qa.reviewNotes.map((note, idx) => (
                  <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{note.author}</span>
                    <span className="text-slate-400"> ({note.role}, {note.timestamp}): </span>
                    {note.comment}
                  </div>
                ))}
              </div>
            )}

            {qa.stage !== 'APPROVED_RELEASED' && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleApprove(qa.id, qa.documentTitle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Advance</span>
                </button>
                <button
                  onClick={() => handleReject(qa.id, qa.documentTitle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-semibold transition-all active:scale-[0.96]"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Request Revision</span>
                </button>
              </div>
            )}

            {qa.stage === 'APPROVED_RELEASED' && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Managing Consultant signed off — document released to client.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
