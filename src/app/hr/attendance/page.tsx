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
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics, playNotificationChime } from '@/lib/haptics';

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
                       currentUser.functionalRole === 'MANAGING_CONSULTANT';

  const isHr = currentUser.functionalRole === 'HR_ADMIN' || 
               currentUser.departmentName?.toLowerCase().includes('human resources') || 
               currentUser.departmentName?.toLowerCase().includes('hr');

  const isManagerOrLead = currentUser.managementTier === 'LINE_MANAGER' || 
                          currentUser.managementTier === 'TEAM_LEAD' || 
                          currentUser.managementTier === 'DEPT_HEAD';

  const isEmployeeOnly = !isSuperadmin && !isHr && !isManagerOrLead;

  // Filter attendance records based on role
  let scopedRecords = attendanceRecords;

  if (isSuperadmin || isHr) {
    scopedRecords = attendanceRecords;
  } else if (isManagerOrLead) {
    const supervisedUserIds = new Set(
      allUsers
        .filter(u => u.id === currentUser.id || u.managerId === currentUser.id || u.departmentName === currentUser.departmentName)
        .map(u => u.id)
    );
    scopedRecords = attendanceRecords.filter(a => supervisedUserIds.has(a.userId));
  } else {
    scopedRecords = attendanceRecords.filter(a => a.userId === currentUser.id);
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight flex-wrap">
            <span>HR & Human Capital • Module 9</span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0">
              {isSuperadmin ? 'Company-Wide Roll Call' : isHr ? 'HR Governance Ledger' : isManagerOrLead ? 'Department Supervisory Scope' : 'Personal Timesheet Record'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {isEmployeeOnly ? 'My Daily Station Attendance' : 'Attendance & Shift Timesheet'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEmployeeOnly
              ? 'Biometric digital clock-in, station logging, and automatic +10 on-time KPI point sync.'
              : 'Station verification, daily roll calls, and shift supervision across operating bases.'}
          </p>
        </div>

        {/* Live Digital Clock Badge */}
        <div className="flex items-center gap-2.5 p-2.5 px-4 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-xs shrink-0">
          <Clock className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
          <div className="text-right">
            <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white tracking-tight tnum whitespace-nowrap shrink-0">{currentTime || '08:00:00'} WAT</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap shrink-0">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Confidentiality Notice for Staff */}
      {isEmployeeOnly && (
        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <b>Confidential Attendance Ledger:</b> Your daily station logs and shift timestamps are confidential to you, your Line Manager, and HR Governance.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap shrink-0">
            GPS Verified
          </span>
        </div>
      )}

      {/* Dynamic Feedback Banner */}
      <AnimatePresence>
        {alertBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
              alertBanner.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
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

      {/* Main Clock-In / Clock-Out Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Daily Station Check-In</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isClockedOut ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300' :
              isClockedIn ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              {isClockedOut ? 'Shift Completed' : isClockedIn ? 'Active on Duty' : 'Pending Clock-In'}
            </span>
          </div>

          {/* Current User Snapshot */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/[0.08] dark:ring-white/10"
            />
            <div className="truncate">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.jobTitle}</div>
            </div>
          </div>

          {/* Location Station Selector */}
          {!isClockedIn && (
            <div className="space-y-1.5 text-xs">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Operating Base / Station
              </label>
              <select
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="Lekki HQ Survey Lab">Lekki HQ Survey Lab (Lagos)</option>
                <option value="Escravos Field Base">Escravos Field Base (Delta)</option>
                <option value="Bonny Island Terminal">Bonny Island Terminal (Rivers)</option>
                <option value="Remote / Offshore Platform">Remote / Offshore Platform</option>
              </select>
            </div>
          )}

          {/* Clock In / Out Action Buttons */}
          <div className="space-y-2 pt-2">
            {!isClockedIn ? (
              <button
                onClick={handleClockIn}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold shadow-xs text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              >
                <Compass className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Clock In & Sync KPI (+10 pts)</span>
              </button>
            ) : !isClockedOut ? (
              <button
                onClick={() => setIsClockOutModalOpen(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold shadow-xs text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Clock Out / Conclude Shift</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-center text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Shift Concluded at {todayAttendance?.clockOutTime} WAT</span>
              </div>
            )}
          </div>

          {/* Shift Telemetry */}
          {todayAttendance && (
            <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Clocked In:</span>
                <b className="font-mono text-slate-800 dark:text-white tnum">{todayAttendance.clockInTime} WAT</b>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Station:</span>
                <b className="text-slate-800 dark:text-white">{todayAttendance.locationTag}</b>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Punctuality KPI:</span>
                <b className="text-emerald-600 dark:text-emerald-400 font-mono">+{todayAttendance.kpiAwarded} pts</b>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Live Radar / Scoped Roll Call */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                {isEmployeeOnly ? 'My Attendance History & Shift Logs' : 'Active Duty Roll Call (Today)'}
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tnum">
              {scopedRecords.length} Record{scopedRecords.length > 1 ? 's' : ''} in Scope
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-black/[0.04] dark:border-white/[0.06]">
                <tr>
                  <th className="pb-2.5">Staff Member</th>
                  <th className="pb-2.5">Station Base</th>
                  <th className="pb-2.5">Clock In</th>
                  <th className="pb-2.5">Clock Out</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">KPI Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                {scopedRecords.map((rec) => {
                  const isLate = rec.status === 'LATE';
                  const isMe = rec.userId === currentUser.id;
                  return (
                    <tr key={rec.id} className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${isMe ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
                      <td className="py-3 flex items-center gap-2.5">
                        <img
                          src={rec.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={rec.userName}
                          className="w-7 h-7 rounded-lg object-cover ring-1 ring-black/[0.06] dark:ring-white/10"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span className="whitespace-nowrap shrink-0">{rec.userName}</span>
                            {isMe && (
                              <span className="text-[9px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-1.5 py-0.2 rounded font-bold whitespace-nowrap shrink-0">YOU</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-slate-600 dark:text-slate-300 text-[11px]">
                        <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{rec.locationTag}</span>
                        </div>
                      </td>

                      <td className="py-3 font-mono text-slate-700 dark:text-slate-300 text-[11px] tnum whitespace-nowrap shrink-0">
                        {rec.clockInTime}
                      </td>

                      <td className="py-3 font-mono text-slate-700 dark:text-slate-300 text-[11px] tnum whitespace-nowrap shrink-0">
                        {rec.clockOutTime || '—'}
                      </td>

                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap shrink-0 ${
                          isLate 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {rec.status}
                        </span>
                      </td>

                      <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tnum whitespace-nowrap shrink-0">
                        +{rec.kpiAwarded} pts
                      </td>
                    </tr>
                  );
                })}
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-2xl max-w-sm w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conclude Daily Shift</h3>
                <button onClick={() => setIsClockOutModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleClockOut} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Handover Notes / Accomplishments
                  </label>
                  <textarea
                    rows={3}
                    value={clockOutNotes}
                    onChange={(e) => setClockOutNotes(e.target.value)}
                    placeholder="e.g. Completed 4x nearshore water sample tests, handed over to lab team."
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs resize-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsClockOutModalOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-xs active:scale-[0.96]">Confirm Clock Out</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
