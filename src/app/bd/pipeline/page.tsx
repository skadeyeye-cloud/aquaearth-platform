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
  UserCheck,
  PhoneCall,
  Users,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { OpportunityItem, OpportunityStage } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { NewClientModal } from '@/components/bd/NewClientModal';
import { LogBdActivityModal } from '@/components/bd/LogBdActivityModal';

const PIPELINE_STEPS: { id: OpportunityStage; label: string; stepNumber: number }[] = [
  { id: 'IDENTIFIED', label: 'Identified', stepNumber: 1 },
  { id: 'QUALIFYING', label: 'Qualifying', stepNumber: 2 },
  { id: 'PROPOSAL_DRAFTING', label: 'Drafting', stepNumber: 3 },
  { id: 'SUBMITTED', label: 'Submitted', stepNumber: 4 },
  { id: 'WON', label: 'Won', stepNumber: 5 },
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
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [activeActivityOpp, setActiveActivityOpp] = useState<OpportunityItem | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<'ALL' | OpportunityStage>('ALL');

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

  // Inline status bar click handler
  const handleStageSelect = (opp: OpportunityItem, targetStage: OpportunityStage) => {
    haptics.selection();
    if (targetStage === 'LOST') {
      setLossModalOpp(opp);
      return;
    }

    const result = updateOpportunityStage(opp.id, targetStage);
    if (!result.success && result.requiresApproval) {
      alert(`⚠️ High-Value Bid Approval Gate: This bid exceeds ₦50M / $100k and requires Managing Consultant sign-off before submission.`);
    } else {
      haptics.success();
    }
  };

  const handleLossSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lossModalOpp) return;
    updateOpportunityStage(lossModalOpp.id, 'LOST', lossReason, winningCompetitor);
    setLossModalOpp(null);
    setLossReason('');
    setWinningCompetitor('');
    haptics.impact();
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
    haptics.success();
  };

  const filteredOpps = opportunities.filter(opp => {
    const matchesStage = selectedStageFilter === 'ALL' || opp.stage === selectedStageFilter;
    const matchesSearch = searchQuery === '' || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      opp.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.serviceLines.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 2 • Commercial Pipeline & Tendering
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Business Development & Bids
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive commercial pipeline list view with inline milestone updates, new client onboarding, and managerial activity verification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setIsNewClientOpen(true); haptics.selection(); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Create Client / Org</span>
          </button>

          <button
            onClick={() => { setActiveActivityOpp(null); setIsLogActivityOpen(true); haptics.selection(); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Log Call / Meeting</span>
          </button>

          <button
            onClick={() => { setIsClientPortalOpen(true); haptics.selection(); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Client RFP Portal</span>
          </button>

          <button
            onClick={() => { setIsNewOppOpen(true); haptics.selection(); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Live Pipeline</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">
            ₦{(totalActiveValueNGN / 1000000).toFixed(1)}M <span className="text-xs font-normal text-slate-400">NGN Eq.</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{activeOpps.length} active bidding campaigns</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Historical Win Rate</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">{wonRate}%</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{wonOpps.length} won engagements</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">High-Value Gates (&ge;₦50M)</div>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tnum">
            {opportunities.filter(o => o.requiresLeadershipApproval && !o.isApprovedByLeadership).length} Pending
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Leadership sign-off required</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Next Tender Deadline</div>
          <div className="text-sm font-bold text-amber-700 dark:text-amber-400 truncate mt-1">Sept 18 (Escravos)</div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Active Tendering Countdown</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deals, clients, or service lines..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'IDENTIFIED', 'QUALIFYING', 'PROPOSAL_DRAFTING', 'SUBMITTED', 'WON', 'LOST'] as const).map((stage) => {
            const isSelected = selectedStageFilter === stage;
            const count = stage === 'ALL' 
              ? opportunities.length 
              : opportunities.filter(o => o.stage === stage).length;

            return (
              <button
                key={stage}
                onClick={() => { setSelectedStageFilter(stage); haptics.selection(); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{stage === 'PROPOSAL_DRAFTING' ? 'Drafting' : stage}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pipeline List View with Inline Interactive Status Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Commercial Deal Pipeline List ({filteredOpps.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click on any milestone in a deal's status bar to advance or update its stage inline
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {filteredOpps.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No deals match your search criteria</p>
            </div>
          ) : (
            filteredOpps.map((opp) => {
              const isWon = opp.stage === 'WON';
              const isLost = opp.stage === 'LOST';
              const isHighValue = opp.estimatedValue >= 50000000 || (opp.currency === 'USD' && opp.estimatedValue >= 100000);
              const formattedVal = opp.currency === 'NGN' 
                ? `₦${(opp.estimatedValue / 1000000).toFixed(1)}M`
                : `$${(opp.estimatedValue / 1000).toFixed(0)}k`;

              // Find step index for progressive active fill
              const currentStepIdx = PIPELINE_STEPS.findIndex(s => s.id === opp.stage);

              return (
                <div key={opp.id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors space-y-4">
                  {/* Deal Header Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {opp.id.toUpperCase()}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {opp.title}
                        </h3>
                        {isHighValue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <ShieldAlert className="w-3 h-3" />
                            <span>High-Value Gate</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {opp.clientName}
                        </span>
                        <span>•</span>
                        <span>Lead: <span className="font-medium text-slate-700 dark:text-slate-300">{opp.bdOwnerName}</span></span>
                        <span>•</span>
                        <span>Due: <span className="font-medium text-slate-700 dark:text-slate-300">{opp.submissionDeadline}</span></span>
                        {opp.serviceLines?.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                              {opp.serviceLines.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Value & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tnum">
                          {formattedVal}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {opp.currency} Estimate
                        </div>
                      </div>

                      {/* Log Call / Meeting Button */}
                      <button
                        onClick={() => {
                          setActiveActivityOpp(opp);
                          setIsLogActivityOpen(true);
                          haptics.selection();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                        title="Log a client meeting or call pending line manager verification"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Log Call/Meeting</span>
                      </button>

                      {/* Convert to Won Project Button */}
                      {isWon && !opp.convertedProjectId && (
                        <button
                          onClick={() => {
                            const newProjId = convertWonToProject(opp.id);
                            haptics.success();
                            alert(`🎉 Success! Project ${newProjId} initialized in workspace from won tender!`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96]"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>Initialize Project</span>
                        </button>
                      )}

                      {isWon && !!opp.convertedProjectId && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                          <Check className="w-3 h-3" />
                          <span>Project Initialized ({opp.convertedProjectId})</span>
                        </span>
                      )}

                      {/* Mark Lost Toggle */}
                      {!isWon && !isLost && (
                        <button
                          onClick={() => handleStageSelect(opp, 'LOST')}
                          className="px-2.5 py-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs font-medium transition-colors"
                          title="Mark deal as lost"
                        >
                          Mark Lost
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interactive Inline Status Bar */}
                  <div className="pt-2">
                    {isLost ? (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/20 text-xs">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold">
                          <XCircle className="w-4 h-4" />
                          <span>Marked as Lost: {opp.winLossReason || 'Client opted for competing proposal'}</span>
                          {opp.winningCompetitor && (
                            <span className="text-slate-500 font-normal">
                              (Winning Competitor: <strong className="text-slate-700 dark:text-slate-300">{opp.winningCompetitor}</strong>)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleStageSelect(opp, 'QUALIFYING')}
                          className="text-[11px] text-blue-600 hover:underline font-bold"
                        >
                          Re-open Opportunity
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-5 gap-2">
                          {PIPELINE_STEPS.map((step, idx) => {
                            const isCurrent = opp.stage === step.id;
                            const isPast = currentStepIdx > idx;
                            const isFuture = currentStepIdx < idx;

                            let segmentBg = 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
                            if (isCurrent) {
                              segmentBg = isWon 
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                                : 'bg-blue-600 text-white border-blue-600 shadow-xs';
                            } else if (isPast) {
                              segmentBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-semibold';
                            }

                            return (
                              <button
                                key={step.id}
                                onClick={() => handleStageSelect(opp, step.id)}
                                className={`group relative flex flex-col p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.98] ${segmentBg}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                                    Step 0{step.stepNumber}
                                  </span>
                                  {isPast ? (
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  ) : isCurrent ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-80 transition-opacity" />
                                  )}
                                </div>
                                <span className="text-xs font-bold truncate">
                                  {step.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Opportunity Modal */}
      <AnimatePresence>
        {isNewOppOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewOppOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log New Bidding Opportunity</h3>
                <button onClick={() => setIsNewOppOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">&times;</button>
              </div>

              <form onSubmit={handleCreateOpp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chevron Escravos Terminal EIA & Geotechnical Study"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Organization</label>
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
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
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Value</label>
                    <input
                      type="number"
                      required
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono tnum text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e: any) => setCurrency(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
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
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Submission Deadline</label>
                    <input
                      type="text"
                      required
                      value={submissionDeadline}
                      onChange={(e) => setSubmissionDeadline(e.target.value)}
                      placeholder="YYYY-MM-DD HH:MM"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Supporting Technical Lead</label>
                    <select
                      value={technicalLeadId}
                      onChange={(e) => setTechnicalLeadId(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      {allUsers.filter(u => u.functionalRole === 'PROJECT_MANAGER' || u.functionalRole === 'FIELD_STAFF').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.jobTitle.split(' ')[0]})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => setIsNewOppOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Create Opportunity</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loss Reason Modal */}
      <AnimatePresence>
        {lossModalOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLossModalOpp(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center gap-2 text-rose-600 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                <XCircle className="w-4 h-4" />
                <span>Mark Opportunity as Lost</span>
              </div>
              <form onSubmit={handleLossSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Debrief / Loss Reason</label>
                  <textarea
                    required
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value)}
                    placeholder="e.g. Price undercut by 15%, Local community preference..."
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Winning Competitor (if known)</label>
                  <input
                    type="text"
                    value={winningCompetitor}
                    onChange={(e) => setWinningCompetitor(e.target.value)}
                    placeholder="e.g. Fugro, ALS, SGS..."
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => setLossModalOpp(null)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Confirm Loss</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Client Modal */}
      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSuccess={(id) => {
          setClientId(id);
        }}
      />

      {/* Log Activity Modal */}
      <LogBdActivityModal
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
        defaultOpportunityId={activeActivityOpp?.id}
        defaultClientName={activeActivityOpp?.clientName}
      />

      {/* Client Portal Simulation Modal */}
      <AnimatePresence>
        {isClientPortalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsClientPortalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AquaEarth Branded Client RFP Intake Portal</h3>
                <button onClick={() => setIsClientPortalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">&times;</button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Share this secure link with prospective clients or partners (Chevron, TotalEnergies, NLNG) to upload RFP/TOR tenders directly into the platform:
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                https://portal.aquaearth.ng/tenders/upload/ae-direct-rfp
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold">Automated Ingestion:</div>
                <p>Client uploads auto-create an `Identified` opportunity and notify the BD Lead instantly.</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsClientPortalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold active:scale-[0.96]"
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
