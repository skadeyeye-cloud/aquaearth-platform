'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Download } from 'lucide-react';

export default function AuditLogPage() {
  const { auditLogs } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Audit Trail</h1>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-white/10 border border-black/[0.08] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl text-xs shadow-2xs transition-all active:scale-[0.96]">
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden border border-black/[0.06] dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 dark:bg-white/[0.03] border-b border-black/[0.05] dark:border-white/[0.06] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Timestamp (UTC+1)</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3 text-slate-400 dark:text-slate-500 font-mono text-[11px] tnum">
                    {log.timestamp}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                    {log.actorName}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-lg font-mono text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/10">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-semibold">
                    {log.targetType} {log.targetId && `(#${log.targetId})`}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
