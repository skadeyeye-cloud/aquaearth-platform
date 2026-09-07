'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserProfile } from '@/lib/types';
import { 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  Upload, 
  Download, 
  Grid, 
  GitBranch, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import StaffProfileDrawer from '@/components/directory/StaffProfileDrawer';
import CsvStaffImporterModal from '@/components/directory/CsvStaffImporterModal';
import OrgChartTree from '@/components/directory/OrgChartTree';

type DirectoryView = 'GRID' | 'ORG_CHART';

const DEPARTMENT_FILTERS = [
  { id: 'ALL', label: 'All Teams' },
  { id: 'dept-exec', label: 'Executive' },
  { id: 'dept-geotech', label: 'Geotechnical & Geophysics' },
  { id: 'dept-env', label: 'ESIA & Environment' },
  { id: 'dept-gis', label: 'GIS & Survey' },
  { id: 'dept-qa', label: 'Quality & QA/QC' },
  { id: 'dept-it', label: 'IT & Digital' },
  { id: 'dept-hr', label: 'Human Resources' },
];

export default function DirectoryPage() {
  const { allUsers, projects } = useAuth();
  
  const [viewMode, setViewMode] = useState<DirectoryView>('GRID');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Filtered staff for grid view
  const filteredStaff = useMemo(() => {
    return allUsers.filter(u => {
      const matchSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.skills && u.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchDept = selectedDept === 'ALL' || 
        u.departmentId === selectedDept || 
        u.departmentName?.toLowerCase().includes(selectedDept.toLowerCase());

      return matchSearch && matchDept;
    });
  }, [allUsers, searchTerm, selectedDept]);

  // Export roster to CSV
  const handleExportRoster = () => {
    haptics.selection();
    const headers = 'Full Name,Email,Job Title,Department,Department ID,Functional Role,Access Tier,Management Tier,Manager Name,Manager ID,Phone,Location,Status,Skills';
    const rows = allUsers.map(u => {
      const skillsStr = u.skills ? `"${u.skills.join('; ')}"` : '""';
      const cleanName = `"${u.name.replace(/"/g, '""')}"`;
      const cleanTitle = `"${u.jobTitle.replace(/"/g, '""')}"`;
      const cleanDept = `"${(u.departmentName || 'Operations').replace(/"/g, '""')}"`;
      const cleanLoc = `"${(u.location || 'Lekki Phase 1 HQ, Lagos').replace(/"/g, '""')}"`;
      return `${cleanName},${u.email},${cleanTitle},${cleanDept},${u.departmentId || ''},${u.functionalRole},${u.accessTier},${u.managementTier},"${u.managerName || ''}",${u.managerId || ''},${u.phone || ''},${cleanLoc},${u.status},${skillsStr}`;
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aquaearth_staff_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 tracking-tight">
              Module 1 • Staff Directory & Hierarchy
            </span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
              PRD Req 11 & 14
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Staff Directory & Org Chart
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Staff profiles, reporting lines, competencies, and automated CSV roster synchronization.
          </p>
        </div>

        {/* Top Controls: View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle (Apple Segmented Control) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/10 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setViewMode('GRID');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'GRID'
                  ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Directory</span>
              <span className="text-[10px] opacity-70">({allUsers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setViewMode('ORG_CHART');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'ORG_CHART'
                  ? 'bg-white dark:bg-[#1c1c20] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Org Chart Tree</span>
            </button>
          </div>

          <div className="h-6 w-px bg-black/[0.08] dark:bg-white/[0.1] hidden sm:block" />

          {/* Import CSV Trigger */}
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          {/* Export Roster CSV */}
          <button
            type="button"
            onClick={handleExportRoster}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
            title="Download CSV roster"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {DEPARTMENT_FILTERS.map(dept => {
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  haptics.selection();
                  setSelectedDept(dept.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/[0.08]'
                }`}
              >
                {dept.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, role, skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.12] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'GRID' ? (
        /* Grid Directory View */
        <div>
          {filteredStaff.length === 0 ? (
            <div className="p-12 text-center apple-glass-card rounded-3xl space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No staff members found
              </div>
              <div className="text-xs text-slate-500">
                Try adjusting your search criteria or clear the department filter.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff) => (
                <motion.div 
                  whileHover={{ y: -2 }}
                  key={staff.id} 
                  onClick={() => {
                    haptics.selection();
                    setSelectedUser(staff);
                  }}
                  className="apple-glass-card p-5 rounded-3xl space-y-3.5 transition-all cursor-pointer group hover:border-emerald-500/40 relative overflow-hidden"
                >
                  {/* Card Header: Avatar & Titles */}
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={staff.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.1]"
                      />
                      {staff.status === 'ACTIVE' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c0c0e]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {staff.name}
                        </h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0 ${
                          staff.functionalRole === 'MANAGING_CONSULTANT' || staff.accessTier === 'SUPERADMIN'
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                            : staff.managementTier === 'DEPT_HEAD'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                              : staff.managementTier === 'TEAM_LEAD'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                        }`}>
                          {staff.functionalRole === 'MANAGING_CONSULTANT' ? 'EXECUTIVE' : staff.managementTier.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        {staff.jobTitle}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate mt-0.5">
                        {staff.departmentName || 'Operations'}
                      </div>
                    </div>
                  </div>

                  {/* Skills / Competency Chips */}
                  {staff.skills && staff.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {staff.skills.slice(0, 3).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[9px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-black/[0.04] dark:border-white/[0.06] whitespace-nowrap shrink-0"
                        >
                          {skill}
                        </span>
                      ))}
                      {staff.skills.length > 3 && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-lg text-slate-400 whitespace-nowrap shrink-0">
                          +{staff.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contact & Meta footer */}
                  <div className="pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06] space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{staff.location || 'Lekki Phase 1 HQ, Lagos'}</span>
                      </div>
                      {staff.managerName && (
                        <span className="truncate shrink-0 font-medium">
                          Reports to {staff.managerName.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Departmental Org Chart View */
        <OrgChartTree
          users={allUsers}
          onSelectUser={(u) => setSelectedUser(u)}
          searchTerm={searchTerm}
          selectedDepartment={selectedDept}
        />
      )}

      {/* Staff Profile Dossier Drawer */}
      <StaffProfileDrawer
        user={selectedUser}
        allUsers={allUsers}
        projects={projects}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      {/* CSV Bulk Importer Modal */}
      <CsvStaffImporterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
