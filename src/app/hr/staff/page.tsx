'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserProfile, QueryResolution, PayrollRecord } from '@/lib/types';
import { 
  Award, 
  Download, 
  Upload, 
  CheckCircle2, 
  Users,
  ChevronRight,
  ExternalLink,
  Plus,
  UserPlus,
  AlertOctagon,
  DollarSign,
  UserX,
  UserCheck,
  Check,
  XCircle,
  FileText,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import CsvStaffImporterModal from '@/components/directory/CsvStaffImporterModal';
import StaffProfileDrawer from '@/components/directory/StaffProfileDrawer';
import { NewEmployeeModal } from '@/components/hr/NewEmployeeModal';
import { StaffQueryModal } from '@/components/hr/StaffQueryModal';

export default function HRStaffPage() {
  const { 
    allUsers, 
    certifications, 
    projects, 
    suspendEmployee, 
    reactivateEmployee,
    staffQueries,
    respondToStaffQuery,
    resolveStaffQuery,
    payrollRecords,
    updatePayrollRecord,
    currentUser
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'STAFF' | 'QUERIES' | 'PAYROLL' | 'CERTS' | 'QUARTERLY_REPORT'>('STAFF');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [isNewQueryOpen, setIsNewQueryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const isHR = currentUser.functionalRole === 'HR_ADMIN' || currentUser.accessTier === 'SUPERADMIN';

  const handleSuspendStaff = (user: UserProfile) => {
    const reason = prompt(`Enter reason for suspending ${user.name}:`, 'Pending formal disciplinary query investigation');
    if (reason) {
      suspendEmployee(user.id, reason);
      haptics.impact();
    }
  };

  const handleReactivateStaff = (user: UserProfile) => {
    reactivateEmployee(user.id);
    haptics.success();
  };

  const handleExportRoster = () => {
    haptics.selection();
    const headers = 'Full Name,Email,Job Title,Department,Functional Role,Access Tier,Management Tier,Manager Name,Phone,Location,Status';
    const rows = allUsers.map(u => {
      const cleanName = `"${u.name.replace(/"/g, '""')}"`;
      const cleanTitle = `"${u.jobTitle.replace(/"/g, '""')}"`;
      const cleanDept = `"${(u.departmentName || 'Operations').replace(/"/g, '""')}"`;
      return `${cleanName},${u.email},${cleanTitle},${cleanDept},${u.functionalRole},${u.accessTier},${u.managementTier},"${u.managerName || ''}",${u.phone || ''},"${u.location || ''}",${u.status}`;
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aquaearth_hr_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 tracking-tight">
              Module 9 • Human Resources & Competency
            </span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
              Enterprise HR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Human Capital & Staff Operations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Employee provisioning, disciplinary queries, shared payroll ledger, and professional competency credentials.
          </p>
        </div>

        {/* Tab Controls & Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isHR && (
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setIsNewEmployeeOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Employee</span>
            </button>
          )}

          {activeTab === 'QUERIES' && isHR && (
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setIsNewQueryOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Issue Staff Query</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 shadow-2xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Apple-Style Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => { haptics.selection(); setActiveTab('STAFF'); }}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'STAFF' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Staff Roster ({allUsers.length})
        </button>

        <button
          type="button"
          onClick={() => { haptics.selection(); setActiveTab('QUERIES'); }}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'QUERIES' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Disciplinary Queries ({staffQueries.length})</span>
          {staffQueries.filter(q => q.status !== 'RESOLVED').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => { haptics.selection(); setActiveTab('PAYROLL'); }}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'PAYROLL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Payroll & Benefits ({payrollRecords.length})
        </button>

        <button
          type="button"
          onClick={() => { haptics.selection(); setActiveTab('CERTS'); }}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'CERTS' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Certifications ({certifications.length})
        </button>

        <button
          type="button"
          onClick={() => { haptics.selection(); setActiveTab('QUARTERLY_REPORT'); }}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'QUARTERLY_REPORT' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Auto HR Report
        </button>
      </div>

      {/* Tab 1: Staff */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Workforce Directory ({allUsers.length} staff members)
            </div>
            <button
              type="button"
              onClick={handleExportRoster}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-black/[0.05] dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Reporting Line</th>
                    <th className="px-5 py-3">Role & Tiers</th>
                    <th className="px-5 py-3">Account Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-slate-800 font-medium">
                  {allUsers.map((user) => {
                    const isSuspended = (user.status as string) === 'SUSPENDED' || (user.status as string) === 'DEACTIVATED';

                    return (
                      <tr 
                        key={user.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div 
                            onClick={() => { haptics.selection(); setSelectedUser(user); }}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <img
                              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={user.name}
                              className="w-8 h-8 rounded-xl object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.1]"
                            />
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                {user.name}
                              </div>
                              <div className="text-[10px] text-slate-400">{user.jobTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300 text-[11px]">{user.departmentName || 'Operations'}</td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300 text-[11px]">
                          {user.managerName ? `Reports to ${user.managerName}` : 'Executive Leadership'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 ${
                            user.functionalRole === 'MANAGING_CONSULTANT' || user.accessTier === 'SUPERADMIN'
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                              : user.managementTier === 'DEPT_HEAD'
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                                : user.managementTier === 'TEAM_LEAD'
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {user.functionalRole === 'MANAGING_CONSULTANT' ? 'EXECUTIVE' : user.managementTier.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isSuspended 
                              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right space-x-2">
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleReactivateStaff(user)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSuspendStaff(user)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg text-[10px] font-bold border border-rose-200 dark:border-rose-800 transition-all active:scale-95"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => { haptics.selection(); setSelectedUser(user); }}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-semibold"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Disciplinary Queries */}
      {activeTab === 'QUERIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Institutional Queries & Disciplinary Hearings ({staffQueries.length} records)
            </div>
            <div className="text-[11px] text-slate-500">
              Resolved as Proceeding to Panel, Formal Warning, or Cancelled
            </div>
          </div>

          <div className="space-y-3">
            {staffQueries.map((query) => {
              const isResolved = query.status === 'RESOLVED';
              const hasResponse = !!query.staffResponse;

              return (
                <div key={query.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                        {query.queryNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{query.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isResolved 
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                          : hasResponse 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {query.status}
                      </span>
                      {query.resolution && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          query.resolution === 'FORMAL_WARNING'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : query.resolution === 'PROCEEDING'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          Resolution: {query.resolution}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <div>Staff Member: <strong className="text-slate-800 dark:text-slate-200">{query.staffName}</strong> ({query.staffDepartment})</div>
                    <div>Issued By: <strong className="text-slate-800 dark:text-slate-200">{query.issuedByName}</strong> on {query.issuedDate}</div>
                    <div>Response Deadline: <strong className="text-rose-600 dark:text-rose-400">{query.responseDeadline}</strong></div>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">Allegations: </strong>{query.allegationDetails}
                  </div>

                  {/* Staff Response Section */}
                  {query.staffResponse ? (
                    <div className="p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-1 text-xs">
                      <div className="font-bold text-blue-900 dark:text-blue-300">Staff Official Response ({query.respondedAt}):</div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{query.staffResponse}"</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 text-xs text-slate-500">
                      <span>No staff formal reply submitted yet.</span>
                      <button
                        onClick={() => {
                          const reply = prompt(`Enter employee formal defense response for query ${query.queryNumber}:`);
                          if (reply) {
                            respondToStaffQuery(query.id, reply);
                            haptics.success();
                          }
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-[11px]"
                      >
                        Submit Response
                      </button>
                    </div>
                  )}

                  {/* Resolution Controls for HR */}
                  {!isResolved && isHR && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        HR Committee Disposition:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const notes = prompt('Enter resolution particulars for Proceeding to Disciplinary Panel:') || 'Referred to Disciplinary Committee for full inquiry.';
                            resolveStaffQuery(query.id, 'PROCEEDING', notes);
                            haptics.impact();
                          }}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[10px] font-bold border border-purple-200"
                        >
                          Proceed to Panel
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Enter grounds for Formal Warning issued:') || 'First written warning issued into employee HR dossier.';
                            resolveStaffQuery(query.id, 'FORMAL_WARNING', notes);
                            haptics.impact();
                          }}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold border border-rose-200"
                        >
                          Issue Formal Warning
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Enter cancellation justification:') || 'Explanations satisfactory; query rescinded.';
                            resolveStaffQuery(query.id, 'CANCELLED', notes);
                            haptics.success();
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold border border-emerald-200"
                        >
                          Cancel / Exonerate
                        </button>
                      </div>
                    </div>
                  )}

                  {isResolved && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                      Resolved on <strong>{query.resolvedAt}</strong> by <strong>{query.resolvedByName}</strong>. Outcome: <span className="font-semibold text-slate-800 dark:text-slate-200">{query.resolutionNotes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Payroll, Bonuses & Benefits */}
      {activeTab === 'PAYROLL' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="apple-glass-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Net Payroll (Sept 2026)</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">
                ₦{(payrollRecords.reduce((acc, curr) => acc + curr.netPayNgn, 0) / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-slate-500">{payrollRecords.length} staff records</div>
            </div>

            <div className="apple-glass-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Hazard & Field Per Diem</div>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tnum">
                ₦{(payrollRecords.reduce((acc, curr) => acc + curr.hazardAllowanceNgn + curr.fieldPerDiemNgn, 0) / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-slate-500">Offshore & field allowances</div>
            </div>

            <div className="apple-glass-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Performance Bonuses</div>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tnum">
                ₦{(payrollRecords.reduce((acc, curr) => acc + curr.performanceBonusNgn, 0) / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-slate-500">KPI excellence bonuses</div>
            </div>

            <div className="apple-glass-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">PAYE Tax & Pension</div>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tnum">
                ₦{(payrollRecords.reduce((acc, curr) => acc + curr.taxPayeNgn + curr.pensionDeductionNgn, 0) / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-slate-500">Remitted to FIRS & PFA</div>
            </div>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-black/[0.05] dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Staff Name</th>
                    <th className="px-5 py-3">Job Title & Dept</th>
                    <th className="px-5 py-3 text-right">Base Salary</th>
                    <th className="px-5 py-3 text-right">Hazard / Per Diem</th>
                    <th className="px-5 py-3 text-right">Bonus</th>
                    <th className="px-5 py-3 text-right">Tax & Pension</th>
                    <th className="px-5 py-3 text-right">Net Payable</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-slate-800 font-medium">
                  {payrollRecords.map((p) => {
                    const isDisbursed = p.paymentStatus === 'DISBURSED';
                    const isApproved = p.paymentStatus === 'APPROVED';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{p.staffName}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <div>{p.jobTitle}</div>
                          <div className="text-[10px] text-slate-400">{p.department}</div>
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 tnum">
                          ₦{p.baseSalaryNgn.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-amber-700 dark:text-amber-400 tnum">
                          +₦{(p.hazardAllowanceNgn + p.fieldPerDiemNgn).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-purple-700 dark:text-purple-400 tnum">
                          +₦{p.performanceBonusNgn.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-rose-700 dark:text-rose-400 tnum">
                          -₦{(p.taxPayeNgn + p.pensionDeductionNgn).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-extrabold text-slate-900 dark:text-white text-xs tnum">
                          ₦{p.netPayNgn.toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDisbursed
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                              : isApproved
                              ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right space-x-1.5">
                          {!isDisbursed && (
                            <button
                              onClick={() => {
                                const nextStatus = isApproved ? 'DISBURSED' : 'APPROVED';
                                updatePayrollRecord({
                                  ...p,
                                  paymentStatus: nextStatus
                                });
                                haptics.success();
                              }}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95"
                            >
                              {isApproved ? 'Mark Disbursed' : 'Approve'}
                            </button>
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
      )}

      {/* Tab 4: Certifications */}
      {activeTab === 'CERTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certifications.map((cert) => {
            const isImpending = cert.daysUntilExpiry <= 30;
            return (
              <motion.div 
                whileHover={{ y: -2 }}
                key={cert.id} 
                className="apple-glass-card p-5 rounded-3xl space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-700 dark:text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full tnum ${
                    isImpending ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {cert.daysUntilExpiry} days left
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">{cert.name}</h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Holder: <b>{cert.userName}</b></div>
                  <div className="text-[10px] text-slate-400">{cert.issuingBody} • {cert.certNumber || 'Active'}</div>
                </div>

                <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
                  <span>Expiry: <b className="text-slate-600 dark:text-slate-300 tnum">{cert.expiryDate}</b></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tab 5: Report */}
      {activeTab === 'QUARTERLY_REPORT' && (
        <div className="apple-glass-card p-8 rounded-3xl space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">FR 98 Automated Assembly</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Q3 2026 HR & Resource Allocation Report</h2>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-xs active:scale-[0.96] cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div className="p-4 bg-slate-50/70 dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
              <div className="text-2xl font-black text-slate-900 dark:text-white tnum">{allUsers.length}</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Staff Headcount</div>
            </div>
            <div className="p-4 bg-slate-50/70 dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
              <div className="text-2xl font-black text-emerald-600 tnum">86.4%</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Billable Utilization</div>
            </div>
            <div className="p-4 bg-slate-50/70 dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
              <div className="text-2xl font-black text-blue-600 tnum">100%</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Certs in Good Standing</div>
            </div>
            <div className="p-4 bg-slate-50/70 dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
              <div className="text-2xl font-black text-purple-600 tnum">8</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Approved Leave Days</div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Profile Drawer */}
      <StaffProfileDrawer
        user={selectedUser}
        allUsers={allUsers}
        projects={projects}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      {/* Bulk Importer Modal */}
      <CsvStaffImporterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* New Employee Modal */}
      <NewEmployeeModal
        isOpen={isNewEmployeeOpen}
        onClose={() => setIsNewEmployeeOpen(false)}
      />

      {/* Staff Query Modal */}
      <StaffQueryModal
        isOpen={isNewQueryOpen}
        onClose={() => setIsNewQueryOpen(false)}
      />
    </div>
  );
}
