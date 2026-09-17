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
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || role === 'SUPERADMIN' || role === 'MANAGING_CONSULTANT' || role === 'DEPUTY_MANAGING_CONSULTANT';
  const isDeptHead = currentUser.managementTier === 'DEPT_HEAD';
  const isManager = currentUser.managementTier !== 'NONE';
  const isHR = role === 'HR_ADMIN' || (currentUser.departmentName === 'Human Resources' && !isSuperadmin);

  // Finance and Line Manager classification per SOP
  const isFinance = isSuperadmin || role === 'CFO' || role === 'FINANCE_OFFICER' || role === 'FINANCE_ADMIN' || currentUser.departmentName === 'Finance' || currentUser.departmentName === 'Finance & Accounts' || currentUser.id === 'usr-13' || currentUser.id === 'usr-14';
  const isLineManager = isManager || currentUser.accessTier === 'ADMIN' || role === 'PROJECT_MANAGER';

  // Role Scoping Flags - Strict isolation barrier
  // Command & Analytics board is for Line Managers and Finance only (plus Superadmins)
  const canSeeAnalytics = isSuperadmin || isFinance || isLineManager;
  const canSeeBD = isSuperadmin || role === 'BD_LEAD' || isDeptHead;
  const canSeeCRM = isSuperadmin || role === 'BD_LEAD' || isDeptHead;
  const canSeeProjects = !isHR && (isSuperadmin || isManager || role === 'PROJECT_MANAGER' || role === 'FIELD_STAFF' || role === 'TECHNICAL_CONSULTANT');
  const canSeeField = !isHR && (isSuperadmin || role === 'FIELD_STAFF' || role === 'TECHNICAL_CONSULTANT' || role === 'PROJECT_MANAGER');
  const canSeeDocs = true; // Knowledge repository is universal
  const canSeeQA = !isHR && (isSuperadmin || isManager || role === 'QA_LEAD' || role === 'PROJECT_MANAGER' || role === 'TECHNICAL_CONSULTANT');
  const canSeeCompliance = isSuperadmin || role === 'COMPLIANCE_OFFICER' || role === 'QA_LEAD';
  const canSeeVault = true; // Universal access to scoped project deliverables & personal uploads
  const canSeeITDesign = isSuperadmin || role === 'IT_LEAD' || role === 'DESIGN_LEAD' || role === 'IT_DESIGN_OFFICER';
  
  // Finance is visible to Superadmins, Finance Officers, and Line Managers/Admins (scoped to own budgets)
  const canSeeFinance = isSuperadmin || isFinance || isLineManager;
  const canSeeHR = isSuperadmin || role === 'HR_ADMIN' || isManager;
  const canSeeAdmin = isSuperadmin;

  const navSections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { name: 'My Workspace', href: '/workspace', icon: LayoutGrid },
        { name: 'My Tasks', href: '/tasks', icon: CheckCircle2 },
        { name: 'Daily Attendance', href: '/hr/attendance', icon: CalendarCheck },
        { name: 'Staff Directory', href: '/directory', icon: Compass },
      ]
    },
    {
      title: 'Executive Intelligence',
      items: [
        { name: 'KPI Leaderboard', href: '/kpi/leaderboard', icon: Award, visible: true },
      ]
    },
    {
      title: 'Commercial Engine',
      items: [
        { name: 'BD & Tendering', href: '/bd/pipeline', icon: Briefcase, visible: canSeeBD },
        { name: 'Client & Stakeholder CRM', href: '/crm/accounts', icon: Users, visible: canSeeCRM },
      ]
    },
    {
      title: 'Project Delivery & Field',
      items: [
        { name: 'Projects & Milestones', href: '/projects', icon: FolderKanban, visible: canSeeProjects },
        { name: 'Field Data Capture', href: '/field/capture', icon: Smartphone, visible: canSeeField },
      ]
    },
    {
      title: 'Quality & Governance',
      items: [
        { name: 'Documents & Repository', href: '/documents', icon: FileText, visible: canSeeDocs },
        { name: 'QA/QC Technical Review', href: '/qa', icon: CheckCircle2, visible: canSeeQA },
        { name: 'Regulatory & Compliance', href: '/compliance', icon: ShieldCheck, visible: canSeeCompliance },
        { name: 'AquaEarth Vault', href: '/vault', icon: HardDrive, visible: canSeeVault },
      ]
    },
    {
      title: 'Operational Support',
      items: [
        { name: 'IT & Design Ops Studio', href: '/operations/it-design', icon: Layers, visible: canSeeITDesign },
        { name: 'Milestone Finance & Invoicing', href: '/finance', icon: Receipt, visible: canSeeFinance },
        { name: 'HR & Human Capital', href: '/hr/staff', icon: UserCheck, visible: canSeeHR },
        { name: 'Onboarding & Recruitment', href: '/hr/onboarding', icon: Users, visible: canSeeHR },
        { name: 'User Access & Roles', href: '/admin/users', icon: Lock, visible: canSeeAdmin },
      ]
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-[#FBFBFD] dark:bg-[#000000] border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col h-full select-none shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs font-bold text-xs tracking-tight">
          AE
        </div>
        <div>
          <div className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F6F4F0] tracking-tight flex items-center gap-1.5">
            AquaEarth
            <span className="text-[10px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] dark:text-[#A39E93] px-1.5 py-0.2 rounded-md">
              Ops
            </span>
          </div>
          <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6]">Advisory & Delivery</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => item.visible === undefined || item.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-0.5">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#86868B] dark:text-[#8E8E93] tracking-normal">
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
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] transition-colors ${
                      isActive 
                        ? 'text-[#1D1D1F] dark:text-white font-semibold' 
                        : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-normal'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActivePill"
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        className="absolute inset-0 bg-black/[0.06] dark:bg-white/[0.1] rounded-xl"
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#1D1D1F] dark:text-white' : 'text-[#86868B] dark:text-[#8E8E93] group-hover:text-[#1D1D1F] dark:group-hover:text-white'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`relative z-10 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-black/[0.08] dark:bg-white/[0.15] text-[#1D1D1F] dark:text-white' : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] dark:text-[#A1A1A6]'
                      }`}>
                        {item.badge}
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
      <div className="p-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02] text-xs">
        <div className="flex items-center gap-2.5">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-7 h-7 rounded-xl object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.08] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{currentUser.name}</span>
              <span className="font-medium text-[9.5px] bg-black/[0.05] dark:bg-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] px-1.5 py-0.2 rounded-md whitespace-nowrap shrink-0">
                {role.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-[10.5px] text-[#86868B] dark:text-[#A1A1A6] truncate">
              {currentUser.departmentName || 'General Operations'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
