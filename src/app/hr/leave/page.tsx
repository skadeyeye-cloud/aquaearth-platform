'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LeaveItem } from '@/lib/types';

export default function LeaveManagementPage() {
  const { leaveRequests, updateLeaveStatus } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
          Module 9 • Time-Off Governance
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Staff Leave Approvals</h1>
        <p className="text-xs text-slate-500">
          Review time-off requests. Approved leave automatically updates resource availability in Project Management.
        </p>
      </div>

      {/* Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-medium">
              {leaveRequests.map((leave) => {
                const isPending = leave.status === 'PENDING';
                return (
                  <tr key={leave.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">{leave.userName}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.2 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-[11px] tnum">{leave.startDate} $\rightarrow$ {leave.endDate}</td>
                    <td className="px-5 py-3 font-bold text-slate-900 tnum">{leave.daysCount} d</td>
                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate text-[11px]">{leave.reason || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                        leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800' :
                        leave.status === 'REJECTED' ? 'bg-rose-50 text-rose-800' :
                        'bg-amber-50 text-amber-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-1.5">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => updateLeaveStatus(leave.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[10px] shadow-2xs active:scale-[0.96]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(leave.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold text-[10px] active:scale-[0.96]"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Logged</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
