'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertOctagon, CheckCircle2, ShieldAlert, Calendar, Clock, User } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface StaffQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStaffId?: string;
}

export function StaffQueryModal({ isOpen, onClose, defaultStaffId }: StaffQueryModalProps) {
  const { allUsers, currentUser, raiseStaffQuery } = useAuth();

  const [staffId, setStaffId] = useState(defaultStaffId || allUsers[1]?.id || '');
  const [title, setTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [responseDeadline, setResponseDeadline] = useState('48 Hours (by ' + new Date(Date.now() + 172800000).toISOString().split('T')[0] + ')');
  const [allegationDetails, setAllegationDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetStaff = allUsers.find(u => u.id === staffId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !allegationDetails.trim() || !targetStaff) return;

    setIsSubmitting(true);
    haptics.impact();

    raiseStaffQuery({
      staffId: targetStaff.id,
      staffName: targetStaff.name,
      staffDepartment: targetStaff.departmentName || 'Operations',
      issuedById: currentUser.id,
      issuedByName: currentUser.name,
      title: title.trim(),
      allegationDetails: allegationDetails.trim(),
      incidentDate,
      responseDeadline
    });

    haptics.success();
    setIsSubmitting(false);
    setTitle('');
    setAllegationDetails('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between bg-rose-50/50 dark:bg-[#121214]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Issue Disciplinary Staff Query</h3>
                <p className="text-xs text-slate-500 dark:text-[#A39E93]">Formal institutional query under HR regulations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#D1CDC7]">Target Staff Member</label>
              <select
                value={staffId}
                onChange={e => setStaffId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#141416] text-slate-900 dark:text-[#F6F4F0] font-medium"
              >
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle} ({u.departmentName || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#D1CDC7]">
                Query Subject / Violation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Unexcused absence from Escravos mobilization, Violation of HSE safety code"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#141416] text-slate-900 dark:text-[#F6F4F0] placeholder:text-slate-400 dark:placeholder:text-[#8E8E93] focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D1CDC7]">Incident Date</label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#141416] text-slate-900 dark:text-[#F6F4F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#D1CDC7]">Response Deadline</label>
                <input
                  type="text"
                  required
                  value={responseDeadline}
                  onChange={e => setResponseDeadline(e.target.value)}
                  placeholder="e.g. 48 Hours, 2026-09-12"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#141416] text-slate-900 dark:text-[#F6F4F0]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#D1CDC7]">
                Detailed Allegations & Particulars <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={allegationDetails}
                onChange={e => setAllegationDetails(e.target.value)}
                placeholder="Detail the facts of the incident, specific regulations or clauses breached, and evidence submitted..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#141416] text-slate-900 dark:text-[#F6F4F0] placeholder:text-slate-400 dark:placeholder:text-[#8E8E93] focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#D1CDC7] hover:bg-slate-100 dark:hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Issuing Query...' : 'Issue Formal Query'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
