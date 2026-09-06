'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ShieldCheck, 
  Award, 
  ExternalLink, 
  X,
  Lock,
  Sparkles,
  AlertOctagon,
  FileCheck2,
  Cpu,
  Layers
} from 'lucide-react';
import { NotificationCategory, NotificationItem } from '@/lib/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Category-Specific Color & Icon Tokens (Apple-grade Chromatic Palette)
const CATEGORY_THEMES: Record<NotificationCategory, {
  label: string;
  dotColor: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  cardBorderUnread: string;
  cardRingUnread: string;
  cardBgUnread: string;
  iconBg: string;
  iconColor: string;
  actionText: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  APPROVAL: {
    label: 'Leadership Gate',
    dotColor: 'bg-amber-500',
    pillBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    pillText: 'text-amber-700 dark:text-amber-300',
    pillBorder: 'border-amber-500/30',
    cardBorderUnread: 'border-amber-500/40 dark:border-amber-400/40',
    cardRingUnread: 'ring-1 ring-amber-500/20',
    cardBgUnread: 'bg-amber-500/[0.03] dark:bg-amber-500/[0.05]',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
    actionText: 'text-amber-700 dark:text-amber-400 hover:text-amber-800',
    icon: Lock
  },
  DEADLINE: {
    label: 'Critical Deadline',
    dotColor: 'bg-rose-500 animate-pulse',
    pillBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    pillText: 'text-rose-700 dark:text-rose-300',
    pillBorder: 'border-rose-500/30',
    cardBorderUnread: 'border-rose-500/40 dark:border-rose-400/40',
    cardRingUnread: 'ring-1 ring-rose-500/20',
    cardBgUnread: 'bg-rose-500/[0.03] dark:bg-rose-500/[0.05]',
    iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    iconColor: 'text-rose-600 dark:text-rose-400',
    actionText: 'text-rose-700 dark:text-rose-400 hover:text-rose-800',
    icon: AlertOctagon
  },
  QA_REVIEW: {
    label: 'QA / QC SLA',
    dotColor: 'bg-indigo-500',
    pillBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    pillText: 'text-indigo-700 dark:text-indigo-300',
    pillBorder: 'border-indigo-500/30',
    cardBorderUnread: 'border-indigo-500/40 dark:border-indigo-400/40',
    cardRingUnread: 'ring-1 ring-indigo-500/20',
    cardBgUnread: 'bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05]',
    iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    actionText: 'text-indigo-700 dark:text-indigo-400 hover:text-indigo-800',
    icon: FileCheck2
  },
  COMPLIANCE: {
    label: 'Statutory Permit',
    dotColor: 'bg-teal-500',
    pillBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    pillText: 'text-teal-700 dark:text-teal-300',
    pillBorder: 'border-teal-500/30',
    cardBorderUnread: 'border-teal-500/40 dark:border-teal-400/40',
    cardRingUnread: 'ring-1 ring-teal-500/20',
    cardBgUnread: 'bg-teal-500/[0.03] dark:bg-teal-500/[0.05]',
    iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    iconColor: 'text-teal-600 dark:text-teal-400',
    actionText: 'text-teal-700 dark:text-teal-400 hover:text-teal-800',
    icon: ShieldCheck
  },
  KPI_ALERT: {
    label: 'KPI Achievement',
    dotColor: 'bg-emerald-500',
    pillBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    pillText: 'text-emerald-700 dark:text-emerald-300',
    pillBorder: 'border-emerald-500/30',
    cardBorderUnread: 'border-emerald-500/40 dark:border-emerald-400/40',
    cardRingUnread: 'ring-1 ring-emerald-500/20',
    cardBgUnread: 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    actionText: 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800',
    icon: Award
  },
  SYSTEM: {
    label: 'Sovereign Node',
    dotColor: 'bg-sky-500',
    pillBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    pillText: 'text-sky-700 dark:text-sky-300',
    pillBorder: 'border-sky-500/30',
    cardBorderUnread: 'border-sky-500/40 dark:border-sky-400/40',
    cardRingUnread: 'ring-1 ring-sky-500/20',
    cardBgUnread: 'bg-sky-500/[0.03] dark:bg-sky-500/[0.05]',
    iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    iconColor: 'text-sky-600 dark:text-sky-400',
    actionText: 'text-sky-700 dark:text-sky-400 hover:text-sky-800',
    icon: Cpu
  }
};

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useAuth();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | NotificationCategory>('ALL');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (categoryFilter === 'ALL') return true;
    return n.category === categoryFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Sliding Notification Panel (Apple macOS / iPadOS Style, Fully Responsive) */}
      <div
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] max-w-full bg-white dark:bg-[#000000] border-l border-black/[0.08] dark:border-white/[0.12] shadow-2xl z-50 flex flex-col transition-transform duration-200 ease-out"
      >
        {/* Header */}
        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Notification Center</h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full tnum whitespace-nowrap shrink-0">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Color-graded operational telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-bold px-2 py-1 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Mark all as read"
              >
                Mark Read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close notification center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Segmented Filter Control with Category Badges */}
        <div className="p-3 border-b border-black/[0.04] dark:border-white/[0.08] overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max p-1 bg-slate-100 dark:bg-white/10 rounded-xl text-[11px] font-semibold">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'APPROVAL', label: 'Approvals', color: 'text-amber-600 dark:text-amber-400' },
              { id: 'DEADLINE', label: 'Deadlines', color: 'text-rose-600 dark:text-rose-400' },
              { id: 'QA_REVIEW', label: 'QA SLA', color: 'text-indigo-600 dark:text-indigo-400' },
              { id: 'COMPLIANCE', label: 'Permits', color: 'text-teal-600 dark:text-teal-400' },
              { id: 'KPI_ALERT', label: 'KPIs', color: 'text-emerald-600 dark:text-emerald-400' }
            ].map((tab) => {
              const isSelected = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected 
                      ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={isSelected ? '' : tab.color}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
          {filteredNotifs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500 space-y-2.5">
              <CheckCheck className="w-10 h-10 mx-auto opacity-40 text-emerald-500" />
              <div className="font-bold text-xs text-slate-700 dark:text-slate-300">All caught up!</div>
              <div className="text-[11px] max-w-xs mx-auto">No pending alerts in this category filter.</div>
            </div>
          ) : (
            filteredNotifs.map((item) => {
              const theme = CATEGORY_THEMES[item.category] || CATEGORY_THEMES.SYSTEM;
              const Icon = theme.icon;
              const isUnread = !item.isRead;

              return (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 relative cursor-pointer ${
                    isUnread
                      ? `${theme.cardBorderUnread} ${theme.cardRingUnread} ${theme.cardBgUnread} shadow-xs`
                      : 'bg-white/60 dark:bg-[#0a0a0c] border-black/[0.05] dark:border-white/[0.06] opacity-75'
                  }`}
                >
                  {/* Category Pill + Icon + Timestamp Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${theme.pillBg} ${theme.pillText} ${theme.pillBorder}`}>
                        {theme.label}
                      </span>
                      {isUnread && (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dotColor}`} />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tnum whitespace-nowrap shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description || item.message}
                    </p>
                  </div>

                  {/* Contextual Action Link */}
                  {(item.actionUrl || item.actionType) && (
                    <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                      <Link
                        href={item.actionUrl || '/workspace'}
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(item.id);
                          onClose();
                        }}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${theme.actionText}`}
                      >
                        <span>{item.actionLabel || 'Inspect Operational Record'}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>

                      {isUnread && (
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                          Click to dismiss
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
