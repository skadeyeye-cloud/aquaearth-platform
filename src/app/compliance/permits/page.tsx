'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Landmark,
  RefreshCw,
  FileCheck,
  Plus,
  Pencil,
  FileSignature
} from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { CompliancePermit, RegulatoryBody } from '@/lib/types';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  EXPIRING_SOON: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  EXPIRED: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  RENEWAL_IN_PROGRESS: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
};

const REGULATORY_BODIES: RegulatoryBody[] = ['FMEnv', 'NESREA', 'NUPRC', 'STATE_MOE', 'NIWA'];

type FormState = {
  recordType: 'PERMIT' | 'CONTRACT';
  permitTitle: string;
  permitNumber: string;
  licenseNumber: string;
  regulatoryBody: string;
  projectId: string;
  statutoryFeeNgn: number;
  issueDate: string;
  expiryDate: string;
  officerInCharge: string;
  isRecurringCycle: boolean;
  cycleDurationYears: number;
  feeReconciled: boolean;
};

const emptyForm = (defaultOfficer: string): FormState => ({
  recordType: 'PERMIT',
  permitTitle: '',
  permitNumber: '',
  licenseNumber: '',
  regulatoryBody: 'FMEnv',
  projectId: '',
  statutoryFeeNgn: 0,
  issueDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  officerInCharge: defaultOfficer,
  isRecurringCycle: false,
  cycleDurationYears: 1,
  feeReconciled: false
});

