'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserProfile } from '@/lib/types';
import { 
  Award, 
  Download, 
  Upload, 
  CheckCircle2, 
  Users,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import CsvStaffImporterModal from '@/components/directory/CsvStaffImporterModal';
import StaffProfileDrawer from '@/components/directory/StaffProfileDrawer';

export default function HRStaffPage() {
  const { allUsers, certifications, projects } = useAuth();
  const [activeTab, setActiveTab] = useState<'STAFF' | 'CERTS' | 'QUARTERLY_REPORT'>('STAFF');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

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
              PRD Req 11
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Staff & Certifications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Professional licenses (COREN, COMEG, FMEnv), competencies, and automated quarterly HR reporting.
          </p>
        </div>

        {/* Tab Controls & Bulk Importer */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Controls (Apple Segmented Style) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/10 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setActiveTab('STAFF');
              }}
              className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] cursor-pointer ${
                activeTab === 'STAFF' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Staff Roster ({allUsers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setActiveTab('CERTS');
              }}
              className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] cursor-pointer ${
                activeTab === 'CERTS' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Certifications ({certifications.length})
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setActiveTab('QUARTERLY_REPORT');
              }}
              className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] cursor-pointer ${
                activeTab === 'QUARTERLY_REPORT' ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Auto HR Report
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Staff */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Workforce ({allUsers.length} staff members)
            </div>
            <button
              type="button"
              onClick={handleExportRoster}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-white/[0.04] border-b border-black/[0.05] dark:border-white/[0.08] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Reporting Line</th>
                    <th className="px-5 py-3">Management Tier</th>
                    <th className="px-5 py-3">Tenure</th>
                    <th className="px-5 py-3">Utilization</th>
                    <th className="px-5 py-3 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                  {allUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => {
                        haptics.selection();
                        setSelectedUser(user);
                      }}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
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
                        <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 ${
                          user.functionalRole === 'MANAGING_CONSULTANT' || user.accessTier === 'SUPERADMIN'
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                            : user.managementTier === 'DEPT_HEAD'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                              : user.managementTier === 'TEAM_LEAD'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                        }`}>
                          {user.functionalRole === 'MANAGING_CONSULTANT' ? 'EXECUTIVE' : user.managementTier.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-[11px] tnum">
                        Since {user.createdAt.substring(0, 4)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.2 rounded-md font-semibold text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          85% Billable
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Certifications */}
      {activeTab === 'CERTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certifications.map((cert) => {
            const isImpending = cert.daysUntilExpiry <= 30;
            return (
              <motion.div 
                whileHover={{ y: -2 }}
                key={cert.id} 
                className="apple-glass-card p-5 rounded-3xl space-y-3"
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

      {/* Tab 3: Report */}
      {activeTab === 'QUARTERLY_REPORT' && (
        <div className="apple-glass-card p-8 rounded-3xl space-y-6">
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
    </div>
  );
}
