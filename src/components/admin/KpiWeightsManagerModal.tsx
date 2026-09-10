'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  KpiScoringConfig, 
  KpiWorkItemType, 
  KpiWorkItemRule 
} from '@/lib/types';
import { 
  DEFAULT_KPI_CONFIG, 
  simulateLeaderboardRecalculation, 
  getPerformanceTier 
} from '@/lib/kpi-engine';
import { 
  Sliders, 
  Sparkles, 
  Crown, 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  X, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Briefcase, 
  Layers, 
  AlertCircle,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KpiWeightsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'WEIGHTS' | 'TIERS' | 'SIMULATION';

export default function KpiWeightsManagerModal({ isOpen, onClose }: KpiWeightsManagerModalProps) {
  const { 
    currentUser, 
    kpiConfig, 
    updateKpiConfig, 
    resetKpiConfigToDefault, 
    leaderboard 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('WEIGHTS');
  const [draftConfig, setDraftConfig] = useState<KpiScoringConfig>(() => JSON.parse(JSON.stringify(kpiConfig)));
  const [showSavedToast, setShowSavedToast] = useState<string | null>(null);

  // Sync draftConfig when modal opens or kpiConfig updates
  React.useEffect(() => {
    if (isOpen) {
      setDraftConfig(JSON.parse(JSON.stringify(kpiConfig)));
    }
  }, [isOpen, kpiConfig]);

  // Handle work-item rule field change
  const handleRuleChange = (
    type: KpiWorkItemType, 
    field: 'basePoints' | 'onTimeBonus' | 'overduePenaltyPerDay', 
    val: number
  ) => {
    const clamped = Math.max(0, Math.min(300, isNaN(val) ? 0 : val));
    setDraftConfig(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [type]: {
          ...prev.rules[type],
          [field]: clamped
        }
      }
    }));
  };

  // Handle attendance punctuality bonus change
  const handleAttendanceBonusChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setDraftConfig(prev => ({
      ...prev,
      attendanceOnTimeBonus: clamped
    }));
  };

  // Handle tier threshold change
  const handleTierChange = (
    field: 'satisfactoryMin' | 'commendableMin' | 'exemplaryMin',
    val: number
  ) => {
    const clamped = Math.max(10, Math.min(2000, isNaN(val) ? 10 : val));
    setDraftConfig(prev => ({
      ...prev,
      tierThresholds: {
        ...prev.tierThresholds,
        [field]: clamped,
        needsImprovementMax: field === 'satisfactoryMin' ? clamped - 1 : prev.tierThresholds.needsImprovementMax
      }
    }));
  };

  // Compute live simulation comparison
  const simulationResults = useMemo(() => {
    return simulateLeaderboardRecalculation(leaderboard, kpiConfig, draftConfig);
  }, [leaderboard, kpiConfig, draftConfig]);

  // Aggregate simulation statistics
  const simStats = useMemo(() => {
    const totalDeltas = simulationResults.reduce((acc, r) => acc + r.scoreDelta, 0);
    const avgDelta = simulationResults.length > 0 ? Math.round(totalDeltas / simulationResults.length) : 0;
    const rankChanges = simulationResults.filter(r => r.rankDelta !== 0).length;
    const tierChanges = simulationResults.filter(r => r.tierChanged).length;
    const exemplaryCount = simulationResults.filter(r => r.simulatedTier.tier === 'EXEMPLARY').length;

    return { avgDelta, rankChanges, tierChanges, exemplaryCount };
  }, [simulationResults]);

  // Commit changes
  const handleSave = (recalculateLive: boolean) => {
    updateKpiConfig(draftConfig, recalculateLive);
    setShowSavedToast(
      recalculateLive 
        ? 'Applied & live leaderboard recalculated with new weights!' 
        : 'Saved as standard baseline scoring configuration!'
    );
    setTimeout(() => {
      setShowSavedToast(null);
      onClose();
    }, 1400);
  };

  // Restore factory defaults
  const handleResetDefaults = () => {
    setDraftConfig(JSON.parse(JSON.stringify(DEFAULT_KPI_CONFIG)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white dark:bg-[#0e0e11] border border-black/[0.1] dark:border-white/[0.12] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  KPI Scoring Weights & Tier Thresholds Manager
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap shrink-0">
                  PRD Req 114 • Superadmin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tune work-item completion points, punctuality incentives, and monthly appraisal tiers with instant impact simulation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-black/[0.06] dark:border-white/[0.08] px-6 bg-slate-50/30 dark:bg-white/[0.01] gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('WEIGHTS')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'WEIGHTS'
                ? 'border-amber-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. Work-Item Scoring Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('TIERS')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'TIERS'
                ? 'border-amber-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>2. Monthly Performance Tiers</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'SIMULATION'
                ? 'border-amber-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>3. Live Simulation Preview</span>
            {simStats.rankChanges > 0 && (
              <span className="text-[10px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded-full font-extrabold tnum">
                {simStats.rankChanges} shifts
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: WORK-ITEM WEIGHTS */}
          {activeTab === 'WEIGHTS' && (
            <div className="space-y-6">
              {/* Daily Attendance Clock-In Rule */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Punctual Attendance Clock-In Incentive
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Points awarded automatically for biometric / GPS check-ins &le; 08:15 WAT.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Award:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={draftConfig.attendanceOnTimeBonus}
                      onChange={(e) => handleAttendanceBonusChange(Number(e.target.value))}
                      className="w-24 accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.12] rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 tnum min-w-[54px] justify-center">
                      +{draftConfig.attendanceOnTimeBonus} pts
                    </div>
                  </div>
                </div>
              </div>

              {/* Work-Item Type Rules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(draftConfig.rules) as KpiWorkItemType[]).map((ruleKey) => {
                  const rule = draftConfig.rules[ruleKey];
                  return (
                    <div
                      key={ruleKey}
                      className="p-4 bg-white dark:bg-[#131317] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl space-y-3.5 shadow-2xs hover:border-slate-400 dark:hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span>{rule.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {rule.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
                          {ruleKey}
                        </span>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        {/* Base Points */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            Base Points (Completion):
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={5}
                              max={150}
                              step={5}
                              value={rule.basePoints}
                              onChange={(e) => handleRuleChange(ruleKey, 'basePoints', Number(e.target.value))}
                              className="w-20 sm:w-24 accent-amber-500 cursor-pointer"
                            />
                            <input
                              type="number"
                              min={5}
                              max={200}
                              value={rule.basePoints}
                              onChange={(e) => handleRuleChange(ruleKey, 'basePoints', Number(e.target.value))}
                              className="w-14 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-black/[0.1] dark:border-white/[0.12] rounded-lg text-xs font-bold text-center text-slate-900 dark:text-white tnum"
                            />
                          </div>
                        </div>

                        {/* On-Time Bonus */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            On-Time Bonus (+):
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={50}
                              step={1}
                              value={rule.onTimeBonus}
                              onChange={(e) => handleRuleChange(ruleKey, 'onTimeBonus', Number(e.target.value))}
                              className="w-20 sm:w-24 accent-emerald-500 cursor-pointer"
                            />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={rule.onTimeBonus}
                              onChange={(e) => handleRuleChange(ruleKey, 'onTimeBonus', Number(e.target.value))}
                              className="w-14 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-black/[0.1] dark:border-white/[0.12] rounded-lg text-xs font-bold text-center text-emerald-600 dark:text-emerald-400 tnum"
                            />
                          </div>
                        </div>

                        {/* Overdue Penalty */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            Overdue Penalty (- pts / day):
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={30}
                              step={1}
                              value={rule.overduePenaltyPerDay}
                              onChange={(e) => handleRuleChange(ruleKey, 'overduePenaltyPerDay', Number(e.target.value))}
                              className="w-20 sm:w-24 accent-rose-500 cursor-pointer"
                            />
                            <input
                              type="number"
                              min={0}
                              max={50}
                              value={rule.overduePenaltyPerDay}
                              onChange={(e) => handleRuleChange(ruleKey, 'overduePenaltyPerDay', Number(e.target.value))}
                              className="w-14 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-black/[0.1] dark:border-white/[0.12] rounded-lg text-xs font-bold text-center text-rose-600 dark:text-rose-400 tnum"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PERFORMANCE TIERS */}
          {activeTab === 'TIERS' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Monthly Appraisal Tier Thresholds
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Set the minimum scores required for each performance band. Badges, appraisal certificates, and executive reporting auto-align to these ranges.
                </p>
              </div>

              {/* Visual Tier Spectrum Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Tier Range Visualizer</span>
                  <span className="text-slate-400 font-mono">0 pts &rarr; 600+ pts</span>
                </div>
                <div className="h-4 rounded-xl overflow-hidden flex ring-1 ring-black/[0.08] dark:ring-white/[0.12]">
                  <div 
                    style={{ width: `${Math.min(30, (draftConfig.tierThresholds.satisfactoryMin / 600) * 100)}%` }} 
                    className="bg-rose-500/80 flex items-center justify-center text-[9px] text-white font-bold"
                    title="Needs Improvement"
                  >
                    Needs Imp.
                  </div>
                  <div 
                    style={{ width: `${Math.min(35, ((draftConfig.tierThresholds.commendableMin - draftConfig.tierThresholds.satisfactoryMin) / 600) * 100)}%` }} 
                    className="bg-emerald-500/80 flex items-center justify-center text-[9px] text-white font-bold"
                    title="Satisfactory"
                  >
                    Satisfactory
                  </div>
                  <div 
                    style={{ width: `${Math.min(30, ((draftConfig.tierThresholds.exemplaryMin - draftConfig.tierThresholds.commendableMin) / 600) * 100)}%` }} 
                    className="bg-indigo-500/80 flex items-center justify-center text-[9px] text-white font-bold"
                    title="Commendable"
                  >
                    Commendable
                  </div>
                  <div 
                    className="flex-1 bg-amber-500 flex items-center justify-center text-[9px] text-amber-950 font-black"
                    title="Exemplary"
                  >
                    Exemplary
                  </div>
                </div>
              </div>

              {/* Tier Steppers */}
              <div className="space-y-4">
                {/* Needs Improvement */}
                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                      !
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-300">Needs Improvement</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Score below Satisfactory minimum (&lt; {draftConfig.tierThresholds.satisfactoryMin} pts). Requires supervisor coaching.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-xl border border-rose-500/20 tnum">
                    0 &ndash; {draftConfig.tierThresholds.satisfactoryMin - 1} pts
                  </span>
                </div>

                {/* Satisfactory */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Satisfactory Standard</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Meets target deliverables and punctuality metrics ({draftConfig.tierThresholds.satisfactoryMin} to {draftConfig.tierThresholds.commendableMin - 1} pts).
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-slate-500 font-semibold">Min Score:</span>
                    <input
                      type="number"
                      min={50}
                      max={draftConfig.tierThresholds.commendableMin - 10}
                      step={10}
                      value={draftConfig.tierThresholds.satisfactoryMin}
                      onChange={(e) => handleTierChange('satisfactoryMin', Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.12] rounded-xl text-xs font-bold text-center text-emerald-600 dark:text-emerald-400 tnum"
                    />
                  </div>
                </div>

                {/* Commendable */}
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Commendable Performer</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Consistently exceeds baseline outputs and project timelines ({draftConfig.tierThresholds.commendableMin} to {draftConfig.tierThresholds.exemplaryMin - 1} pts).
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-slate-500 font-semibold">Min Score:</span>
                    <input
                      type="number"
                      min={draftConfig.tierThresholds.satisfactoryMin + 10}
                      max={draftConfig.tierThresholds.exemplaryMin - 10}
                      step={10}
                      value={draftConfig.tierThresholds.commendableMin}
                      onChange={(e) => handleTierChange('commendableMin', Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.12] rounded-xl text-xs font-bold text-center text-indigo-600 dark:text-indigo-400 tnum"
                    />
                  </div>
                </div>

                {/* Exemplary */}
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-300">Exemplary / Tier 1 Performer</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Elite operational throughput, zero delays, and highest quality deliverables ({draftConfig.tierThresholds.exemplaryMin}+ pts).
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-slate-500 font-semibold">Min Score:</span>
                    <input
                      type="number"
                      min={draftConfig.tierThresholds.commendableMin + 10}
                      max={800}
                      step={10}
                      value={draftConfig.tierThresholds.exemplaryMin}
                      onChange={(e) => handleTierChange('exemplaryMin', Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.12] rounded-xl text-xs font-bold text-center text-amber-600 dark:text-amber-400 tnum"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SIMULATION IMPACT TABLE */}
          {activeTab === 'SIMULATION' && (
            <div className="space-y-4">
              {/* Simulation KPIs Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Avg Score Shift</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1 tnum mt-0.5">
                    {simStats.avgDelta >= 0 ? '+' : ''}{simStats.avgDelta} <span className="text-xs font-normal text-slate-400">pts</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Rank Positions Shifted</div>
                  <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 tnum mt-0.5">
                    {simStats.rankChanges} <span className="text-xs font-normal text-slate-400">staff</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Tier Migrations</div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 tnum mt-0.5">
                    {simStats.tierChanges} <span className="text-xs font-normal text-slate-400">reclassified</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Exemplary Tier Count</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 tnum mt-0.5">
                    {simStats.exemplaryCount} <span className="text-xs font-normal text-slate-400">personnel</span>
                  </div>
                </div>
              </div>

              {/* Simulation Comparison Table */}
              <div className="border border-black/[0.08] dark:border-white/[0.1] rounded-2xl overflow-hidden bg-white dark:bg-[#121215]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Simulated Rank</th>
                        <th className="px-4 py-2.5">Employee</th>
                        <th className="px-4 py-2.5 text-center">Current Score</th>
                        <th className="px-4 py-2.5 text-center">Simulated Score</th>
                        <th className="px-4 py-2.5 text-center">Score Delta</th>
                        <th className="px-4 py-2.5 text-right">Appraisal Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                      {simulationResults.map((sim) => {
                        const rankUp = sim.rankDelta > 0;
                        const rankDown = sim.rankDelta < 0;

                        return (
                          <tr 
                            key={sim.userId}
                            className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 dark:text-white tnum">
                                  #{sim.simulatedRank}
                                </span>
                                {rankUp && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                                    <TrendingUp className="w-3 h-3" />
                                    +{sim.rankDelta}
                                  </span>
                                )}
                                {rankDown && (
                                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center">
                                    <TrendingDown className="w-3 h-3" />
                                    {sim.rankDelta}
                                  </span>
                                )}
                                {sim.rankDelta === 0 && (
                                  <span className="text-[10px] text-slate-400">&mdash;</span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <img
                                  src={sim.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                  alt={sim.name}
                                  className="w-6 h-6 rounded-lg object-cover ring-1 ring-black/[0.05] dark:ring-white/10"
                                />
                                <div>
                                  <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                                    {sim.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {sim.jobTitle}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-2.5 text-center text-slate-500 dark:text-slate-400 tnum">
                              {sim.currentScore} pts (Rank #{sim.currentRank})
                            </td>

                            <td className="px-4 py-2.5 text-center font-extrabold text-slate-900 dark:text-white tnum">
                              {sim.simulatedScore} pts
                            </td>

                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tnum ${
                                sim.scoreDelta > 0
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : sim.scoreDelta < 0
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                              }`}>
                                {sim.scoreDelta > 0 ? `+${sim.scoreDelta}` : sim.scoreDelta} pts
                              </span>
                            </td>

                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sim.simulatedTier.badgeColor}`}>
                                {sim.simulatedTier.label}
                                {sim.tierChanged && (
                                  <span className="text-[9px] font-black uppercase text-indigo-500 animate-pulse">
                                    &bull; Shifted
                                  </span>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 sm:p-5 border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Factory Defaults</span>
            </button>

            {draftConfig.lastUpdated && (
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Last updated {draftConfig.lastUpdated} by {draftConfig.updatedBy || 'Superadmin'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              onClick={() => handleSave(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#1a1a20] border border-black/[0.12] dark:border-white/[0.15] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-white rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.97]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Baseline Only</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-black shadow-xs transition-all active:scale-[0.97]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Recalculate Active Cycle</span>
            </button>
          </div>
        </div>

        {/* Success Toast Notification */}
        <AnimatePresence>
          {showSavedToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold z-50 pointer-events-none"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
              <span>{showSavedToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
