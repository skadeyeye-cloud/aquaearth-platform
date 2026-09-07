'use client';

import React from 'react';
import { UserProfile, ProjectRecord } from '@/lib/types';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  ShieldCheck, 
  Award, 
  UserCheck, 
  Users, 
  Calendar, 
  FolderKanban, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

interface StaffProfileDrawerProps {
  user: UserProfile | null;
  allUsers: UserProfile[];
  projects: ProjectRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
}

export default function StaffProfileDrawer({
  user,
  allUsers,
  projects,
  isOpen,
  onClose,
  onSelectUser,
}: StaffProfileDrawerProps) {
  if (!isOpen || !user) return null;

  // Find direct manager
  const manager = user.managerId ? allUsers.find(u => u.id === user.managerId) : null;

  // Find direct subordinates
  const subordinates = allUsers.filter(u => u.managerId === user.id);

  // Find projects lead or assigned
  const userProjects = projects.filter(p => p.leadPmId === user.id || p.clientName?.toLowerCase().includes(user.name.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            haptics.selection();
            onClose();
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Sliding Sheet */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-[#0c0c0e] border-l border-black/[0.08] dark:border-white/[0.12] shadow-2xl h-full flex flex-col overflow-hidden select-none"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
                Staff Dossier • {user.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                user.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {user.status}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Identity Card */}
            <div className="flex items-start gap-4">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-black/[0.08] dark:ring-white/[0.12] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {user.jobTitle}
                </p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08] whitespace-nowrap">
                    {user.departmentName || 'Operations'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
                    {user.functionalRole.replace(/_/g, ' ')}
                  </span>
                  {user.managementTier !== 'NONE' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                      {user.managementTier.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Contact Actions */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`mailto:${user.email}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-[0.98]"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Send Email</span>
              </a>
              {user.phone && (
                <a
                  href={`tel:${user.phone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition-all active:scale-[0.98]"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Call Direct</span>
                </a>
              )}
            </div>

            {/* Contact & Location Details */}
            <div className="p-3.5 bg-slate-50 dark:bg-white/[0.04] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-mono text-[11px] truncate max-w-[200px]">{user.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone:
                </span>
                <span className="font-mono text-[11px]">{user.phone || '+234 803 000 0000'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Station Base:
                </span>
                <span className="font-medium text-[11px]">{user.location || 'Lekki Phase 1 HQ, Lagos'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Tenured Since:
                </span>
                <span className="font-medium text-[11px]">{user.createdAt}</span>
              </div>
            </div>

            {/* Organizational Reporting Hierarchy */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Reporting Hierarchy
              </h3>

              {/* Direct Manager */}
              <div className="p-3 bg-slate-50 dark:bg-white/[0.04] rounded-2xl border border-black/[0.05] dark:border-white/[0.08]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Line Manager
                </div>
                {manager ? (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      onSelectUser(manager);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={manager.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={manager.name}
                        className="w-8 h-8 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {manager.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {manager.jobTitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 font-medium py-1">
                    👑 Executive Leadership • Reports to Board of Directors
                  </div>
                )}
              </div>

              {/* Direct Reports */}
              {subordinates.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-white/[0.04] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Direct Reports</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      {subordinates.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {subordinates.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          haptics.selection();
                          onSelectUser(sub);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={sub.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={sub.name}
                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {sub.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {sub.jobTitle}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skills & Industry Competencies */}
            {user.skills && user.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  Technical Competencies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-medium rounded-xl border border-black/[0.04] dark:border-white/[0.08]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Licensures & Certifications */}
            {user.certificationsList && user.certificationsList.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Statutory Licenses & Accreditations
                </h3>
                <div className="space-y-1.5">
                  {user.certificationsList.map((cert, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 text-xs text-indigo-800 dark:text-indigo-300 font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {user.emergencyContact && (
              <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Emergency Dispatch Contact
                </h3>
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/40 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-400">Next of Kin:</span>
                    <span className="font-bold">{user.emergencyContact.name} ({user.emergencyContact.relation})</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <a href={`tel:${user.emergencyContact.phone}`} className="text-amber-700 dark:text-amber-400 font-bold underline">
                      {user.emergencyContact.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
