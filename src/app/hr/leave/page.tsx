'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LeaveItem } from '@/lib/types';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Users,
  AlertCircle
} from 'lucide-react';
import { haptics } from '@/lib/haptics';

export default function LeaveManagementPage() {
  const { leaveRequests, updateLeaveStatus, currentUser, allUsers } = useAuth();
  const [filterMode, setFilterMode] = useState<'ALL' | 'DIRECT_REPORTS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const isHR = currentUser.functionalRole === 'HR_ADMIN' || currentUser.accessTier === 'SUPERADMIN';
  const isLineManager = currentUser.managementTier !== 'NONE';

  // Get direct report user IDs
  const directReportIds = allUsers.filter(u => u.managerId === currentUser.id).map(u => u.id);

  const displayedRequests = leaveRequests.filter(req => {
    if (filterMode === 'DIRECT_REPORTS' && !directReportIds.includes(req.userId)) {
      return false;
    }
    if (statusFilter !== 'ALL' && req.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleApprove = (leaveId: string) => {
    const comment = prompt('Optional approval note (e.g., Resource coverage confirmed):') || 'Approved in accordance with company policy.';
    updateLeaveStatus(leaveId, 'APPROVED', comment);
    haptics.success();
  };

  const handleReject = (leaveId: string) => {
    const comment = prompt('Enter reason for declining leave request:') || 'Declined due to project delivery schedules.';
    updateLeaveStatus(leaveId, 'REJECTED', comment);
    haptics.impact();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 9 • Time-Off & Capacity Governance
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Staff Leave Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dual approval workflow: HR and Line Managers can approve leave for direct reports, auto-stamping records with approver verification metadata.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          {isLineManager && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => { setFilterMode('ALL'); haptics.selection(); }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Requests ({leaveRequests.length})
              </button>
              <button
                onClick={() => { setFilterMode('DIRECT_REPORTS'); haptics.selection(); }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === 'DIRECT_REPORTS'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                My Direct Reports ({leaveRequests.filter(l => directReportIds.includes(l.userId)).length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); haptics.selection(); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Role: <strong className="text-slate-700 dark:text-slate-200">{currentUser.jobTitle}</strong> ({isHR ? 'HR Sign-off' : isLineManager ? 'Line Manager Sign-off' : 'Staff'})
        </div>
      </div>

      {/* Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-black/[0.05] dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Leave Type</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status & Approver</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-slate-800 font-medium">
              {displayedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No leave requests found in this view
                  </td>
                </tr>
              ) : (
                displayedRequests.map((leave) => {
                  const isPending = leave.status === 'PENDING';
                  const isDirectReport = directReportIds.includes(leave.userId);
                  const canAct = isHR || (isLineManager && isDirectReport);

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{leave.userName}</div>
                        {isDirectReport && (
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            ★ Direct Report
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-600 dark:text-slate-300">
                        {leave.userDepartment || 'Operations'}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono tnum">
                        {leave.startDate} &rarr; {leave.endDate}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white tnum">
                        {leave.daysCount} days
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate text-[11px]">
                        {leave.reason || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="space-y-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                            leave.status === 'REJECTED' ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                            'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {leave.status}
                          </span>
                          {leave.approvedByName && (
                            <div className="text-[10px] text-slate-400">
                              By <span className="font-semibold text-slate-600 dark:text-slate-300">{leave.approvedByName}</span> ({leave.approverRole || 'Manager'}) on {leave.approvalDate}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right space-x-1.5">
                        {isPending ? (
                          canAct ? (
                            <>
                              <button
                                onClick={() => handleApprove(leave.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-2xs active:scale-[0.96] transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(leave.id)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg font-bold text-[10px] border border-rose-200 dark:border-rose-800 active:scale-[0.96] transition-all"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Pending line manager</span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[10px] font-mono">Logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
