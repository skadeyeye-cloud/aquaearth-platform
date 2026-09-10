'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PhoneCall, Users, ShieldAlert, CheckCircle2, Clock, Calendar, FileText } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface LogBdActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOpportunityId?: string;
  defaultClientName?: string;
}

export function LogBdActivityModal({
  isOpen,
  onClose,
  defaultOpportunityId,
  defaultClientName
}: LogBdActivityModalProps) {
  const { opportunities, clients, logBdActivityWithApproval, currentUser, allUsers } = useAuth();

  const [oppId, setOppId] = useState(defaultOpportunityId || opportunities[0]?.id || '');
  const [type, setType] = useState<'CALL' | 'MEETING'>('MEETING');
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState(defaultClientName || clients[0]?.name || '');
  const [summary, setSummary] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0] + ' 10:00');
  const [durationMins, setDurationMins] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize client name if opportunity selection changes
  const handleOppChange = (newOppId: string) => {
    setOppId(newOppId);
    const opp = opportunities.find(o => o.id === newOppId);
    if (opp) {
      setClientName(opp.clientName);
    }
  };

  const lineManager = allUsers.find(u => u.id === currentUser.managerId) || allUsers.find(u => u.managementTier === 'LINE_MANAGER' || u.managementTier === 'DEPT_HEAD') || allUsers[0];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !clientName.trim()) return;

    setIsSubmitting(true);
    haptics.impact();

    logBdActivityWithApproval({
      opportunityId: oppId,
      title: title.trim() || `${type === 'CALL' ? 'Phone/Video Call' : 'Stakeholder Meeting'} with ${clientName}`,
      type,
      clientName: clientName.trim(),
      summary: summary.trim(),
      scheduledDate,
      durationMins: Number(durationMins)
    });

    haptics.success();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-700/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                {type === 'CALL' ? <PhoneCall className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Log BD Call / Meeting</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Creates a verification task for line manager approval</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Governance Notice */}
          <div className="mx-6 mt-5 p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-bold">Manager Approval Workflow:</span> BD activity logs for calls and meetings require verification from your line manager (<span className="font-semibold">{lineManager.name}</span>). Once submitted, an approval task is routed automatically to their task inbox.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setType('CALL'); haptics.selection(); }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'CALL'
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Phone / Video Call</span>
              </button>
              <button
                type="button"
                onClick={() => { setType('MEETING'); haptics.selection(); }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'MEETING'
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Client Meeting</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Related Opportunity / RFP</label>
              <select
                value={oppId}
                onChange={e => handleOppChange(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {opportunities.map(opp => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Client / Counterparty Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Chevron Nigeria Limited"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date & Time</label>
                <input
                  type="text"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  placeholder="YYYY-MM-DD HH:MM"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
                <input
                  type="number"
                  value={durationMins}
                  onChange={e => setDurationMins(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Executive Discussion Summary & Next Steps <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Outline discussion points, commercial inquiries, scope requirements, and action items agreed with the client..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Routing for Approval...' : 'Submit for Line Manager Approval'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
