'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Archive, AlertCircle, CheckCircle2 } from 'lucide-react';
import { HardwareAsset } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface RetrieveAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: HardwareAsset | null;
}

export function RetrieveAssetModal({ isOpen, onClose, asset }: RetrieveAssetModalProps) {
  const { retrieveHardwareAsset } = useAuth();

  const [reasonCategory, setReasonCategory] = useState('PROJECT_COMPLETED');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    haptics.impact();

    const fullReason = `${reasonCategory.replace('_', ' ')}: ${details.trim() || 'Returned in functional condition to IT inventory'}`;
    retrieveHardwareAsset(asset.id, fullReason);

    setIsSubmitting(false);
    onClose();
  };

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
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Retrieve Asset to IT Stock
                </h3>
                <p className="text-[11px] text-slate-500">
                  De-assign device from custodian and return to central inventory
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
            {/* Device Snapshot */}
            <div className="p-3.5 bg-slate-50 border border-black/[0.06] rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-700">
                  {asset.assetTag}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Current Custodian: {asset.assignedToName}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900">{asset.name}</div>
              <div className="text-[10px] text-slate-400">{asset.assignedToDept} • {asset.location}</div>
            </div>

            {/* Retrieval Reason */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reason for Equipment Return *
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="PROJECT_COMPLETED">Field Assignment / Project Demobilization</option>
                <option value="DEVICE_UPGRADE">Hardware Refresh / Upgrade Replacement</option>
                <option value="DEFECT_REPAIR">Technical Fault / Sent for Diagnostics</option>
                <option value="STAFF_OFFBOARDING">Staff Transition / Leave / Offboarding</option>
                <option value="PERIODIC_AUDIT">Routine IT Physical Inspection</option>
              </select>
            </div>

            {/* Verification / Condition Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Physical Inspection & Return Notes
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Verify screen, casing, battery health, and return of peripheral accessories..."
                className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>

            {/* Notice */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                The asset status will immediately revert to <span className="font-mono font-bold">IN_STORAGE</span> and an immutable chain-of-custody audit record will be logged.
              </span>
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.96] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Retrieval</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
