'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { X, Send, Monitor, Wrench, ShoppingBag, Palette, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestIntakeModal({ isOpen, onClose }: Props) {
  const { createSupportTicket } = useAuth();
  const [category, setCategory] = useState<'IT_SUPPORT' | 'REPAIR' | 'PROCUREMENT' | 'DESIGN'>('IT_SUPPORT');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isTemplate, setIsTemplate] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    createSupportTicket({
      category,
      subject,
      description,
      priority,
      status: 'SUBMITTED',
      isTemplate: category === 'DESIGN' && isTemplate
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setDescription('');
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div
        className="relative bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] overflow-hidden z-10 text-xs max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Universal Request Intake
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Submit a Request</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors active:scale-[0.92] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Dispatched</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Your ticket has been logged and assigned to the relevant department lead with SLA timers activated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Category Cards (Apple Grid) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Request Routing Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'IT_SUPPORT', label: 'IT Support & Access', icon: Monitor, dept: 'Auto-routed to IT Lead' },
                  { id: 'REPAIR', label: 'Equipment Repair', icon: Wrench, dept: 'Auto-routed to Tech Ops' },
                  { id: 'PROCUREMENT', label: 'Procurement Approval', icon: ShoppingBag, dept: 'Auto-routed to Finance' },
                  { id: 'DESIGN', label: 'Creative & GIS Design', icon: Palette, dept: 'Auto-routed to Design Studio' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 active:scale-[0.98] cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm' 
                          : 'bg-slate-50 dark:bg-white/5 border-black/[0.06] dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`} />
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-600" />}
                      </div>
                      <div>
                        <div className="font-bold text-[11px] leading-tight">{item.label}</div>
                        <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>{item.dept}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Subject / Item Name</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Broken Garmin GPS Antenna / Replace ArcGIS Pro License"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Priority & Delivery Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Urgency Tier</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="LOW">Low (Routine)</option>
                  <option value="MEDIUM">Medium (Standard)</option>
                  <option value="HIGH">High (Within 24h)</option>
                  <option value="URGENT">Critical (Blocker)</option>
                </select>
              </div>

              {category === 'DESIGN' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Brand Template Request</label>
                  <div className="flex items-center h-9 px-3 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl gap-2">
                    <input
                      type="checkbox"
                      id="templateCheck"
                      checked={isTemplate}
                      onChange={(e) => setIsTemplate(e.target.checked)}
                      className="rounded accent-slate-900 dark:accent-white"
                    />
                    <label htmlFor="templateCheck" className="text-[11px] text-slate-600 dark:text-slate-300 select-none cursor-pointer">
                      Official AquaEarth Asset
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Detailed Description & Specifications</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the failure mode, part numbers, justification, or graphic requirements..."
                className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* SLA Alert Note */}
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-start gap-2 text-[11px] text-emerald-900 dark:text-emerald-300">
              <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <b>Standard SLA Turnaround:</b> IT requests are reviewed within 4 hours; high-priority field equipment repairs within 24 hours.
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-[0.96] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
