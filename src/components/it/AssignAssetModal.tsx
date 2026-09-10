'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, CheckCircle2, Laptop, ArrowRight } from 'lucide-react';
import { HardwareAsset } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface AssignAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: HardwareAsset | null;
}

export function AssignAssetModal({ isOpen, onClose, asset }: AssignAssetModalProps) {
  const { assignHardwareAsset, allUsers } = useAuth();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    setIsSubmitting(true);
    haptics.impact();

    assignHardwareAsset(asset.id, selectedStaffId, notes.trim());

    setIsSubmitting(false);
    onClose();
  };

  const isReassignment = !!asset.assignedToId && asset.assignedToName !== 'Unassigned';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {isReassignment ? 'Reassign Hardware Asset' : 'Assign Hardware Asset'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Update equipment custody and transfer physical responsibility
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Device Info Badge */}
            <div className="p-3.5 bg-slate-50 border border-black/[0.06] rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {asset.assetTag}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {asset.category.replace('_', ' ')}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900">{asset.name}</div>
              {asset.serialNumber && (
                <div className="text-[10px] text-slate-400 font-mono">S/N: {asset.serialNumber}</div>
              )}
              {isReassignment && (
                <div className="pt-2 border-t border-black/[0.04] text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="text-slate-400">Current Custodian:</span>
                  <span className="font-semibold text-slate-800">{asset.assignedToName}</span>
                  <span className="text-slate-400">({asset.assignedToDept})</span>
                </div>
              )}
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Select New Custodian / Staff Member *
              </label>
              <select
                required
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Choose employee --</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.departmentName} - {user.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            {/* Handover Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Handover Notes / Verification Details
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Issued with power adapter, HDMI cable, and rugged field bag. Hardware inspection passed."
                className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-black/[0.05] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedStaffId}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.96] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Handover</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
