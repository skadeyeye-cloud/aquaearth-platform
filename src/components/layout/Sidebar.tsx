'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { 
  LayoutGrid, 
  Briefcase, 
  Users, 
  FolderKanban, 
  Smartphone, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Receipt, 
  Award, 
  Lock, 
  Compass, 
  GitFork, 
  Clock, 
  HardDrive, 
  Layers, 
  BarChart3,
  CalendarCheck,
  Shield
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: string;
  visible?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ onMobileItemClick }: { onMobileItemClick?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const role = currentUser.functionalRole;
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || role === 'SUPERADMIN' || role === 'MANAGING_CONSULTANT';
  const isDeptHead = currentUser.managementTier === 'DEPT_HEAD';
  const isManager = currentUser.managementTier !== 'NONE';

  // Role Scoping Flags
  const canSeeAnalytics = isSuperadmin || isDeptHead || isManager || role === 'BD_LEAD' || role === 'FINANCE_ADMIN';
  const canSeeBD = isSuperadmin || role === 'BD_LEAD' || isDeptHead;
  const canSeeCRM = isSuperadmin || role === 'BD_LEAD' || isDeptHead;
  const canSeeProjects = isSuperadmin || isManager || role === 'PROJECT_MANAGER' || role === 'FIELD_STAFF' || role === 'TECHNICAL_CONSULTANT';
  const canSeeField = isSuperadmin || role === 'FIELD_STAFF' || role === 'TECHNICAL_CONSULTANT' || role === 'PROJECT_MANAGER';
  const canSeeDocs = true; // Knowledge repository is universal
  const canSeeQA = isSuperadmin || isManager || role === 'QA_LEAD' || role === 'PROJECT_MANAGER' || role === 'TECHNICAL_CONSULTANT';
  const canSeeCompliance = isSuperadmin || role === 'COMPLIANCE_OFFICER' || role === 'QA_LEAD';
  const canSeeVault = true; // Universal access to scoped project deliverables & personal uploads
  const canSeeITDesign = isSuperadmin || role === 'IT_LEAD' || role === 'DESIGN_LEAD' || role === 'IT_DESIGN_OFFICER';
  const canSeeFinance = isSuperadmin || role === 'FINANCE_ADMIN' || isDeptHead;
  const canSeeHR = isSuperadmin || role === 'HR_ADMIN' || isManager;
  const canSeeAdmin = isSuperadmin;

  const navSections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { name: 'My Workspace', href: '/workspace', icon: LayoutGrid, badge: 'All' },
        { name: 'My Tasks', href: '/tasks', icon: CheckCircle2, highlight: 'Workflow' },
        { name: 'Daily Attendance', href: '/hr/attendance', icon: CalendarCheck, highlight: '+10 KPI' },
        { name: 'Staff Directory', href: '/directory', icon: Compass },
      ]
    },
    {
      title: 'Executive Intelligence',
      items: [
        { name: 'Command & Analytics', href: '/analytics', icon: BarChart3, highlight: 'Live Digest', visible: canSeeAnalytics },
        { name: 'KPI Leaderboard', href: '/kpi/leaderboard', icon: Award, visible: true },
      ]
    },
    {
      title: 'Commercial Engine',
      items: [
        { name: 'BD & Tendering', href: '/bd/pipeline', icon: Briefcase, highlight: 'Pipeline', visible: canSeeBD },
        { name: 'Client & Stakeholder CRM', href: '/crm/accounts', icon: Users, visible: canSeeCRM },
      ]
    },
    {
      title: 'Project Delivery & Field',
      items: [
        { name: 'Projects & Milestones', href: '/projects', icon: FolderKanban, highlight: 'AI Parser', visible: canSeeProjects },
        { name: 'Field Data Capture', href: '/field/capture', icon: Smartphone, highlight: 'Offline', visible: canSeeField },
      ]
    },
    {
      title: 'Quality & Governance',
      items: [
        { name: 'Documents & Repository', href: '/documents', icon: FileText, badge: 'Vault', visible: canSeeDocs },
        { name: 'QA/QC Technical Review', href: '/qa', icon: CheckCircle2, highlight: 'Hard Gate', visible: canSeeQA },
        { name: 'Regulatory & Compliance', href: '/compliance', icon: ShieldCheck, highlight: 'FMEnv/NESREA', visible: canSeeCompliance },
        { name: 'AquaEarth Vault', href: '/vault', icon: HardDrive, highlight: 'Sovereign', visible: canSeeVault },
      ]
    },
    {
      title: 'Operational Support',
      items: [
        { name: 'IT & Design Ops Studio', href: '/operations/it-design', icon: Layers, highlight: '24h Rush', visible: canSeeITDesign },
        { name: 'Milestone Finance & Invoicing', href: '/finance', icon: Receipt, badge: 'WHT/VAT', visible: canSeeFinance },
        { name: 'HR & Human Capital', href: '/hr/staff', icon: UserCheck, visible: canSeeHR },
        { name: 'Admin Overview', href: '/admin', icon: Shield, highlight: 'Command', visible: canSeeAdmin },
        { name: 'Superadmin Management', href: '/admin/users', icon: Lock, badge: 'Full Root', visible: canSeeAdmin },
      ]
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-[#000000] border-r border-black/[0.08] dark:border-white/[0.12] flex flex-col h-full select-none shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-black/[0.08] dark:border-white/[0.12]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tight">
          AE
        </div>
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            AquaEarth
            <span className="text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded-md border border-emerald-200 dark:border-emerald-800">
              Operations
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Advisory & Project Delivery</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4 text-xs">
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => item.visible === undefined || item.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {section.title}
              </div>
              {visibleItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      haptics.selection();
                      if (onMobileItemClick) {
                        onMobileItemClick();
                      }
                    }}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl font-medium active:scale-[0.98] transition-colors ${
                      isActive 
                        ? 'text-white dark:text-slate-950 font-bold' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActivePill"
                        transition={{ type: 'spring', damping: 28, stiffness: 450 }}
                        className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-xs"
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
                      <span className="text-[12px]">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`relative z-10 text-[9px] font-semibold px-1.5 py-0.2 rounded-md whitespace-nowrap shrink-0 ${
                        isActive ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950' : 'bg-black/[0.05] dark:bg-white/[0.1] text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.highlight && (
                      <span className={`relative z-10 text-[9px] font-bold px-1.5 py-0.2 rounded-md whitespace-nowrap shrink-0 ${
                        isActive ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {item.highlight}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Scoping Pill */}
      <div className="p-3 border-t border-black/[0.08] dark:border-white/[0.1] bg-slate-50 dark:bg-[#050507] text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-medium">Role:</span>
          <span className="font-bold text-[10px] bg-slate-200 dark:bg-white/15 text-slate-800 dark:text-white px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
            {role.replace('_', ' ')}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">
          {currentUser.departmentName || 'General Operations'}
        </div>
      </div>
    </aside>
  );
}
