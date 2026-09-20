'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Calendar, 
  Users, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Building, 
  Radio,
  Lock,
  Download,
  Filter,
  Search,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics, playNotificationChime } from '@/lib/haptics';
import { exportToXls, exportToPdf } from '@/lib/export-utils';

type TimeHorizon = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'H1' | 'H2' | 'YEARLY';

export default function AttendancePage() {
  const { 
    currentUser, 
    allUsers,
    todayAttendance, 
    attendanceRecords, 
    clockIn, 
    clockOut 
  } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [locationTag, setLocationTag] = useState('Lekki HQ Survey Lab');
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Multi-Horizon State for Superadmins & Managers
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('DAILY');
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
      setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = () => {
    haptics.clockPunch();
    playNotificationChime('punch');
    const res = clockIn(locationTag, '6.4698°N, 3.5852°E');
    setAlertBanner({
      message: res.message,
      type: res.kpiAwarded > 0 ? 'success' : 'warning'
    });
    setTimeout(() => setAlertBanner(null), 5000);
  };

  const handleClockOut = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.success();
    playNotificationChime('success');
    const res = clockOut(clockOutNotes);
    setIsClockOutModalOpen(false);
    setAlertBanner({
      message: res.message,
      type: 'success'
    });
    setClockOutNotes('');
    setTimeout(() => setAlertBanner(null), 5000);
  };

  const isClockedIn = !!todayAttendance;
  const isClockedOut = !!todayAttendance?.clockOutTime;

  // Role Scoping Flags
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'SUPERADMIN' || 
                       currentUser.functionalRole === 'MANAGING_CONSULTANT' ||
                       currentUser.id === 'usr-1' ||
                       currentUser.name.toLowerCase().includes('kaine');

  const isHr = currentUser.functionalRole === 'HR_ADMIN' || 
               currentUser.departmentName?.toLowerCase().includes('human resources') || 
               currentUser.departmentName?.toLowerCase().includes('hr');

  const isManagerOrLead = currentUser.managementTier === 'LINE_MANAGER' || 
                          currentUser.managementTier === 'TEAM_LEAD' || 
                          currentUser.managementTier === 'DEPT_HEAD';

  const canSeeEveryone = isSuperadmin || isHr;
  const isEmployeeOnly = !canSeeEveryone && !isManagerOrLead;

  // Filter attendance records based on role
  let baseScopedRecords = attendanceRecords;

  if (canSeeEveryone) {
    baseScopedRecords = attendanceRecords;
  } else if (isManagerOrLead) {
    const supervisedUserIds = new Set(
      allUsers
        .filter(u => u.id === currentUser.id || u.managerId === currentUser.id || u.departmentName === currentUser.departmentName)
        .map(u => u.id)
    );
    baseScopedRecords = attendanceRecords.filter(a => supervisedUserIds.has(a.userId));
  } else {
    baseScopedRecords = attendanceRecords.filter(a => a.userId === currentUser.id);
  }

  // Filter by Time Horizon
  const horizonRecords = baseScopedRecords.filter(rec => {
    const recDate = rec.date;
    if (!recDate) return true;

    if (timeHorizon === 'DAILY') {
      return recDate === todayStr || recDate === '2026-09-17' || recDate === '2026-09-01';
    }
    if (timeHorizon === 'WEEKLY') {
      return recDate >= '2026-09-08' && recDate <= '2026-09-17';
    }
    if (timeHorizon === 'MONTHLY') {
      return recDate.startsWith('2026-09');
    }
    if (timeHorizon === 'QUARTERLY') {
      if (selectedQuarter === 'Q1') return recDate >= '2026-01-01' && recDate <= '2026-03-31';
      if (selectedQuarter === 'Q2') return recDate >= '2026-04-01' && recDate <= '2026-06-30';
      if (selectedQuarter === 'Q3') return recDate >= '2026-07-01' && recDate <= '2026-09-30';
      if (selectedQuarter === 'Q4') return recDate >= '2026-10-01' && recDate <= '2026-12-31';
    }
    if (timeHorizon === 'H1') {
      return recDate >= '2026-01-01' && recDate <= '2026-06-30';
    }
    if (timeHorizon === 'H2') {
      return recDate >= '2026-07-01' && recDate <= '2026-12-31';
    }
    if (timeHorizon === 'YEARLY') {
      return recDate.startsWith('2026');
    }
    return true;
  });

  // Filter by Staff member & Search query
  const filteredRecords = horizonRecords.filter(rec => {
    const matchesStaff = selectedStaffFilter === 'ALL' || rec.userId === selectedStaffFilter;
    const matchesSearch = !searchQuery || 
                          rec.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.locationTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStaff && matchesSearch;
  });

  // Calculate telemetry metrics
  const totalShifts = filteredRecords.length;
  const onTimeShifts = filteredRecords.filter(r => r.status === 'PRESENT').length;
  const lateShifts = filteredRecords.filter(r => r.status === 'LATE').length;
  const punctualityRate = totalShifts > 0 ? Math.round((onTimeShifts / totalShifts) * 100) : 100;
  const totalKpiEarned = filteredRecords.reduce((acc, curr) => acc + (curr.kpiAwarded || 0), 0);

  const handleExportAttendancePdf = () => {
    exportToPdf({
      filename: `AquaEarth_Attendance_Muster_${timeHorizon}_${new Date().toISOString().split('T')[0]}`,
      title: 'Station Muster & Personnel Attendance Timesheet',
      subtitle: `AquaEarth Consulting Limited — Horizon: ${timeHorizon} | Staff Filter: ${selectedStaffFilter}`,
      category: 'STATION MUSTER TIMESHEET',
      summaryMetrics: [
        { label: 'Total Logs in Scope', value: String(filteredRecords.length) },
        { label: 'Punctuality Rate', value: `${punctualityRate}%`, subtext: `${onTimeShifts} on-time` },
        { label: 'Late Shifts', value: `${lateShifts} late`, subtext: 'Disciplinary review' },
        { label: 'Total KPI Awarded', value: `+${totalKpiEarned} pts` }
      ],
      columns: [
        { header: 'Date', key: 'date', width: '90px' },
        { header: 'Employee', key: 'userName' },
        { header: 'Clock-In', key: 'clockInTime', format: (val) => val ? `${val} WAT` : '—' },
        { header: 'Clock-Out', key: 'clockOutTime', format: (val) => val ? `${val} WAT` : 'Active' },
        { header: 'Station / Deployment', key: 'locationTag' },
        { header: 'Status', key: 'status' },
        { header: 'KPI Pts', key: 'kpiAwarded', align: 'center', format: (val) => `+${val}` }
      ],
      data: filteredRecords,
      signatories: [
        { role: 'STATION MUSTER OFFICER', name: currentUser.name, title: `${currentUser.jobTitle}` },
        { role: 'HR & TALENT MANAGER', name: 'Mrs. Funmi Oladipo', title: 'HR & Personnel Lead' },
        { role: 'EXECUTIVE CLEARANCE', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

  const handleExportAttendanceXls = () => {
    exportToXls({
      filename: `AquaEarth_Attendance_Muster_${timeHorizon}_${new Date().toISOString().split('T')[0]}`,
      title: 'STATION MUSTER & ATTENDANCE TIMESHEET',
      subtitle: `Horizon: ${timeHorizon} | Extracted By: ${currentUser.name}`,
      category: 'ATTENDANCE TIMESHEET',
      metadata: {
        'Supervisor': currentUser.name,
        'Horizon': timeHorizon,
        'Staff Scope': selectedStaffFilter,
        'Records': String(filteredRecords.length)
      },
      summaryMetrics: [
        { label: 'Total Records', value: filteredRecords.length },
        { label: 'Punctuality Rate', value: `${punctualityRate}%` },
        { label: 'KPI Points Earned', value: totalKpiEarned }
      ],
      columns: [
        { header: 'Date', key: 'date' },
        { header: 'Employee Name', key: 'userName' },
        { header: 'Clock In (WAT)', key: 'clockInTime' },
        { header: 'Clock Out (WAT)', key: 'clockOutTime' },
        { header: 'Station Location', key: 'locationTag' },
        { header: 'GPS Coordinates', key: 'gpsCoordinates' },
        { header: 'Shift Status', key: 'status' },
        { header: 'KPI Points', key: 'kpiAwarded' },
        { header: 'Shift Notes', key: 'shiftNotes' }
      ],
      data: filteredRecords
    });
    haptics.success();
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tracking-tight">
            {isEmployeeOnly ? 'My Daily Station Attendance' : "Attendance & Clock-In Oversight"}
          </h1>
        </div>

        {/* Live Digital Clock Badge */}
        <div className="flex items-center gap-3 p-3 px-4 bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-xs shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div className="text-right">
            <div className="font-mono font-semibold text-sm text-[#1D1D1F] dark:text-[#F6F4F0] tracking-tight tnum whitespace-nowrap shrink-0">{currentTime || '08:00:00'} WAT</div>
            <div className="text-[10px] text-[#86868B] font-medium whitespace-nowrap shrink-0">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Dynamic Feedback Banner */}
      <AnimatePresence>
        {alertBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
              alertBanner.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)} className="opacity-60 hover:opacity-100">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Superadmin / HR Multi-Horizon Segmented Control Bar */}
      {!isEmployeeOnly && (
        <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-4 space-y-3 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Horizon Switcher */}
            <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl overflow-x-auto">
              <button
                onClick={() => { haptics.selection(); setTimeHorizon('DAILY'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  timeHorizon === 'DAILY' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Daily (Today)
              </button>

              <button
                onClick={() => { haptics.selection(); setTimeHorizon('WEEKLY'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  timeHorizon === 'WEEKLY' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Weekly
              </button>

              <button
                onClick={() => { haptics.selection(); setTimeHorizon('MONTHLY'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  timeHorizon === 'MONTHLY' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Monthly (Sept)
              </button>

              <button
                onClick={() => { haptics.selection(); setTimeHorizon('QUARTERLY'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  timeHorizon === 'QUARTERLY' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Quarterly
              </button>

              <button
                onClick={() => { haptics.selection(); setTimeHorizon('H1'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  timeHorizon === 'H1' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                H1 (Jan–Jun)
              </button>

              <button
                onClick={() => { haptics.selection(); setTimeHorizon('H2'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  timeHorizon === 'H2' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                H2 (Jul–Dec)
              </button>

              <button
                onClick={() => { haptics.selection(); setTimeHorizon('YEARLY'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  timeHorizon === 'YEARLY' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Yearly (2026)
              </button>
            </div>

            {/* Sub-selector for Quarters */}
            {timeHorizon === 'QUARTERLY' && (
              <div className="flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-xl">
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => { haptics.selection(); setSelectedQuarter(q); }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                      selectedQuarter === q ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-[#86868B]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtering row: Staff Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#86868B] font-medium whitespace-nowrap shrink-0">Filter Staff:</span>
              <select
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs font-medium text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-none"
              >
                <option value="ALL">All Staff Directory ({allUsers.length} Personnel)</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, station, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0] placeholder:text-[#86868B] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Summary Cards (Visible in Multi-Horizon Mode) */}
      {!isEmployeeOnly && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 space-y-1 shadow-xs">
            <div className="text-[10px] uppercase font-semibold text-[#86868B]">Total Shift Records</div>
            <div className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] font-mono tnum">
              {totalShifts}
            </div>
            <div className="text-[11px] text-[#86868B]">In active horizon scope</div>
          </div>

          <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 space-y-1 shadow-xs">
            <div className="text-[10px] uppercase font-semibold text-[#86868B]">Punctuality Rate</div>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 font-mono tnum">
              {punctualityRate}%
            </div>
            <div className="text-[11px] text-[#86868B]">{onTimeShifts} on-time vs {lateShifts} late</div>
          </div>

          <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 space-y-1 shadow-xs">
            <div className="text-[10px] uppercase font-semibold text-[#86868B]">Total KPI Points Earned</div>
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 font-mono tnum">
              +{totalKpiEarned} pts
            </div>
            <div className="text-[11px] text-[#86868B]">+10 pts per prompt check-in</div>
          </div>

          <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 space-y-1 shadow-xs">
            <div className="text-[10px] uppercase font-semibold text-[#86868B]">Active Field Stations</div>
            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 font-mono tnum">
              4 Bases
            </div>
            <div className="text-[11px] text-[#86868B]">Lekki, Escravos, Bonny, Lab</div>
          </div>
        </div>
      )}

      {/* Main Clock-In / Clock-Out Widget & Scoped Roll Call */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Station Punch Widget */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0]">My Station Check-In</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isClockedOut ? 'bg-black/[0.05] dark:bg-white/10 text-[#86868B]' :
              isClockedIn ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              {isClockedOut ? 'Shift Completed' : isClockedIn ? 'Active on Duty' : 'Pending Clock-In'}
            </span>
          </div>

          {/* Current User Snapshot */}
          <div className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <img 
              src={currentUser.avatar || '/avatars/kaine-edike.png'} 
              alt={currentUser.name} 
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/[0.06] dark:ring-white/10"
            />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{currentUser.name}</div>
              <div className="text-[10px] text-[#86868B] truncate">{currentUser.jobTitle}</div>
            </div>
          </div>

          {/* Station Selection */}
          {!isClockedIn && (
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-[#86868B]">Select Assigned Operating Base</label>
              <select
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-xs font-medium text-[#1D1D1F] dark:text-[#F6F4F0]"
              >
                <option value="Lekki HQ Survey Lab">Lekki HQ Survey Lab (Lagos)</option>
                <option value="Escravos Field Base">Escravos Field Base (Delta)</option>
                <option value="Bonny Island Offshore Base">Bonny Island Offshore Base (Rivers)</option>
                <option value="Lekki Environmental Lab">Lekki Environmental Lab (Lagos)</option>
                <option value="Remote / Client Site">Remote / Client Offshore Vessel</option>
              </select>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            {!isClockedIn ? (
              <button
                onClick={handleClockIn}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Clock In & Sync +10 KPI Points</span>
              </button>
            ) : !isClockedOut ? (
              <button
                onClick={() => setIsClockOutModalOpen(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Conclude Shift & Clock Out</span>
              </button>
            ) : (
              <div className="p-3 bg-black/[0.04] dark:bg-white/5 rounded-2xl text-center text-xs font-medium text-[#86868B] flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Shift Concluded at {todayAttendance?.clockOutTime} WAT</span>
              </div>
            )}
          </div>

          {/* Shift Telemetry */}
          {todayAttendance && (
            <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#86868B]">Clocked In:</span>
                <b className="font-mono text-[#1D1D1F] dark:text-[#F6F4F0] tnum">{todayAttendance.clockInTime} WAT</b>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#86868B]">Station:</span>
                <b className="text-[#1D1D1F] dark:text-[#F6F4F0]">{todayAttendance.locationTag}</b>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#86868B]">Punctuality KPI:</span>
                <b className="text-emerald-600 dark:text-emerald-400 font-mono">+{todayAttendance.kpiAwarded} pts</b>
              </div>
            </div>
          )}
        </div>

        {/* Right: Roll Call Table with Clock In / Out times across horizon */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0]">
                {canSeeEveryone ? `Staff Attendance & Clock-In Ledger (${timeHorizon})` : 'Active Duty Roll Call'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#86868B] font-mono tnum mr-2">
                {filteredRecords.length} Record{filteredRecords.length === 1 ? '' : 's'} in Scope
              </span>
              <button
                onClick={handleExportAttendancePdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] transition-all cursor-pointer active:scale-[0.97]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportAttendanceXls}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] transition-all cursor-pointer active:scale-[0.97]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>XLS</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-semibold text-[#86868B] tracking-wider border-b border-black/[0.04] dark:border-white/[0.06]">
                <tr>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Staff Member</th>
                  <th className="pb-2.5">Station Base</th>
                  <th className="pb-2.5">Clock In</th>
                  <th className="pb-2.5">Clock Out</th>
                  <th className="pb-2.5">Punctuality</th>
                  <th className="pb-2.5 text-right">KPI Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-normal">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#86868B]">
                      No attendance records found for this time horizon and filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const isLate = rec.status === 'LATE';
                    const isMe = rec.userId === currentUser.id;
                    return (
                      <tr key={rec.id} className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${isMe ? 'bg-emerald-500/5' : ''}`}>
                        <td className="py-3 font-mono text-[11px] text-[#86868B] whitespace-nowrap shrink-0">
                          {rec.date}
                        </td>

                        <td className="py-3 flex items-center gap-2.5">
                          <img
                            src={rec.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={rec.userName}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-black/[0.06] dark:ring-white/10"
                          />
                          <div>
                            <div className="font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] flex items-center gap-1.5 flex-wrap">
                              <span className="whitespace-nowrap shrink-0">{rec.userName}</span>
                              {isMe && (
                                <span className="text-[9px] bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-1.5 py-0.2 rounded font-bold whitespace-nowrap shrink-0">YOU</span>
                              )}
                            </div>
                            {rec.notes && (
                              <div className="text-[10px] text-[#86868B] italic truncate max-w-xs">{rec.notes}</div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 text-[#1D1D1F] dark:text-[#F6F4F0] text-[11px]">
                          <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
                            <MapPin className="w-3 h-3 text-[#86868B] shrink-0" />
                            <span>{rec.locationTag}</span>
                          </div>
                        </td>

                        <td className="py-3 font-mono font-medium text-[#1D1D1F] dark:text-[#F6F4F0] text-[11px] tnum whitespace-nowrap shrink-0">
                          {rec.clockInTime}
                        </td>

                        <td className="py-3 font-mono text-[#86868B] text-[11px] tnum whitespace-nowrap shrink-0">
                          {rec.clockOutTime || 'Active on Duty'}
                        </td>

                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                            isLate 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isLate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            {rec.status}
                          </span>
                        </td>

                        <td className="py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 tnum whitespace-nowrap shrink-0">
                          +{rec.kpiAwarded} pts
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

      {/* Clock Out Modal */}
      <AnimatePresence>
        {isClockOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsClockOutModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-sm w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Conclude Daily Shift</h3>
                <button onClick={() => setIsClockOutModalOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleClockOut} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">
                    Shift Handover Notes / Accomplishments
                  </label>
                  <textarea
                    rows={3}
                    value={clockOutNotes}
                    onChange={(e) => setClockOutNotes(e.target.value)}
                    placeholder="e.g. Completed 4x nearshore water sample tests, handed over to lab team."
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs resize-none text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsClockOutModalOpen(false)} className="px-3 py-1.5 text-[#86868B] font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold shadow-xs active:scale-[0.96]">Confirm Clock Out</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
