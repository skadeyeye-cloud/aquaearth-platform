'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Laptop, 
  Wifi, 
  Palette, 
  Plus, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Download,
  Flame,
  HardDrive,
  Users,
  KeyRound,
  History,
  Search,
  UserCheck,
  Archive,
  Ban,
  Shield,
  FileText,
  Activity,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardwareAsset, UserProfile } from '@/lib/types';
import { haptics } from '@/lib/haptics';
import { exportToXls, exportToPdf } from '@/lib/export-utils';

// IT Components
import { NewAssetModal } from '@/components/it/NewAssetModal';
import { AssignAssetModal } from '@/components/it/AssignAssetModal';
import { RetrieveAssetModal } from '@/components/it/RetrieveAssetModal';
import { AssetHistoryModal } from '@/components/it/AssetHistoryModal';
import { PasswordResetModal } from '@/components/it/PasswordResetModal';
import { NewEmployeeModal } from '@/components/hr/NewEmployeeModal';

type TabKey = 'HARDWARE' | 'USERS_RBAC' | 'AUDIT_LOGS' | 'SUBSCRIPTIONS' | 'DESIGN';

export default function ItDesignOperationsPage() {
  const { 
    currentUser,
    hardwareAssets, 
    subscriptions, 
    designRequests, 
    projects, 
    createDesignRequest,
    allUsers,
    suspendEmployee,
    reactivateEmployee,
    resetUserPassword,
    auditLogs
  } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('HARDWARE');

  // Modals for Hardware
  const [isNewAssetOpen, setIsNewAssetOpen] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<HardwareAsset | null>(null);
  const [selectedAssetForRetrieve, setSelectedAssetForRetrieve] = useState<HardwareAsset | null>(null);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<HardwareAsset | null>(null);

  // Modals for Users & RBAC
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [resetTokenModalData, setResetTokenModalData] = useState<{
    user: UserProfile;
    tokenData: { tempToken: string; message: string };
  } | null>(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('ALL');
  const [hardwareSearch, setHardwareSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');

  // Design Request State
  const [isNewDesignOpen, setIsNewDesignOpen] = useState(false);
  const [designTitle, setDesignTitle] = useState('');
  const [designProjectId, setDesignProjectId] = useState(projects[0]?.id || '');
  const [is24hRush, setIs24hRush] = useState(false);

  // Stats
  const hardwareStats = useMemo(() => {
    return {
      total: hardwareAssets.length,
      operational: hardwareAssets.filter(h => h.status === 'OPERATIONAL').length,
      inStorage: hardwareAssets.filter(h => h.status === 'IN_STORAGE').length,
      inRepair: hardwareAssets.filter(h => h.status === 'IN_REPAIR' || h.status === 'DECOMMISSIONED').length,
    };
  }, [hardwareAssets]);

  const userStats = useMemo(() => {
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.status !== 'SUSPENDED').length,
      suspended: allUsers.filter(u => u.status === 'SUSPENDED').length,
      admins: allUsers.filter(u => u.accessTier === 'ADMIN' || u.accessTier === 'SUPERADMIN').length
    };
  }, [allUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.jobTitle.toLowerCase().includes(userSearch.toLowerCase());
      const matchesDept = userDeptFilter === 'ALL' || user.departmentName === userDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [allUsers, userSearch, userDeptFilter]);

  // Filtered Hardware
  const filteredHardware = useMemo(() => {
    return hardwareAssets.filter(asset => {
      return (
        asset.name.toLowerCase().includes(hardwareSearch.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(hardwareSearch.toLowerCase()) ||
        asset.assignedToName.toLowerCase().includes(hardwareSearch.toLowerCase()) ||
        asset.location.toLowerCase().includes(hardwareSearch.toLowerCase())
      );
    });
  }, [hardwareAssets, hardwareSearch]);

  // Filtered Audits
  const filteredAudits = useMemo(() => {
    if (!auditFilter.trim()) return auditLogs;
    const q = auditFilter.toLowerCase();
    return auditLogs.filter(a => 
      a.action.toLowerCase().includes(q) ||
      a.actorName.toLowerCase().includes(q) ||
      a.targetType.toLowerCase().includes(q) ||
      a.details.toLowerCase().includes(q)
    );
  }, [auditLogs, auditFilter]);

  // Handlers
  const handleTriggerResetPassword = (user: UserProfile) => {
    haptics.impact();
    const result = resetUserPassword(user.id);
    setResetTokenModalData({
      user,
      tokenData: result
    });
  };

  const handleToggleSuspend = (user: UserProfile) => {
    haptics.impact();
    if (user.status === 'SUSPENDED') {
      reactivateEmployee(user.id);
    } else {
      if (confirm(`Are you sure you want to suspend system access for ${user.name}? This will revoke session credentials immediately.`)) {
        suspendEmployee(user.id, 'Administrative suspension via IT & RBAC Management Panel');
      }
    }
  };

  const handleCreateDesign = (e: React.FormEvent) => {
    e.preventDefault();
    createDesignRequest({
      title: designTitle,
      projectId: designProjectId,
      requesterName: 'Tunde Bakare',
      is24hRush
    });
    setIsNewDesignOpen(false);
    setDesignTitle('');
    setIs24hRush(false);
  };

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(allUsers.map(u => u.departmentName).filter(Boolean)));
  }, [allUsers]);

  const handleExportItPdf = () => {
    if (activeTab === 'DESIGN') {
      exportToPdf({
        filename: `AquaEarth_Design_Queue_${new Date().toISOString().split('T')[0]}`,
        title: 'Creative Design & Brand Deliverable Queue Audit',
        subtitle: `AquaEarth Consulting Limited — Design Operations | Extracted by: ${currentUser.name}`,
        category: 'DESIGN OPERATIONS',
        summaryMetrics: [
          { label: 'Total Requests', value: String(designRequests.length) },
          { label: '24h Rush Orders', value: String(designRequests.filter(d => d.is24hRush).length) },
          { label: 'Completed Deliverables', value: String(designRequests.filter(d => d.status === 'COMPLETED').length) }
        ],
        columns: [
          { header: 'Project / Title', key: 'title' },
          { header: 'Requester', key: 'requesterName' },
          { header: 'Rush 24h', key: 'is24hRush', format: (val) => val ? '⚡ YES' : 'Standard' },
          { header: 'Status', key: 'status' }
        ],
        data: designRequests,
        signatories: [
          { role: 'CREATIVE LEAD', name: 'Halima Yusuf', title: 'Brand & IT Lead' },
          { role: 'MANAGING CONSULTANT', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
        ]
      });
    } else {
      exportToPdf({
        filename: `AquaEarth_Hardware_Inventory_${new Date().toISOString().split('T')[0]}`,
        title: 'Enterprise Hardware Asset Register & Custody Audit',
        subtitle: `AquaEarth Consulting Limited — IT Operations & Sovereign Vault | Extracted by: ${currentUser.name}`,
        category: 'IT ASSET AUDIT',
        summaryMetrics: [
          { label: 'Total Assets', value: String(hardwareAssets.length) },
          { label: 'Operational in Field/Office', value: String(hardwareAssets.filter(h => h.status === 'OPERATIONAL').length) },
          { label: 'In Depot Storage', value: String(hardwareAssets.filter(h => h.status === 'IN_STORAGE').length) },
          { label: 'In Maintenance / Repair', value: String(hardwareAssets.filter(h => h.status === 'IN_REPAIR').length) }
        ],
        columns: [
          { header: 'Asset Tag', key: 'assetTag', width: '90px' },
          { header: 'Item Description', key: 'name' },
          { header: 'Category', key: 'category' },
          { header: 'Assigned Custodian', key: 'assignedToName', format: (val) => val || 'Depot Inventory' },
          { header: 'Serial No', key: 'serialNumber' },
          { header: 'Condition', key: 'condition' },
          { header: 'Location', key: 'location' },
          { header: 'Status', key: 'status' }
        ],
        data: hardwareAssets,
        signatories: [
          { role: 'IT ASSET CUSTODIAN', name: currentUser.name, title: `${currentUser.jobTitle || 'IT Support Lead'}` },
          { role: 'HEAD OF OPERATIONS', name: 'Engr. Femi Adebayo', title: 'Chief Operating Officer' },
          { role: 'MANAGING CONSULTANT', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
        ]
      });
    }
    haptics.success();
  };

  const handleExportItXls = () => {
    if (activeTab === 'DESIGN') {
      exportToXls({
        filename: `AquaEarth_Design_Queue_${new Date().toISOString().split('T')[0]}`,
        title: 'CREATIVE DESIGN & BRAND DELIVERABLE QUEUE',
        subtitle: `AquaEarth Consulting Limited — Extracted by: ${currentUser.name}`,
        category: 'DESIGN',
        metadata: {
          'Custodian': currentUser.name,
          'Total Requests': String(designRequests.length)
        },
        summaryMetrics: [
          { label: 'Total Requests', value: designRequests.length }
        ],
        columns: [
          { header: 'Request ID', key: 'id' },
          { header: 'Design Title', key: 'title' },
          { header: 'Project ID', key: 'projectId' },
          { header: 'Requester', key: 'requesterName' },
          { header: '24h Rush', key: 'is24hRush', format: (val) => val ? 'YES' : 'NO' },
          { header: 'Status', key: 'status' }
        ],
        data: designRequests
      });
    } else {
      exportToXls({
        filename: `AquaEarth_Hardware_Inventory_${new Date().toISOString().split('T')[0]}`,
        title: 'ENTERPRISE HARDWARE ASSET REGISTER & CUSTODY AUDIT',
        subtitle: `AquaEarth Consulting Limited — Extracted by: ${currentUser.name}`,
        category: 'IT ASSETS',
        metadata: {
          'Custodian': currentUser.name,
          'Total Assets': String(hardwareAssets.length)
        },
        summaryMetrics: [
          { label: 'Total Assets', value: hardwareAssets.length },
          { label: 'Operational Assets', value: hardwareAssets.filter(h => h.status === 'OPERATIONAL').length }
        ],
        columns: [
          { header: 'Asset Tag', key: 'assetTag' },
          { header: 'Item Name', key: 'name' },
          { header: 'Category', key: 'category' },
          { header: 'Assigned Custodian', key: 'assignedToName' },
          { header: 'Serial Number', key: 'serialNumber' },
          { header: 'Condition', key: 'condition' },
          { header: 'Location', key: 'location' },
          { header: 'Asset Status', key: 'status' }
        ],
        data: hardwareAssets
      });
    }
    haptics.success();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            IT Operations & Design Studio
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportItPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#141416] hover:bg-slate-100 dark:hover:bg-[#1C1C1F] text-slate-700 dark:text-[#F6F4F0] rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] shadow-2xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
            title="Download PDF Audit Report"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={handleExportItXls}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#141416] hover:bg-slate-100 dark:hover:bg-[#1C1C1F] text-slate-700 dark:text-[#F6F4F0] rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] shadow-2xs transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap shrink-0"
            title="Download Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl text-xs font-semibold overflow-x-auto max-w-full border border-black/[0.04] dark:border-white/[0.08]">
          <button
            onClick={() => setActiveTab('HARDWARE')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap active:scale-[0.96] cursor-pointer ${
              activeTab === 'HARDWARE' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hardware ({hardwareAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('USERS_RBAC')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap active:scale-[0.96] cursor-pointer ${
              activeTab === 'USERS_RBAC' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            User Accounts & RBAC ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap active:scale-[0.96] cursor-pointer ${
              activeTab === 'AUDIT_LOGS' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            System Activity Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('SUBSCRIPTIONS')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap active:scale-[0.96] cursor-pointer ${
              activeTab === 'SUBSCRIPTIONS' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            SIM & Licenses ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('DESIGN')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap active:scale-[0.96] cursor-pointer ${
              activeTab === 'DESIGN' ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Design Queue ({designRequests.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HARDWARE LIFECYCLE & INVENTORY                                    */}
      {/* ========================================================================= */}
      {activeTab === 'HARDWARE' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Assets</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{hardwareStats.total}</div>
            </div>
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">In Active Custody</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{hardwareStats.operational}</div>
            </div>
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">In IT Storage</div>
              <div className="text-xl font-extrabold text-amber-700 mt-0.5">{hardwareStats.inStorage}</div>
            </div>
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Maintenance / Decom</div>
              <div className="text-xl font-extrabold text-rose-700 mt-0.5">{hardwareStats.inRepair}</div>
            </div>
          </div>

          {/* Action Row & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tag, device, custodian..."
                value={hardwareSearch}
                onChange={(e) => setHardwareSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <button
              onClick={() => setIsNewAssetOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Hardware Asset</span>
            </button>
          </div>

          {/* Hardware Table */}
          <div className="apple-glass-card rounded-3xl overflow-hidden border border-black/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Asset Tag & Specification</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Assigned Custodian</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Condition</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] font-medium">
                  {filteredHardware.map((asset) => {
                    const isAssigned = !!asset.assignedToId && asset.assignedToName !== 'Unassigned';
                    return (
                      <tr key={asset.id} className="hover:bg-black/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md inline-block border border-indigo-100">
                            {asset.assetTag}
                          </div>
                          <div className="font-bold text-xs text-slate-900 mt-1">{asset.name}</div>
                          {asset.serialNumber && (
                            <div className="text-[10px] text-slate-400 font-mono">S/N: {asset.serialNumber}</div>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08] whitespace-nowrap shrink-0">
                            {asset.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-700 text-[11px]">
                          <div className="font-semibold text-slate-900">{asset.assignedToName}</div>
                          <div className="text-[10px] text-slate-400">{asset.assignedToDept}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-[11px]">
                          {asset.location}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {asset.condition || 'GOOD'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            asset.status === 'OPERATIONAL'
                              ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                              : asset.status === 'IN_STORAGE'
                              ? 'text-amber-800 bg-amber-50 border-amber-200'
                              : 'text-rose-800 bg-rose-50 border-rose-200'
                          }`}>
                            {asset.status === 'OPERATIONAL' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {asset.status === 'IN_STORAGE' && <Archive className="w-3 h-3 text-amber-600" />}
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAssigned ? (
                              <>
                                <button
                                  onClick={() => setSelectedAssetForAssign(asset)}
                                  title="Reassign to another staff"
                                  className="px-2 py-1 text-[10px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200 active:scale-95"
                                >
                                  Reassign
                                </button>
                                <button
                                  onClick={() => setSelectedAssetForRetrieve(asset)}
                                  title="Retrieve into IT stock"
                                  className="px-2 py-1 text-[10px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200 active:scale-95"
                                >
                                  Retrieve
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setSelectedAssetForAssign(asset)}
                                title="Assign to staff custodian"
                                className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200 active:scale-95 flex items-center gap-1"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Assign</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedAssetForHistory(asset)}
                              title="View chain-of-custody audit history"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHardware.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                        No hardware assets matched your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER ACCOUNTS & RBAC MANAGEMENT                                   */}
      {/* ========================================================================= */}
      {activeTab === 'USERS_RBAC' && (
        <div className="space-y-4">
          {/* User Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total User Accounts</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{userStats.total}</div>
            </div>
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active Credentials</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{userStats.active}</div>
            </div>
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Suspended Accounts</div>
              <div className="text-xl font-extrabold text-rose-700 mt-0.5">{userStats.suspended}</div>
            </div>
            <div className="apple-glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Admin / Root Tier</div>
              <div className="text-xl font-extrabold text-indigo-700 mt-0.5">{userStats.admins}</div>
            </div>
          </div>

          {/* Action Row & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, email, role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <select
                value={userDeptFilter}
                onChange={(e) => setUserDeptFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-hidden"
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewUserOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create User Account</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="apple-glass-card rounded-3xl overflow-hidden border border-black/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">User & Account Identity</th>
                    <th className="px-5 py-3">Department & Role</th>
                    <th className="px-5 py-3">RBAC Access Tier</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] font-medium">
                  {filteredUsers.map((user) => {
                    const isSuspended = user.status === 'SUSPENDED';
                    return (
                      <tr key={user.id} className="hover:bg-black/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 border border-black/10 overflow-hidden shrink-0">
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">{user.name}</div>
                              <div className="text-[10px] text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-slate-800 text-[11px]">{user.jobTitle}</div>
                          <div className="text-[10px] text-slate-400">{user.departmentName}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-black/[0.04] dark:border-white/[0.08] whitespace-nowrap shrink-0">
                              {user.functionalRole}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              user.accessTier === 'SUPERADMIN' || user.accessTier === 'ADMIN'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-50 text-slate-600'
                            }`}>
                              {user.accessTier}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSuspended
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isSuspended ? (
                              <>
                                <Ban className="w-3 h-3 text-rose-600" />
                                SUSPENDED
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ACTIVE
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTriggerResetPassword(user)}
                              title="Generate 24-hour cryptographic password reset token"
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Reset Password</span>
                            </button>

                            <button
                              onClick={() => handleToggleSuspend(user)}
                              title={isSuspended ? 'Reactivate system access' : 'Revoke system credentials'}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all active:scale-95 ${
                                isSuspended
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              }`}
                            >
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                        No user accounts match your search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM ACTIVITY LOG (AUDIT TRAIL)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Enterprise Immutable Audit Ledger</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                SOX / ISO 27001 compliant audit trail capturing all identity, security, hardware, and workflow events
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter logs by actor, action, details..."
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden border border-black/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Timestamp (UTC)</th>
                    <th className="px-5 py-3">Actor / Admin</th>
                    <th className="px-5 py-3">Action Type</th>
                    <th className="px-5 py-3">Target Domain</th>
                    <th className="px-5 py-3">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] font-medium">
                  {filteredAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="px-5 py-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-800 text-xs">{log.actorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.actorId}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 text-[11px]">
                        <span className="font-semibold text-slate-800">{log.targetType}</span>
                        {log.targetId && (
                          <span className="block text-[10px] font-mono text-slate-400">{log.targetId}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-700 text-[11px] max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {filteredAudits.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                        No audit events matched your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUBSCRIPTIONS & SIM                                                */}
      {/* ========================================================================= */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptions.map((sub) => {
            const isExpiring = sub.daysRemaining <= 30;
            return (
              <motion.div whileHover={{ y: -2 }} key={sub.id} className="apple-glass-card p-5 rounded-3xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08] whitespace-nowrap shrink-0">
                    {sub.category.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tnum ${
                    isExpiring ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {sub.daysRemaining}d to renewal
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 line-clamp-2">{sub.serviceName}</h3>
                  <div className="text-[10px] text-slate-400 mt-0.5">Provider: <b>{sub.provider}</b> • {sub.assignedUnit}</div>
                </div>

                <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-600 tnum">₦{sub.monthlyCostNgn.toLocaleString()}/mo</span>
                  <span className="text-emerald-700 font-bold text-[10px]">Active Node</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DESIGN REQUEST QUEUE                                              */}
      {/* ========================================================================= */}
      {activeTab === 'DESIGN' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsNewDesignOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Design Request</span>
            </button>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden">
            <div className="divide-y divide-black/[0.04]">
              {designRequests.map((req) => (
                <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{req.requestNumber}</span>
                      {req.is24hRush && (
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600 fill-current" />
                          24H RUSH FLAG
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900">{req.title}</h3>
                    <div className="text-[10px] text-slate-400">Requested by: {req.requesterName} • {req.createdAt}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.deliverableUrl && (
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Final Graphic</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewAssetModal
        isOpen={isNewAssetOpen}
        onClose={() => setIsNewAssetOpen(false)}
      />

      <AssignAssetModal
        isOpen={!!selectedAssetForAssign}
        onClose={() => setSelectedAssetForAssign(null)}
        asset={selectedAssetForAssign}
      />

      <RetrieveAssetModal
        isOpen={!!selectedAssetForRetrieve}
        onClose={() => setSelectedAssetForRetrieve(null)}
        asset={selectedAssetForRetrieve}
      />

      <AssetHistoryModal
        isOpen={!!selectedAssetForHistory}
        onClose={() => setSelectedAssetForHistory(null)}
        asset={selectedAssetForHistory}
      />

      <PasswordResetModal
        isOpen={!!resetTokenModalData}
        onClose={() => setResetTokenModalData(null)}
        user={resetTokenModalData?.user || null}
        tokenData={resetTokenModalData?.tokenData || null}
      />

      <NewEmployeeModal
        isOpen={isNewUserOpen}
        onClose={() => setIsNewUserOpen(false)}
      />

      {/* New Design Request Modal */}
      <AnimatePresence>
        {isNewDesignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewDesignOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request GIS / Graphic Deliverable</h3>
                <button onClick={() => setIsNewDesignOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleCreateDesign} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Deliverable Title / Specification</label>
                  <input
                    type="text"
                    required
                    value={designTitle}
                    onChange={(e) => setDesignTitle(e.target.value)}
                    placeholder="e.g. Escravos 3D Bathymetric Elevation Profile Chart"
                    className="w-full p-2 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Associated Project</label>
                  <select
                    value={designProjectId}
                    onChange={(e) => setDesignProjectId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white truncate"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectCode} - {p.title.substring(0, 25)}...</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-white/[0.04] rounded-xl border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      24-Hour Urgent Rush Delivery
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Prioritizes queue for imminent tender deadlines</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={is24hRush}
                    onChange={(e) => setIs24hRush(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsNewDesignOpen(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-bold shadow-xs active:scale-[0.96] cursor-pointer">Submit to Studio</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
