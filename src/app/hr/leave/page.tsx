'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LeaveItem, UserProfile } from '@/lib/types';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Users,
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  AlertTriangle,
  User,
  Info,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

export default function LeaveManagementPage() {
  const { 
    leaveRequests, 
    updateLeaveStatus, 
    submitLeaveRequest, 
    currentUser, 
    allUsers 
  } = useAuth();

  // Role Scoping Flags
  const isSuperAdmin = 
    currentUser.accessTier === 'SUPERADMIN' || 
    currentUser.functionalRole === 'SUPERADMIN' || 
    currentUser.functionalRole === 'MANAGING_CONSULTANT' || 
    currentUser.functionalRole === 'DEPUTY_MANAGING_CONSULTANT';

  const isHRAdmin = 
    currentUser.functionalRole === 'HR_ADMIN' || 
    currentUser.departmentName === 'Human Resources' || 
    currentUser.departmentId === 'dept-hr';

  // Company-wide auditors (Superadmins & HR Admins have enterprise-wide tracking)
  const isCompanyWideAuditor = isSuperAdmin || isHRAdmin;

  // Line Managers & Department Leads (strictly scoped to subordinates under them)
  const isLineManager = !isCompanyWideAuditor && (
    currentUser.managementTier !== 'NONE' || 
    currentUser.accessTier === 'ADMIN' || 
    currentUser.functionalRole === 'PROJECT_MANAGER'
  );

  // Compute Subordinate IDs recursively
  const subordinateIds = useMemo(() => {
    const subs = new Set<string>();
    if (isCompanyWideAuditor) {
      allUsers.forEach(u => subs.add(u.id));
      return subs;
    }
    
    // Direct reports and recursive tree
    const queue = [currentUser.id];
    while (queue.length > 0) {
      const mgrId = queue.shift()!;
      allUsers.forEach(u => {
        if (u.managerId === mgrId && u.id !== currentUser.id && !subs.has(u.id)) {
          subs.add(u.id);
          queue.push(u.id);
        }
      });
    }

    // If DEPT_HEAD, include departmental members (excluding self)
    if (currentUser.managementTier === 'DEPT_HEAD' || currentUser.functionalRole === 'PROJECT_MANAGER') {
      allUsers.forEach(u => {
        if (u.departmentId === currentUser.departmentId && u.id !== currentUser.id) {
          subs.add(u.id);
        }
      });
    }

    return subs;
  }, [allUsers, currentUser, isCompanyWideAuditor]);

  const subordinatesList = useMemo(() => {
    return allUsers.filter(u => subordinateIds.has(u.id));
  }, [allUsers, subordinateIds]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [subordinateFilter, setSubordinateFilter] = useState<string>('ALL');

  // Modal States
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    leave: LeaveItem | null;
    action: 'APPROVED' | 'REJECTED';
    comment: string;
  }>({
    isOpen: false,
    leave: null,
    action: 'APPROVED',
    comment: ''
  });

  // Apply Leave Form State
  const [applyForm, setApplyForm] = useState({
    leaveType: 'ANNUAL' as LeaveItem['leaveType'],
    startDate: '',
    endDate: '',
    daysCount: 1,
    reason: '',
    handoverColleagueId: ''
  });

  // Calculate days when dates change
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 1;
    let days = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // exclude weekends
        days++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, days);
  };

  // Base Scoped Requests: STRICT ISOLATION BARRIER
  // Line Managers and Admins can ONLY see people under them.
  // Standard staff can only see their own requests.
  // Superadmins and HR Admins can see all.
  const scopedRequests = useMemo(() => {
    if (isCompanyWideAuditor) {
      return leaveRequests;
    }
    if (isLineManager) {
      return leaveRequests.filter(req => subordinateIds.has(req.userId));
    }
    // Standard staff sees their own requests
    return leaveRequests.filter(req => req.userId === currentUser.id);
  }, [leaveRequests, isCompanyWideAuditor, isLineManager, subordinateIds, currentUser.id]);

  // Filtered requests based on UI selections
  const filteredRequests = useMemo(() => {
    return scopedRequests.filter(req => {
      // Status
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      
      // Type
      if (typeFilter !== 'ALL' && req.leaveType !== typeFilter) return false;

      // Department (For HR/Superadmin)
      if (isCompanyWideAuditor && departmentFilter !== 'ALL') {
        const user = allUsers.find(u => u.id === req.userId);
        const dept = user?.departmentName || req.userDepartment;
        if (dept !== departmentFilter) return false;
      }

      // Subordinate filter (For Line Managers)
      if (isLineManager && subordinateFilter !== 'ALL') {
        if (req.userId !== subordinateFilter) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = req.userName.toLowerCase().includes(term);
        const matchesReason = (req.reason || '').toLowerCase().includes(term);
        const matchesType = req.leaveType.toLowerCase().includes(term);
        if (!matchesName && !matchesReason && !matchesType) return false;
      }

      return true;
    });
  }, [scopedRequests, statusFilter, typeFilter, departmentFilter, subordinateFilter, searchTerm, isCompanyWideAuditor, isLineManager, allUsers]);

  // Overlap Detection for Line Managers (Team Staffing Bottlenecks)
  const overlappingAlerts = useMemo(() => {
    if (!isLineManager) return [];
    const activeAndPending = scopedRequests.filter(r => r.status === 'PENDING' || r.status === 'APPROVED');
    const overlaps: { staffA: string; staffB: string; rangeA: string; rangeB: string }[] = [];

    for (let i = 0; i < activeAndPending.length; i++) {
      for (let j = i + 1; j < activeAndPending.length; j++) {
        const a = activeAndPending[i];
        const b = activeAndPending[j];
        if (a.userId === b.userId) continue;

        const aStart = new Date(a.startDate).getTime();
        const aEnd = new Date(a.endDate).getTime();
        const bStart = new Date(b.startDate).getTime();
        const bEnd = new Date(b.endDate).getTime();

        // Check if date ranges overlap
        if (aStart <= bEnd && bStart <= aEnd) {
          overlaps.push({
            staffA: a.userName,
            staffB: b.userName,
            rangeA: `${a.startDate} to ${a.endDate}`,
            rangeB: `${b.startDate} to ${b.endDate}`
          });
        }
      }
    }
    return overlaps;
  }, [scopedRequests, isLineManager]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalScoped = scopedRequests.length;
    const pendingCount = scopedRequests.filter(r => r.status === 'PENDING').length;
    const approvedCount = scopedRequests.filter(r => r.status === 'APPROVED').length;
    
    // Count currently on leave today
    const currentlyOnLeave = scopedRequests.filter(r => {
      return r.status === 'APPROVED' && r.startDate <= today && r.endDate >= today;
    }).length;

    const totalDaysTaken = scopedRequests
      .filter(r => r.status === 'APPROVED')
      .reduce((sum, r) => sum + r.daysCount, 0);

    return { totalScoped, pendingCount, approvedCount, currentlyOnLeave, totalDaysTaken };
  }, [scopedRequests]);

  // Unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    allUsers.forEach(u => {
      if (u.departmentName) depts.add(u.departmentName);
    });
    return Array.from(depts);
  }, [allUsers]);

  // Decision Handler
  const openDecisionModal = (leave: LeaveItem, action: 'APPROVED' | 'REJECTED') => {
    setDecisionModal({
      isOpen: true,
      leave,
      action,
      comment: action === 'APPROVED' ? 'Approved in accordance with project and operational coverage.' : 'Declined due to critical delivery schedules.'
    });
    haptics.selection();
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModal.leave) return;
    updateLeaveStatus(decisionModal.leave.id, decisionModal.action, decisionModal.comment.trim());
    if (decisionModal.action === 'APPROVED') {
      haptics.success();
    } else {
      haptics.impact();
    }
    setDecisionModal({ isOpen: false, leave: null, action: 'APPROVED', comment: '' });
  };

  // Submit Leave Request
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate) return;

    const days = calculateDays(applyForm.startDate, applyForm.endDate);
    submitLeaveRequest({
      leaveType: applyForm.leaveType,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      daysCount: days,
      reason: applyForm.reason.trim() || 'Annual vacation break',
      userDepartment: currentUser.departmentName
    });

    haptics.success();
    setIsApplyModalOpen(false);
    setApplyForm({
      leaveType: 'ANNUAL',
      startDate: '',
      endDate: '',
      daysCount: 1,
      reason: '',
      handoverColleagueId: ''
    });
  };

  // CSV Export for HR Audit
  const handleExportCSV = () => {
    haptics.selection();
    const headers = 'Leave ID,Staff Name,Department,Leave Type,Start Date,End Date,Working Days,Status,Reason,Approved By,Approval Date,Approver Notes';
    const rows = filteredRequests.map(r => {
      const u = allUsers.find(user => user.id === r.userId);
      const dept = u?.departmentName || r.userDepartment || 'Operations';
      return [
        r.id,
        `"${r.userName.replace(/"/g, '""')}"`,
        `"${dept.replace(/"/g, '""')}"`,
        r.leaveType,
        r.startDate,
        r.endDate,
        r.daysCount,
        r.status,
        `"${(r.reason || '').replace(/"/g, '""')}"`,
        `"${(r.approvedByName || '').replace(/"/g, '""')}"`,
        r.approvalDate || '',
        `"${(r.approverComments || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aquaearth_leave_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLeaveTypeBadge = (type: LeaveItem['leaveType']) => {
    switch (type) {
      case 'ANNUAL':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'CASUAL':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'SICK':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'MATERNITY':
      case 'PATERNITY':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Persona Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isCompanyWideAuditor ? 'Staff Leave & Absence Tracking' : isLineManager ? 'Subordinate Leave Approvals' : 'My Leave & Absence'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
              isCompanyWideAuditor
                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                : isLineManager
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
            }`}>
              {isCompanyWideAuditor ? <ShieldCheck className="w-3 h-3" /> : isLineManager ? <Users className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {isCompanyWideAuditor ? 'Company-Wide Scope' : isLineManager ? 'Line Manager Scope' : 'Personal Scope'}
            </span>
          </div>

          <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-1">
            {isCompanyWideAuditor && 'Enterprise Oversight • Company-wide leave records, cross-departmental quotas, and HR compliance.'}
            {isLineManager && `Line Manager Purview • Scoped strictly to team members under your direct supervision (${subordinatesList.length} staff).`}
            {!isCompanyWideAuditor && !isLineManager && 'Personal Portal • Track your leave balance, history, and submit absence requests to your manager.'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isCompanyWideAuditor && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
              title="Export leave records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Audit CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsApplyModalOpen(true);
              haptics.selection();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Staffing Overlap Alert for Line Managers */}
      {overlappingAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900 dark:text-amber-200">
              Departmental Staffing Bottleneck Alert
            </div>
            <div className="text-amber-800 dark:text-amber-300 text-[11px] space-y-0.5">
              {overlappingAlerts.map((alert, idx) => (
                <div key={idx}>
                  • <strong>{alert.staffA}</strong> and <strong>{alert.staffB}</strong> have overlapping scheduled leave. Verify field handover coverage before granting approval.
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="apple-glass-card p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {isCompanyWideAuditor ? 'On Leave Today' : isLineManager ? 'Subordinates on Leave' : 'My Leave Taken'}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tnum">
            {isCompanyWideAuditor || isLineManager ? metrics.currentlyOnLeave : metrics.totalDaysTaken}
            <span className="text-xs font-normal text-slate-400 ml-1">
              {isCompanyWideAuditor || isLineManager ? 'active staff' : 'days YTD'}
            </span>
          </div>
        </div>

        <div className="apple-glass-card p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Pending Sign-offs
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tnum">
            {metrics.pendingCount}
            <span className="text-xs font-normal text-slate-400 ml-1">awaiting decision</span>
          </div>
        </div>

        <div className="apple-glass-card p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Approved Absences
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tnum">
            {metrics.approvedCount}
            <span className="text-xs font-normal text-slate-400 ml-1">scheduled</span>
          </div>
        </div>

        <div className="apple-glass-card p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {isCompanyWideAuditor ? 'Total Approved Days' : isLineManager ? 'Team Days Approved' : 'Entitlement Left'}
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tnum">
            {isCompanyWideAuditor || isLineManager ? metrics.totalDaysTaken : `${Math.max(0, 21 - metrics.totalDaysTaken)} / 21`}
            <span className="text-xs font-normal text-slate-400 ml-1">days</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-glass-card p-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left Filters: Status Pills */}
        <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl font-semibold overflow-x-auto w-full md:w-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); haptics.selection(); }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? `All Requests (${scopedRequests.length})` : st}
            </button>
          ))}
        </div>

        {/* Right Search & Select Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Department Filter (HR / Superadmin Only) */}
          {isCompanyWideAuditor && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/90 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subordinate Filter (Line Managers Only) */}
          {isLineManager && subordinatesList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={subordinateFilter}
                onChange={(e) => setSubordinateFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/90 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="ALL">All Team Members ({subordinatesList.length})</option>
                {subordinatesList.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                ))}
              </select>
            </div>
          )}

          {/* Leave Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/90 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="ALL">All Types</option>
            <option value="ANNUAL">Annual</option>
            <option value="CASUAL">Casual</option>
            <option value="SICK">Sick</option>
            <option value="MATERNITY">Maternity</option>
            <option value="PATERNITY">Paternity</option>
          </select>

          {/* Search Input */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/90 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.08] text-slate-400 dark:text-[#A39E93] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Employee</th>
                <th className="px-5 py-3 whitespace-nowrap">Department & Line Manager</th>
                <th className="px-5 py-3 whitespace-nowrap">Leave Type</th>
                <th className="px-5 py-3 whitespace-nowrap">Duration & Working Days</th>
                <th className="px-5 py-3">Reason / Scope</th>
                <th className="px-5 py-3 whitespace-nowrap">Status & Sign-Off</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] font-medium">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400 dark:text-slate-500 space-y-2">
                    <CalendarCheck className="w-8 h-8 mx-auto stroke-1 text-slate-300 dark:text-slate-700" />
                    <div className="font-semibold text-xs">No leave requests found in this scope</div>
                    <p className="text-[11px] max-w-sm mx-auto">
                      {isLineManager 
                        ? 'None of your direct reports have matching leave records submitted under your supervision.'
                        : 'No employee leave requests currently match the selected filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((leave) => {
                  const isPending = leave.status === 'PENDING';
                  const user = allUsers.find(u => u.id === leave.userId);
                  const isSubordinate = subordinateIds.has(leave.userId);
                  const canAct = isCompanyWideAuditor || (isLineManager && isSubordinate);
                  const dept = user?.departmentName || leave.userDepartment || 'Operations';
                  const manager = user?.managerName || 'Executive Lead';

                  return (
                    <tr key={leave.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      {/* Employee Cell */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{leave.userName}</span>
                            {isSubordinate && isLineManager && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                Subordinate
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{user?.jobTitle || 'AquaEarth Specialist'}</div>
                        </div>
                      </td>

                      {/* Department & Manager */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {dept}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Reports to: <strong className="text-slate-600 dark:text-slate-300">{manager}</strong>
                        </div>
                      </td>

                      {/* Leave Type Pill */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap shrink-0 border ${getLeaveTypeBadge(leave.leaveType)}`}>
                          {leave.leaveType} LEAVE
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300 text-[11px]">
                        <div className="font-mono tnum font-bold text-slate-900 dark:text-white">
                          {leave.startDate} &rarr; {leave.endDate}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold tnum">
                          {leave.daysCount} working days
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-[11px] max-w-xs">
                        <div className="line-clamp-2">{leave.reason || '—'}</div>
                      </td>

                      {/* Status & Approver */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 border ${
                            leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                            leave.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' :
                            'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                          }`}>
                            {leave.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> :
                             leave.status === 'REJECTED' ? <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> :
                             <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                            {leave.status}
                          </span>
                          {leave.approvedByName && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {leave.approvedByName} ({leave.approverRole || 'Manager'})
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                        {isPending ? (
                          canAct ? (
                            <>
                              <button
                                onClick={() => openDecisionModal(leave, 'APPROVED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow-2xs active:scale-[0.96] transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openDecisionModal(leave, 'REJECTED')}
                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-lg font-bold text-[10px] border border-rose-500/20 active:scale-[0.96] transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Pending Line Manager
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[10px] font-mono">
                            {leave.status === 'APPROVED' ? `Approved on ${leave.approvalDate || 'record'}` : 'Declined'}
                          </span>
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

      {/* Decision Modal (Approve / Reject) */}
      <AnimatePresence>
        {decisionModal.isOpen && decisionModal.leave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDecisionModal(prev => ({ ...prev, isOpen: false }))}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/10 p-6 space-y-4 z-10 text-xs"
            >
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${decisionModal.action === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {decisionModal.action === 'APPROVED' ? 'Authorize Leave Request' : 'Decline Leave Request'}
                  </h3>
                </div>
                <button
                  onClick={() => setDecisionModal(prev => ({ ...prev, isOpen: false }))}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base"
                >
                  &times;
                </button>
              </div>

              <div className="p-3 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{decisionModal.leave.userName}</span>
                  <span className="font-mono text-[10px] text-slate-500">{decisionModal.leave.daysCount} working days</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {decisionModal.leave.startDate} to {decisionModal.leave.endDate} • {decisionModal.leave.leaveType}
                </div>
                {decisionModal.leave.reason && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-black/[0.04] dark:border-white/5">
                    &ldquo;{decisionModal.leave.reason}&rdquo;
                  </p>
                )}
              </div>

              <form onSubmit={handleConfirmDecision} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {decisionModal.action === 'APPROVED' ? 'Approval Remarks / Coverage Note' : 'Reason for Declining'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={decisionModal.comment}
                    onChange={(e) => setDecisionModal(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Enter notes for HR and employee..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setDecisionModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-3.5 py-1.5 text-slate-500 dark:text-slate-400 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-1.5 rounded-xl font-bold text-white shadow-xs active:scale-[0.96] transition-all cursor-pointer ${
                      decisionModal.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    Confirm {decisionModal.action === 'APPROVED' ? 'Approval' : 'Rejection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply For Leave Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/10 p-6 space-y-4 z-10 text-xs"
            >
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit Leave Request</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Notifies your assigned Line Manager and HR Lead</p>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-base cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Leave Type
                  </label>
                  <select
                    value={applyForm.leaveType}
                    onChange={(e: any) => setApplyForm(prev => ({ ...prev, leaveType: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="ANNUAL">Annual Vacation Leave</option>
                    <option value="CASUAL">Casual / Emergency Leave</option>
                    <option value="SICK">Medical / Sick Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="PATERNITY">Paternity Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={applyForm.startDate}
                      onChange={(e) => {
                        const nextStart = e.target.value;
                        setApplyForm(prev => ({
                          ...prev,
                          startDate: nextStart,
                          daysCount: calculateDays(nextStart, prev.endDate)
                        }));
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={applyForm.endDate}
                      onChange={(e) => {
                        const nextEnd = e.target.value;
                        setApplyForm(prev => ({
                          ...prev,
                          endDate: nextEnd,
                          daysCount: calculateDays(prev.startDate, nextEnd)
                        }));
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {applyForm.startDate && applyForm.endDate && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] flex items-center justify-between">
                    <span>Working Days Deducted:</span>
                    <strong className="font-mono tnum text-xs">{applyForm.daysCount} days</strong>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designated Handover Colleague
                  </label>
                  <select
                    value={applyForm.handoverColleagueId}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, handoverColleagueId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select a department team member...</option>
                    {allUsers
                      .filter(u => u.id !== currentUser.id && u.departmentId === currentUser.departmentId)
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason & Handover Summary
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={applyForm.reason}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Briefly state reason and coverage plan for ongoing tasks..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-3.5 py-1.5 text-slate-500 dark:text-slate-400 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold shadow-xs active:scale-[0.96] transition-all cursor-pointer"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

