'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Briefcase, 
  Plus, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ArrowRight, 
  FolderPlus, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText,
  AlertTriangle,
  Building2,
  Lock,
  UserCheck
} from 'lucide-react';
import { OpportunityItem, OpportunityStage } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES: { id: OpportunityStage; label: string; color: string }[] = [
  { id: 'IDENTIFIED', label: '1. Identified', color: 'border-slate-300' },
  { id: 'QUALIFYING', label: '2. Qualifying', color: 'border-blue-400' },
  { id: 'PROPOSAL_DRAFTING', label: '3. Proposal Drafting', color: 'border-purple-400' },
  { id: 'SUBMITTED', label: '4. Submitted', color: 'border-amber-400' },
  { id: 'WON', label: '5. Won', color: 'border-emerald-500' },
  { id: 'LOST', label: '6. Lost', color: 'border-rose-400' },
];

export default function BdPipelinePage() {
  const { 
    opportunities, 
    currentUser, 
    clients, 
    allUsers, 
    createOpportunity, 
    updateOpportunityStage, 
    approveHighValueBid, 
    convertWonToProject 
  } = useAuth();

  const [isNewOppOpen, setIsNewOppOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);
  
  // Win / Loss modal state
  const [lossModalOpp, setLossModalOpp] = useState<OpportunityItem | null>(null);
  const [lossReason, setLossReason] = useState('');
  const [winningCompetitor, setWinningCompetitor] = useState('');

  // New Opp Form State
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [serviceLines, setServiceLines] = useState<string[]>(['ESIA / EIA Studies']);
  const [estimatedValue, setEstimatedValue] = useState(45000000);
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'EUR' | 'GBP'>('NGN');
  const [source, setSource] = useState('Public Tender RFP');
  const [submissionDeadline, setSubmissionDeadline] = useState('2026-09-18 17:00');
  const [technicalLeadId, setTechnicalLeadId] = useState('usr-4');

  const isManagingConsultant = currentUser.functionalRole === 'MANAGING_CONSULTANT' || currentUser.accessTier === 'SUPERADMIN';

  // Calculate pipeline summary stats
  const activeOpps = opportunities.filter(o => o.stage !== 'WON' && o.stage !== 'LOST');
  const totalActiveValueNGN = activeOpps.reduce((acc, curr) => {
    return curr.currency === 'NGN' ? acc + curr.estimatedValue : acc + (curr.estimatedValue * 1550);
  }, 0);

  const wonOpps = opportunities.filter(o => o.stage === 'WON');
  const wonRate = Math.round((wonOpps.length / Math.max(1, opportunities.filter(o => o.stage === 'WON' || o.stage === 'LOST').length)) * 100);

  const handleStageMove = (opp: OpportunityItem, newStage: OpportunityStage) => {
    if (newStage === 'LOST') {
      setLossModalOpp(opp);
      return;
    }

    const result = updateOpportunityStage(opp.id, newStage);
    if (!result.success && result.requiresApproval) {
      alert(`⚠️ High-Value Bid Approval Gate: This bid exceeds ₦50M / $100k and requires Managing Consultant sign-off before submission.`);
    }
  };

  const handleLossSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lossModalOpp) return;
    updateOpportunityStage(lossModalOpp.id, 'LOST', lossReason, winningCompetitor);
    setLossModalOpp(null);
    setLossReason('');
    setWinningCompetitor('');
  };

  const handleCreateOpp = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    const techLead = allUsers.find(u => u.id === technicalLeadId);

    createOpportunity({
      title,
      clientId,
      clientName: client?.name || 'Direct Client',
      serviceLines,
      estimatedValue: Number(estimatedValue),
      currency,
      stage: 'IDENTIFIED',
      source,
      submissionDeadline,
      bdOwnerId: currentUser.id,
      bdOwnerName: currentUser.name,
      technicalLeadId,
      technicalLeadName: techLead?.name,
    });

    setIsNewOppOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 2 • Commercial Pipeline & Tendering
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Business Development & Bids
          </h1>
          <p className="text-xs text-slate-500">
            Track opportunities from RFP signal to proposal submission, high-value sign-off gates, and 1-click project initialization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClientPortalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/[0.08] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Client RFP Portal Link</span>
          </button>

          <button
            onClick={() => setIsNewOppOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Live Pipeline</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">
            ₦{(totalActiveValueNGN / 1000000).toFixed(1)}M <span className="text-xs font-normal text-slate-400">NGN Eq.</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">{activeOpps.length} active bidding campaigns</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Historical Win Rate</div>
          <div className="text-xl font-extrabold text-emerald-600 tnum">{wonRate}%</div>
          <div className="text-[10px] text-slate-500 font-medium">{wonOpps.length} won engagements</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">High-Value Gates (&ge;₦50M)</div>
          <div className="text-xl font-extrabold text-purple-600 tnum">
            {opportunities.filter(o => o.requiresLeadershipApproval && !o.isApprovedByLeadership).length} Pending
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Leadership sign-off required</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Next Tender Deadline</div>
          <div className="text-sm font-bold text-amber-700 truncate mt-1">Sept 08 (Escravos)</div>
          <div className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>T-7 Days Countdown Alert</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-6 gap-3 min-w-[1200px]">
          {STAGES.map((col) => {
            const colOpps = opportunities.filter(o => o.stage === col.id);
            const colTotal = colOpps.reduce((acc, curr) => acc + curr.estimatedValue, 0);

            return (
              <div key={col.id} className="bg-slate-100/70 rounded-3xl p-3 flex flex-col min-h-[550px] border border-black/[0.04]">
                {/* Column Header */}
                <div className="pb-2.5 mb-2 border-b border-black/[0.06] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{col.label}</h3>
                    <div className="text-[10px] text-slate-400 font-mono tnum">
                      {colOpps.length} deals • {col.id === 'WON' ? 'Closed' : `~₦${(colTotal / 1000000).toFixed(0)}M`}
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center shadow-2xs whitespace-nowrap shrink-0">
                    {colOpps.length}
                  </span>
                </div>

                {/* Card Stack */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colOpps.map((opp) => (
                    <motion.div
                      layout
                      key={opp.id}
                      className="bg-white rounded-2xl p-3.5 border border-black/[0.06] shadow-xs hover:shadow-md transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-500 truncate max-w-[110px]">{opp.clientName}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded font-mono tnum whitespace-nowrap shrink-0">
                          {opp.currency} {opp.estimatedValue.toLocaleString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                        {opp.title}
                      </h4>

                      {/* Service Lines Tag */}
                      <div className="flex flex-wrap gap-1">
                        {opp.serviceLines.map((sl, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-50 border border-black/[0.05] text-slate-600 px-1.5 py-0.2 rounded whitespace-nowrap shrink-0">
                            {sl}
                          </span>
                        ))}
                      </div>

                      {/* High-Value Approval Pill */}
                      {opp.requiresLeadershipApproval && (
                        <div className={`p-1.5 rounded-xl text-[10px] flex items-center justify-between ${
                          opp.isApprovedByLeadership 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          <span className="font-semibold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                            <Lock className="w-3 h-3 text-purple-600" />
                            {opp.isApprovedByLeadership ? 'Leadership Signed' : 'Needs Sign-Off'}
                          </span>
                          {!opp.isApprovedByLeadership && isManagingConsultant && (
                            <button
                              onClick={() => approveHighValueBid(opp.id)}
                              className="px-2 py-0.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-[9px] shadow-2xs active:scale-[0.96] whitespace-nowrap shrink-0"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      )}

                      {/* Won Project Auto-Convert Action */}
                      {opp.stage === 'WON' && (
                        <div className="pt-1.5 border-t border-black/[0.04] flex items-center justify-between">
                          {opp.convertedProjectId ? (
                            <span className="text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              {opp.convertedProjectId}
                            </span>
                          ) : (
                            <button
                              onClick={() => convertWonToProject(opp.id)}
                              className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-2xs inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <FolderPlus className="w-3 h-3" />
                              <span>Initialize Project (M4)</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Lost Reason Display */}
                      {opp.stage === 'LOST' && opp.winLossReason && (
                        <div className="p-2 bg-rose-50 rounded-xl border border-rose-100 text-[10px] text-rose-800 space-y-0.5">
                          <div className="font-bold">Loss Analysis:</div>
                          <p className="line-clamp-2 text-rose-700">{opp.winLossReason}</p>
                          {opp.winningCompetitor && (
                            <div className="text-[9px] text-rose-600">Won by: <b>{opp.winningCompetitor}</b></div>
                          )}
                        </div>
                      )}

                      {/* Stage Progression Selector */}
                      {opp.stage !== 'WON' && opp.stage !== 'LOST' && (
                        <div className="pt-1.5 border-t border-black/[0.04] flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono tnum">
                            Due: {opp.submissionDeadline.split(' ')[0].substring(5)}
                          </span>

                          <div className="flex items-center gap-1">
                            <select
                              value={opp.stage}
                              onChange={(e) => handleStageMove(opp, e.target.value as OpportunityStage)}
                              className="text-[10px] font-semibold bg-slate-100 rounded-lg px-1.5 py-0.5 border border-black/[0.06] text-slate-700 focus:outline-none"
                            >
                              <option value="IDENTIFIED">Identified</option>
                              <option value="QUALIFYING">Qualify</option>
                              <option value="PROPOSAL_DRAFTING">Drafting</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="WON">Mark Won</option>
                              <option value="LOST">Mark Lost</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Loss Reason & Competitor Intelligence Modal (PRD FR 19) */}
      <AnimatePresence>
        {lossModalOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLossModalOpp(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase">PRD FR 19 Requirement</span>
                  <h3 className="text-sm font-bold text-slate-900">Record Loss Analysis</h3>
                </div>
                <button onClick={() => setLossModalOpp(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <p className="text-[11px] text-slate-500">
                To build actionable competitor intelligence, please capture the reason and winning competitor before closing this bid.
              </p>

              <form onSubmit={handleLossSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Loss Reason & Debrief Notes</label>
                  <textarea
                    required
                    rows={3}
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value)}
                    placeholder="e.g. Price too high, client preferred vendor with local vessel in Bonny, scope mismatch..."
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Winning Competitor (if known)</label>
                  <input
                    type="text"
                    value={winningCompetitor}
                    onChange={(e) => setWinningCompetitor(e.target.value)}
                    placeholder="e.g. Fugro NV, SGS, Deltatek, Unknown"
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setLossModalOpp(null)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Record Loss</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Opportunity Modal */}
      <AnimatePresence>
        {isNewOppOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewOppOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <h3 className="text-sm font-bold text-slate-900">Log New Opportunity / Tender</h3>
                <button onClick={() => setIsNewOppOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <form onSubmit={handleCreateOpp} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chevron Escravos Terminal EIA & Geotechnical Study"
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Client Organization</label>
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lead Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                    >
                      <option value="Public Tender RFP">Public Tender RFP</option>
                      <option value="Existing Client Repeat">Existing Client Repeat</option>
                      <option value="Direct Client Referral">Direct Client Referral</option>
                      <option value="Framework Agreement">Framework Agreement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estimated Value</label>
                    <input
                      type="number"
                      required
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono tnum"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e: any) => setCurrency(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-bold"
                    >
                      <option value="NGN">₦ NGN (Nigerian Naira)</option>
                      <option value="USD">$ USD (US Dollar)</option>
                      <option value="EUR">€ EUR (Euro)</option>
                      <option value="GBP">£ GBP (British Pound)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Submission Deadline</label>
                    <input
                      type="text"
                      required
                      value={submissionDeadline}
                      onChange={(e) => setSubmissionDeadline(e.target.value)}
                      placeholder="YYYY-MM-DD HH:MM"
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Supporting Technical Lead</label>
                    <select
                      value={technicalLeadId}
                      onChange={(e) => setTechnicalLeadId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                    >
                      {allUsers.filter(u => u.functionalRole === 'PROJECT_MANAGER' || u.functionalRole === 'FIELD_STAFF').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.jobTitle.split(' ')[0]})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setIsNewOppOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Create Opportunity</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client Portal Simulation Modal */}
      <AnimatePresence>
        {isClientPortalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsClientPortalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <h3 className="text-sm font-bold text-slate-900">AquaEarth Branded Client RFP Intake Portal</h3>
                <button onClick={() => setIsClientPortalOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <p className="text-[11px] text-slate-500">
                Share this secure link with prospective clients or partners (Chevron, TotalEnergies, NLNG) to upload RFP/TOR tenders directly into the platform:
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-black/[0.08] text-[11px] font-mono text-slate-800 break-all select-all">
                https://portal.aquaearth.ng/tenders/upload/ae-direct-rfp
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[10px] text-emerald-800 space-y-1">
                <div className="font-bold">Automated Ingestion:</div>
                <p>Client uploads auto-create an `Identified` opportunity and notify the BD Lead instantly.</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsClientPortalOpen(false)}
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
