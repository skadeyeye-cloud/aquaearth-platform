'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Laptop, CheckCircle2, ShieldCheck, Tag, Cpu, MapPin, Calendar, Hash } from 'lucide-react';
import { HardwareAsset } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface NewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAssetModal({ isOpen, onClose }: NewAssetModalProps) {
  const { createHardwareAsset, allUsers } = useAuth();

  const [assetTag, setAssetTag] = useState(`AE-HW-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HardwareAsset['category']>('LAPTOP');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('Lagos HQ - Central IT Storage');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState<NonNullable<HardwareAsset['condition']>>('EXCELLENT');
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assetTag.trim()) return;

    setIsSubmitting(true);
    haptics.impact();

    const selectedStaff = allUsers.find(u => u.id === assignedUserId);

    createHardwareAsset({
      assetTag: assetTag.trim().toUpperCase(),
      name: name.trim(),
      category,
      serialNumber: serialNumber.trim() || undefined,
      assignedToId: selectedStaff?.id,
      assignedToName: selectedStaff ? selectedStaff.name : 'Unassigned',
      assignedToDept: selectedStaff?.departmentName || 'IT Inventory',
      purchaseDate,
      status: selectedStaff ? 'OPERATIONAL' : 'IN_STORAGE',
      location: location.trim(),
      condition
    });

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
          className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-black/[0.08] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Provision New Hardware Asset</h3>
                <p className="text-[11px] text-slate-500">Register device into corporate IT & field asset registry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Asset Tag */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Asset Tag / ID *
                </label>
                <input
                  type="text"
                  required
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder="AE-HW-2026-001"
                  className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HardwareAsset['category'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="LAPTOP">Corporate Laptop / Workstation</option>
                  <option value="SURVEY_DGPS">Survey DGPS & GNSS Receiver</option>
                  <option value="DRONE">Aerial Drone / LiDAR Unit</option>
                  <option value="WATER_PROBE">Multi-parameter Water Probe</option>
                  <option value="SERVER_NODE">Remote Starlink & Edge Server</option>
                </select>
              </div>
            </div>

            {/* Model Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Make, Model & Specifications *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dell Latitude 5440 Core i7 32GB RAM 1TB SSD"
                className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Serial Number */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  Serial Number (S/N)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. 5CD2391KL8"
                  className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Physical Location */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Primary / Current Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Lagos HQ - IT Safe"
                  className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Purchase / In-service Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Commission Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Hardware Condition */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Hardware Physical Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as NonNullable<HardwareAsset['condition']>)}
                  className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="EXCELLENT">Brand New / Mint Condition</option>
                  <option value="GOOD">Good (Minor cosmetic wear)</option>
                  <option value="FAIR">Fair (Field tested / functional)</option>
                  <option value="MAINTENANCE_REQUIRED">Requires Inspection / Calibration</option>
                </select>
              </div>
            </div>

            {/* Initial Assignment */}
            <div className="pt-2 border-t border-black/[0.05]">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Initial Custodian Assignment (Optional)
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Keep in IT Stock / Central Inventory --</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.departmentName} - {user.jobTitle})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                If unassigned, the asset will be logged with status <span className="font-mono text-slate-600 font-bold">IN_STORAGE</span> and can be allocated later.
              </p>
            </div>

            {/* Footer buttons */}
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
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.96] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Register Device</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
