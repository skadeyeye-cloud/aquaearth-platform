'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Laptop, Calendar, User, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { HardwareAsset } from '@/lib/types';

interface AssetHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: HardwareAsset | null;
}

export function AssetHistoryModal({ isOpen, onClose, asset }: AssetHistoryModalProps) {
  if (!isOpen || !asset) return null;

  const history = asset.history || [];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ASSIGNED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RETRIEVED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MAINTENANCE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
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
          className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-black/[0.08] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Chain-of-Custody History Log
                </h3>
                <p className="text-[11px] text-slate-500">
                  Immutable lifecycle and audit events for asset {asset.assetTag}
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

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Device Summary Box */}
            <div className="p-4 bg-slate-50 border border-black/[0.06] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {asset.assetTag}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {asset.category.replace('_', ' ')}
                </span>
              </div>
              <div className="font-bold text-sm text-slate-900">{asset.name}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400">Current Status:</span>{' '}
                  <span className="font-semibold text-slate-800">{asset.status}</span>
                </div>
                <div>
                  <span className="text-slate-400">Custodian:</span>{' '}
                  <span className="font-semibold text-slate-800">{asset.assignedToName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Location:</span>{' '}
                  <span className="font-semibold text-slate-800">{asset.location}</span>
                </div>
                {asset.serialNumber && (
                  <div>
                    <span className="text-slate-400">S/N:</span>{' '}
                    <span className="font-mono text-slate-700">{asset.serialNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Events */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Lifecycle Events ({history.length})
              </div>

              {history.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No historical lifecycle events recorded yet for this asset.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {history.map((event, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-500" />

                      <div className="bg-white p-3.5 rounded-2xl border border-black/[0.06] shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getActionBadge(event.action)}`}>
                            {event.action}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {event.date}
                          </span>
                        </div>

                        <div className="text-xs text-slate-800 font-medium">
                          {event.notes || 'Status updated'}
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-black/[0.04]">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Staff / Operator: <strong className="text-slate-600">{event.staffName}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-black/[0.05] bg-slate-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              Close History
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
