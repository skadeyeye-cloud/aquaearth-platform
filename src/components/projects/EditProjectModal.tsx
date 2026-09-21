'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FolderKanban, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { ProjectRecord } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface EditProjectModalProps {
  isOpen: boolean;
  project: ProjectRecord | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProjectModal({
  isOpen,
  project,
  onClose,
  onSuccess
}: EditProjectModalProps) {
  const { clients, allUsers, editProject, currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [contractValue, setContractValue] = useState<number>(0);
  const [leadPmId, setLeadPmId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [status, setStatus] = useState<ProjectRecord['status']>('ACTIVE');
  const [health, setHealth] = useState<ProjectRecord['health']>('ON_TRACK');
  const [healthReason, setHealthReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setClientId(project.clientId || '');
      setContractValue(project.contractValue || 0);
      setLeadPmId(project.leadPmId || project.projectManagerId || '');
      setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
      setTargetEndDate(project.targetEndDate ? project.targetEndDate.split('T')[0] : '');
      setStatus(project.status || 'ACTIVE');
      setHealth(project.health || 'ON_TRACK');
      setHealthReason(project.healthReason || '');
      setDescription(project.description || '');
      setError(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (contractValue <= 0) {
      setError('Contract value must be greater than ₦0.');
      return;
    }

    setIsSubmitting(true);
    haptics.impact();

    try {
      const selectedClient = clients.find(c => c.id === clientId);
      const selectedPm = allUsers.find(u => u.id === leadPmId);

      editProject(project.id, {
        title: title.trim(),
        clientId: clientId || project.clientId,
        clientName: selectedClient?.name || project.clientName,
        contractValue: Number(contractValue),
        leadPmId: leadPmId || project.leadPmId,
        leadPmName: selectedPm?.name || project.leadPmName,
        startDate,
        targetEndDate,
        status,
        health,
        healthReason: healthReason.trim() || undefined,
        description: description.trim() || undefined
      });

      haptics.success();
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update project.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">
                  Edit Project Parameters
                </h3>
                <p className="text-xs text-[#86868B]">
                  {project.projectCode} • Master Project Record
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F6F4F0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Chevron Escravos Terminal Expansion - Geotech Campaign"
                className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Client & Contract Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Client Account
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-[#1C1C1E]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Contract Value (NGN ₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#86868B]">₦</span>
                  <input
                    type="number"
                    min="1"
                    step="100000"
                    required
                    value={contractValue}
                    onChange={e => setContractValue(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <p className="text-[10px] text-[#86868B] mt-1 font-mono">
                  {contractValue >= 1000000 ? `₦${(contractValue / 1000000).toFixed(2)}M` : `₦${contractValue.toLocaleString()}`}
                </p>
              </div>
            </div>

            {/* Lead PM & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Lead Project Manager
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <select
                    value={leadPmId}
                    onChange={e => setLeadPmId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id} className="bg-white dark:bg-[#1C1C1E]">
                        {u.name} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Execution Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ProjectRecord['status'])}
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="ACTIVE">ACTIVE (In Progress)</option>
                  <option value="ON_HOLD">ON_HOLD (Paused)</option>
                  <option value="COMPLETED">COMPLETED (Delivered)</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Health & Health Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Project Health
                </label>
                <div className="relative">
                  <Activity className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <select
                    value={health}
                    onChange={e => setHealth(e.target.value as ProjectRecord['health'])}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="ON_TRACK">🟢 ON TRACK</option>
                    <option value="AT_RISK">🟡 AT RISK</option>
                    <option value="DELAYED">🔴 DELAYED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Health Context Note
                </label>
                <input
                  type="text"
                  value={healthReason}
                  onChange={e => setHealthReason(e.target.value)}
                  placeholder="e.g. Vessel mobilization on schedule"
                  className="w-full px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Timeline Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                  Target Completion Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={e => setTargetEndDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Technical Scope & Objectives
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed project scope, engineering objectives, or delivery milestones..."
                className="w-full px-3.5 py-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F6F4F0] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Project Changes'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
