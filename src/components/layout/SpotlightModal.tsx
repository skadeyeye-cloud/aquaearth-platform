'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import {
  Search,
  LayoutGrid,
  CheckCircle2,
  CalendarCheck,
  Compass,
  BarChart3,
  Award,
  Briefcase,
  Users,
  FolderKanban,
  Smartphone,
  FileText,
  ShieldCheck,
  HardDrive,
  Layers,
  Receipt,
  UserCheck,
  Shield,
  ArrowRight,
  Command,
  CornerDownLeft,
  X
} from 'lucide-react';

interface ModuleItem {
  id: string;
  name: string;
  section: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const MODULES: ModuleItem[] = [
  { id: 'workspace', name: 'My Workspace', section: 'Workspace', href: '/workspace', icon: LayoutGrid, description: 'Aggregated tasks, fast requests, and leave tracking', badge: 'All' },
  { id: 'tasks', name: 'My Tasks & Workflows', section: 'Workspace', href: '/tasks', icon: CheckCircle2, description: 'Task execution, approvals, and KPI milestone scoring', badge: 'Workflow' },
  { id: 'attendance', name: 'Daily Attendance Radar', section: 'Workspace', href: '/hr/attendance', icon: CalendarCheck, description: 'WAT clock-in, geofence stations, and punctuality bonus', badge: '+10 KPI' },
  { id: 'directory', name: 'Staff Directory', section: 'Workspace', href: '/directory', icon: Compass, description: 'Colleague directory, skills, and emergency dispatch' },
  { id: 'analytics', name: 'Command & Analytics', section: 'Executive Intelligence', href: '/analytics', icon: BarChart3, description: 'Real-time financial telemetry, cashflow, and Board pack', badge: 'Live Digest' },
  { id: 'kpi', name: 'KPI Leaderboard', section: 'Executive Intelligence', href: '/kpi/leaderboard', icon: Award, description: 'Company-wide performance rankings, tiers, and trophy badges' },
  { id: 'bd', name: 'BD & Tendering Pipeline', section: 'Commercial Engine', href: '/bd/pipeline', icon: Briefcase, description: 'Kanban opportunities, win/loss stats, and Managing Consultant gate', badge: 'Pipeline' },
  { id: 'crm', name: 'Client & Stakeholder CRM', section: 'Commercial Engine', href: '/crm/accounts', icon: Users, description: 'Commercial clients, statutory regulators, and engagement logs' },
  { id: 'projects', name: 'Projects & Milestones', section: 'Project Delivery & Field', href: '/projects', icon: FolderKanban, description: 'Active portfolio, AI PRD scope parser, and Gantt charts', badge: 'AI Parser' },
  { id: 'field', name: 'Field Data Capture', section: 'Project Delivery & Field', href: '/field/capture', icon: Smartphone, description: 'Offline sampling, RTK GPS lock, and photo watermarking', badge: 'Offline' },
  { id: 'documents', name: 'Documents & Repository', section: 'Quality & Governance', href: '/documents', icon: FileText, description: 'Deliverables vault, templates, and automated draft watermarking', badge: 'Vault' },
  { id: 'qa', name: 'QA/QC Technical Review', section: 'Quality & Governance', href: '/qa', icon: CheckCircle2, description: '4-stage review chain, 48h SLA timers, and cryptographic certificate', badge: 'Hard Gate' },
  { id: 'compliance', name: 'Regulatory & Compliance', section: 'Quality & Governance', href: '/compliance', icon: ShieldCheck, description: 'FMEnv, NESREA, NUPRC permits, and triennial audit tracker', badge: 'FMEnv/NESREA' },
  { id: 'vault', name: 'AquaEarth Sovereign Vault', section: 'Quality & Governance', href: '/vault', icon: HardDrive, description: 'Encrypted cold archival, client download logs, and audit trails', badge: 'Sovereign' },
  { id: 'it-design', name: 'IT & Design Ops Studio', section: 'Operational Support', href: '/operations/it-design', icon: Layers, description: 'Hardware assets, SIM pools, and 24-hour rush design queue', badge: '24h Rush' },
  { id: 'finance', name: 'Milestone Finance & Invoicing', section: 'Operational Support', href: '/finance', icon: Receipt, description: 'Milestone billing, 7.5% VAT, 5% WHT, and FIRS credit notes', badge: 'WHT/VAT' },
  { id: 'admin', name: 'Admin Overview', section: 'Administration', href: '/admin', icon: Shield, description: 'System security, role-based scoping, and audit logs', badge: 'Command' },
];

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotlightModal({ isOpen, onClose }: SpotlightModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredModules = MODULES.filter(m => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.section.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      haptics.impact();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredModules.length - 1 ? prev + 1 : 0));
        haptics.selection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredModules.length - 1));
        haptics.selection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredModules[selectedIndex]) {
          handleSelect(filteredModules[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredModules, selectedIndex]);

  const handleSelect = (item: ModuleItem) => {
    haptics.selection();
    onClose();
    router.push(item.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Spotlight Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-xl bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.14] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
          >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
            <Search className="w-5 h-5 text-emerald-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to module, page, or service line..."
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-black/[0.06] dark:border-white/[0.08]">
              ESC
            </kbd>
          </div>

          {/* Module List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredModules.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching modules or pages found for &quot;{query}&quot;
              </div>
            ) : (
              filteredModules.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 text-white shadow-sm' 
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                            • {item.section}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-black/[0.05] dark:border-white/[0.08] whitespace-nowrap">
                          {item.badge}
                        </span>
                      )}
                      {isSelected ? (
                        <CornerDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#08080a] border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 select-none">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-white/10 border border-black/[0.08] dark:border-white/[0.1] text-[9px] font-mono">↑↓</kbd> Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-white/10 border border-black/[0.08] dark:border-white/[0.1] text-[9px] font-mono">↵</kbd> Select
              </span>
            </div>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              AquaEarth Quick Navigation
            </span>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
