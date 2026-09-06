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
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 14 • Security & Audit
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Platform Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Cryptographic, tamper-evident log of account actions, permission changes, and QA sign-offs.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/[0.08] hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-2xs transition-all active:scale-[0.96]">
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Timestamp (UTC+1)</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="px-5 py-3 text-slate-400 font-mono text-[11px] tnum">
                    {log.timestamp}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    {log.actorName}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.2 rounded font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 border border-black/[0.06]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 font-semibold">
                    {log.targetType} {log.targetId && `(#${log.targetId})`}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
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