export default function CompliancePermitsPage() {
  const { compliancePermits, renewCompliancePermit, createCompliancePermit, editCompliancePermit, projects, currentUser } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm(currentUser.name));

  const [editingRecord, setEditingRecord] = useState<CompliancePermit | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm(currentUser.name));

  const counts = {
    ACTIVE: compliancePermits.filter(p => p.status === 'ACTIVE').length,
    EXPIRING_SOON: compliancePermits.filter(p => p.status === 'EXPIRING_SOON').length,
    EXPIRED: compliancePermits.filter(p => p.status === 'EXPIRED').length,
    totalFee: compliancePermits.reduce((s, p) => s + p.statutoryFeeNgn, 0)
  };

  const handleRenew = (permitId: string, title: string) => {
    haptics.impact();
    const confirmed = confirm(`Renew "${title}"? This records the statutory fee as reconciled and resets the compliance cycle.`);
    if (!confirmed) return;
    renewCompliancePermit(permitId);
    haptics.success();
  };

  const handleOpenCreate = (recordType: 'PERMIT' | 'CONTRACT') => {
    setCreateForm({ ...emptyForm(currentUser.name), recordType });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === createForm.projectId);
    createCompliancePermit({
      recordType: createForm.recordType,
      permitTitle: createForm.permitTitle,
      permitNumber: createForm.permitNumber,
      licenseNumber: createForm.licenseNumber || undefined,
      regulatoryBody: createForm.regulatoryBody,
      projectId: createForm.projectId || undefined,
      projectName: project?.title,
      issueDate: createForm.issueDate,
      expiryDate: createForm.expiryDate,
      statutoryFeeNgn: Number(createForm.statutoryFeeNgn),
      feeReconciled: createForm.feeReconciled,
      isRecurringCycle: createForm.isRecurringCycle,
      cycleDurationYears: Number(createForm.cycleDurationYears),
      officerInCharge: createForm.officerInCharge
    });
    setIsCreateOpen(false);
    haptics.success();
  };

  const handleOpenEdit = (record: CompliancePermit) => {
    setEditingRecord(record);
    setEditForm({
      recordType: record.recordType || 'PERMIT',
      permitTitle: record.permitTitle,
      permitNumber: record.permitNumber,
      licenseNumber: record.licenseNumber || '',
      regulatoryBody: record.regulatoryBody,
      projectId: record.projectId || '',
      statutoryFeeNgn: record.statutoryFeeNgn,
      issueDate: record.issueDate,
      expiryDate: record.expiryDate,
      officerInCharge: record.officerInCharge,
      isRecurringCycle: record.isRecurringCycle,
      cycleDurationYears: record.cycleDurationYears,
      feeReconciled: record.feeReconciled
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const project = projects.find(p => p.id === editForm.projectId);
    editCompliancePermit(editingRecord.id, {
      recordType: editForm.recordType,
      permitTitle: editForm.permitTitle,
      permitNumber: editForm.permitNumber,
      licenseNumber: editForm.licenseNumber || undefined,
      regulatoryBody: editForm.regulatoryBody,
      projectId: editForm.projectId || undefined,
      projectName: project?.title,
      issueDate: editForm.issueDate,
      expiryDate: editForm.expiryDate,
      statutoryFeeNgn: Number(editForm.statutoryFeeNgn),
      feeReconciled: editForm.feeReconciled,
      isRecurringCycle: editForm.isRecurringCycle,
      cycleDurationYears: Number(editForm.cycleDurationYears),
      officerInCharge: editForm.officerInCharge
    });
    setEditingRecord(null);
    haptics.success();
  };

  const renderFormFields = (form: FormState, setForm: React.Dispatch<React.SetStateAction<FormState>>) => (
    <>
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, recordType: 'PERMIT' }))}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.recordType === 'PERMIT' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Statutory Permit
        </button>
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, recordType: 'CONTRACT' }))}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.recordType === 'CONTRACT' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Contract
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {form.recordType === 'CONTRACT' ? 'Contract Title' : 'Permit Title'}
        </label>
        <input
          type="text"
          required
          value={form.permitTitle}
          onChange={(e) => setForm(f => ({ ...f, permitTitle: e.target.value }))}
          placeholder={form.recordType === 'CONTRACT' ? 'e.g. Waste Management Services Agreement' : 'e.g. FMEnv EIA Approval Permit'}
          className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {form.recordType === 'CONTRACT' ? 'Contract Number' : 'Permit Number'}
          </label>
          <input
            type="text"
            required
            value={form.permitNumber}
            onChange={(e) => setForm(f => ({ ...f, permitNumber: e.target.value }))}
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">License Number (optional)</label>
          <input
            type="text"
            value={form.licenseNumber}
            onChange={(e) => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {form.recordType === 'CONTRACT' ? 'Counterparty' : 'Regulatory Body'}
        </label>
        {form.recordType === 'PERMIT' ? (
          <select
            value={form.regulatoryBody}
            onChange={(e) => setForm(f => ({ ...f, regulatoryBody: e.target.value }))}
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            {REGULATORY_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        ) : (
          <input
            type="text"
            required
            value={form.regulatoryBody}
            onChange={(e) => setForm(f => ({ ...f, regulatoryBody: e.target.value }))}
            placeholder="e.g. Lagos State Waste Management Authority"
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
          />
        )}
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Linked Project (optional)</label>
        <select
          value={form.projectId}
          onChange={(e) => setForm(f => ({ ...f, projectId: e.target.value }))}
          className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
        >
          <option value="">-- None --</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {form.recordType === 'CONTRACT' ? 'Start Date' : 'Issue Date'}
          </label>
          <input
            type="date"
            required
            value={form.issueDate}
            onChange={(e) => setForm(f => ({ ...f, issueDate: e.target.value }))}
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
          <input
            type="date"
            required
            value={form.expiryDate}
            onChange={(e) => setForm(f => ({ ...f, expiryDate: e.target.value }))}
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {form.recordType === 'CONTRACT' ? 'Contract Value (₦)' : 'Statutory Fee (₦)'}
          </label>
          <input
            type="number"
            min={0}
            required
            value={form.statutoryFeeNgn}
            onChange={(e) => setForm(f => ({ ...f, statutoryFeeNgn: Number(e.target.value) }))}
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Officer in Charge</label>
          <input
            type="text"
            required
            value={form.officerInCharge}
            onChange={(e) => setForm(f => ({ ...f, officerInCharge: e.target.value }))}
            className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isRecurringCycle}
            onChange={(e) => setForm(f => ({ ...f, isRecurringCycle: e.target.checked }))}
            className="rounded"
          />
          Recurring cycle
        </label>
        {form.isRecurringCycle && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Cycle Duration (years)</label>
            <input
              type="number"
              min={1}
              value={form.cycleDurationYears}
              onChange={(e) => setForm(f => ({ ...f, cycleDurationYears: Number(e.target.value) }))}
              className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={form.feeReconciled}
          onChange={(e) => setForm(f => ({ ...f, feeReconciled: e.target.checked }))}
          className="rounded"
        />
        {form.recordType === 'CONTRACT' ? 'Payment reconciled' : 'Statutory fee reconciled'}
      </label>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Regulatory Compliance, Permits & Contracts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            FMEnv, NESREA, NUPRC, and state ministry permits, plus tracked contracts — renewal, expiry & fee reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenCreate('PERMIT')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#16161a] border border-black/[0.08] dark:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-[#202026] text-slate-800 dark:text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.96]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Permit</span>
          </button>
          <button
            onClick={() => handleOpenCreate('CONTRACT')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96]"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>New Contract</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Active</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{counts.ACTIVE}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Expiring Soon</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{counts.EXPIRING_SOON}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">Expired</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{counts.EXPIRED}</div>
        </div>
        <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121214]">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Statutory Fees</div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">₦{(counts.totalFee / 1000000).toFixed(1)}M</div>
        </div>
      </div>

      <div className="space-y-3">
        {compliancePermits.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#121214] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
            No statutory permits or contracts on file.
          </div>
        )}

        {compliancePermits.map(permit => (
          <div key={permit.id} className="bg-white dark:bg-[#121214] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                {permit.recordType === 'CONTRACT' ? (
                  <FileSignature className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                ) : (
                  <Landmark className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    {permit.permitTitle}
                    {permit.recordType === 'CONTRACT' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">CONTRACT</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {permit.permitNumber} · {permit.regulatoryBody}
                    {permit.licenseNumber && <> · Lic. {permit.licenseNumber}</>}
                    {permit.projectName && <> · {permit.projectName}</>}
                  </div>
                </div>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLE[permit.status]}`}>
                {permit.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" /> {permit.recordType === 'CONTRACT' ? 'Start' : 'Issued'}: {permit.issueDate}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" /> Expires: {permit.expiryDate}
              </div>
              <div>{permit.recordType === 'CONTRACT' ? 'Value' : 'Fee'}: ₦{permit.statutoryFeeNgn.toLocaleString()}</div>
              <div className="flex items-center gap-1.5">
                {permit.feeReconciled ? (
                  <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1"><FileCheck className="w-3 h-3" /> Reconciled</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Pending</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black/[0.05] dark:border-white/[0.06]">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Officer in Charge: {permit.officerInCharge}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(permit)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-[0.96]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleRenew(permit.id, permit.permitTitle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Compliance Record</h3>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">&times;</button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {renderFormFields(createForm, setCreateForm)}
                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Create Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingRecord(null)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Compliance Record</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{editingRecord.permitTitle}</p>
                  </div>
                </div>
                <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">&times;</button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {renderFormFields(editForm, setEditForm)}
                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setEditingRecord(null)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
