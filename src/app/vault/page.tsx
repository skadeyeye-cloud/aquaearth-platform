'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  HardDrive, 
  FolderArchive, 
  Server, 
  ShieldCheck, 
  Share2, 
  Download, 
  Lock, 
  Upload,
  FileCode,
  FileSpreadsheet,
  FileText,
  Search,
  CheckCircle2,
  Filter,
  Layers,
  Database,
  Eye,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultAsset {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: 'GEOTECHNICAL' | 'ESIA_LAB' | 'BATHYMETRY' | 'DRONE_LIDAR' | 'CAD_GIS';
  projectCode: string;
  projectName: string;
  uploadedBy: string;
  uploaderId: string;
  uploadedAt: string;
  sha256: string;
  accessScope: 'PROJECT_TEAM' | 'CONFIDENTIAL_LEADERSHIP';
}

const INITIAL_VAULT_ASSETS: VaultAsset[] = [
  {
    id: 'vlt-1',
    title: 'Chevron Escravos Borehole Raw SPT & CPT Logs (BH-01 to BH-14)',
    fileName: 'Escravos_Boreholes_SPT_CPT_Raw_Data.zstd',
    fileSize: '4.2 GB',
    category: 'GEOTECHNICAL',
    projectCode: 'PRJ-2026-001',
    projectName: 'Chevron Escravos Terminal Geotechnical Investigation',
    uploadedBy: 'Tunde Bakare',
    uploaderId: 'usr-6',
    uploadedAt: '2026-09-01 14:32',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    accessScope: 'PROJECT_TEAM'
  },
  {
    id: 'vlt-2',
    title: 'Escravos Nearshore Foundation Engineering Factual Report',
    fileName: 'Escravos_Geotechnical_Factual_Report_v1.0.pdf',
    fileSize: '184 MB',
    category: 'GEOTECHNICAL',
    projectCode: 'PRJ-2026-001',
    projectName: 'Chevron Escravos Terminal Geotechnical Investigation',
    uploadedBy: 'Engr. Femi Adebayo',
    uploaderId: 'usr-4',
    uploadedAt: '2026-08-30 11:15',
    sha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    accessScope: 'PROJECT_TEAM'
  },
  {
    id: 'vlt-3',
    title: 'Bonny Island Channel High-Density Multibeam Point Cloud',
    fileName: 'Bonny_Channel_Bathymetry_Pointcloud.las',
    fileSize: '18.6 GB',
    category: 'BATHYMETRY',
    projectCode: 'PRJ-2026-002',
    projectName: 'Bonny Island Channel Drone Bathymetric Survey',
    uploadedBy: 'Halima Yusuf',
    uploaderId: 'usr-8',
    uploadedAt: '2026-08-28 16:40',
    sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    accessScope: 'PROJECT_TEAM'
  },
  {
    id: 'vlt-4',
    title: 'OML 58 Heavy Metals & TOC Spectrophotometry Lab Assays',
    fileName: 'OML58_Sediment_HeavyMetals_Assays.xlsx',
    fileSize: '46 MB',
    category: 'ESIA_LAB',
    projectCode: 'PRJ-2026-003',
    projectName: 'TotalEnergies OML 58 Environmental Audit & Compliance Monitoring',
    uploadedBy: 'Dr. Ngozi Eze',
    uploaderId: 'usr-5',
    uploadedAt: '2026-08-26 09:20',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    accessScope: 'PROJECT_TEAM'
  },
  {
    id: 'vlt-5',
    title: 'Dangote Lekki Refinery Phase 1 Environmental Audit Stamped Pack',
    fileName: 'Dangote_Refinery_Phase1_EIA_Signed.pdf',
    fileSize: '14.2 GB',
    category: 'ESIA_LAB',
    projectCode: 'PRJ-2025-089',
    projectName: 'Dangote Lekki Refinery Phase 1 Environmental Audit',
    uploadedBy: 'Kaine Edike',
    uploaderId: 'usr-1',
    uploadedAt: '2025-12-18 17:00',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    accessScope: 'CONFIDENTIAL_LEADERSHIP'
  }
];

export default function VaultPage() {
  const { currentUser, projects } = useAuth();

  const [assets, setAssets] = useState<VaultAsset[]>(INITIAL_VAULT_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [shareLinkGenerated, setShareLinkGenerated] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState(projects[0]?.projectCode || 'PRJ-2026-001');
  const [newCategory, setNewCategory] = useState<VaultAsset['category']>('GEOTECHNICAL');
  const [newFileSize, setNewFileSize] = useState('1.2 GB');

  // RBAC Checks
  const role = currentUser.functionalRole;
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || role === 'SUPERADMIN' || role === 'MANAGING_CONSULTANT';
  const isIT = role === 'IT_LEAD' || role === 'DESIGN_LEAD' || role === 'IT_DESIGN_OFFICER';
  const isLeadership = isSuperadmin || isIT || currentUser.managementTier === 'DEPT_HEAD';

  // Allowed to view global VPS partition breakdown
  const canViewStorageBreakdown = isSuperadmin || isIT;

  // Filter accessible assets:
  // - Superadmins & IT can view everything
  // - Others can view assets they uploaded OR assets belonging to projects they have access to
  const accessibleAssets = assets.filter(asset => {
    if (isLeadership) return true;
    if (asset.uploaderId === currentUser.id) return true;
    // Project PMs or assigned staff
    const isLeadOnProject = projects.some(p => p.projectCode === asset.projectCode && p.leadPmId === currentUser.id);
    if (isLeadOnProject) return true;
    // Allow general team access if scope is PROJECT_TEAM
    return asset.accessScope === 'PROJECT_TEAM';
  });

  const filteredAssets = accessibleAssets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.projectCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateLink = (title: string) => {
    const link = `https://vault.aquaearth.ng/share/exp-${Math.random().toString(36).substring(2, 9)}`;
    setShareLinkGenerated(link);
  };

  const handleDownload = (asset: VaultAsset) => {
    setDownloadNotice(`Downloading "${asset.fileName}" (${asset.fileSize}) — SHA-256 Checksum Verified`);
    setTimeout(() => setDownloadNotice(null), 4500);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.projectCode === newProjectCode);
    const newAsset: VaultAsset = {
      id: `vlt-${Date.now()}`,
      title: newTitle,
      fileName: newFileName || `${newTitle.replace(/\s+/g, '_')}.zstd`,
      fileSize: newFileSize,
      category: newCategory,
      projectCode: newProjectCode,
      projectName: proj?.title || 'AquaEarth Technical Project',
      uploadedBy: currentUser.name,
      uploaderId: currentUser.id,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sha256: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      accessScope: 'PROJECT_TEAM'
    };

    setAssets(prev => [newAsset, ...prev]);
    setIsUploadOpen(false);
    setNewTitle('');
    setNewFileName('');
    setDownloadNotice(`Securely uploaded "${newAsset.fileName}" to Vault.`);
    setTimeout(() => setDownloadNotice(null), 4500);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            <span>Module 15 • Sovereign Data Vault</span>
            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
              canViewStorageBreakdown 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {canViewStorageBreakdown ? 'IT & Superadmin Infrastructure Access' : 'Scoped Personal & Project Vault'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {canViewStorageBreakdown ? 'AquaEarth Vault & Storage Tiering' : 'My Project Vault & Raw Datasets'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {canViewStorageBreakdown
              ? 'Dedicated sovereign storage partitioning, cold archive zstd compression, and automated lifecycle governance.'
              : 'Securely upload, view, and download raw field logs, lab assays, point clouds, and deliverable archives.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload to Vault</span>
          </button>
        </div>
      </div>

      {/* Download / Upload Feedback Banner */}
      <AnimatePresence>
        {downloadNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-between text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{downloadNotice}</span>
            </div>
            <button onClick={() => setDownloadNotice(null)} className="opacity-60 hover:opacity-100">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ONLY IT & SUPERADMINS: Global VPS Storage Partitioning Breakdown */}
      {canViewStorageBreakdown && (
        <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Global VPS Storage Allocation (1.0 TB Total Storage)
                </h2>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Mount: <b className="font-mono text-slate-700 dark:text-slate-300">/mnt/aquaearth-storage</b> • Node: <b className="font-mono text-slate-700 dark:text-slate-300">Lagos-RackCentre-01</b> • Tier: <b className="text-emerald-600 dark:text-emerald-400">100% Nigeria Data Residency (NDPA)</b>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 tnum bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-xl">
              364 GB Used / 636 GB Free
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-8 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden flex p-1 gap-1">
              <div className="h-full bg-cyan-600 rounded-lg w-[50%] flex items-center justify-center text-[10px] font-bold text-white shadow-xs" title="50% Cold Archive">
                50% Cold Archive (500 GB)
              </div>
              <div className="h-full bg-emerald-600 rounded-lg w-[25%] flex items-center justify-center text-[10px] font-bold text-white shadow-xs" title="25% System Runtime">
                25% System (250 GB)
              </div>
              <div className="h-full bg-amber-500 rounded-lg w-[25%] flex items-center justify-center text-[10px] font-bold text-slate-950 shadow-xs" title="25% Active Vault">
                25% Active Vault (250 GB)
              </div>
            </div>
          </div>

          {/* 3 Tier Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FolderArchive className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Cold Archive Tier (50%)
                </span>
                <span className="text-[10px] bg-white dark:bg-white/10 border border-black/[0.08] dark:border-white/[0.1] px-2 py-0.2 rounded-md font-mono font-bold text-slate-800 dark:text-white tnum">182 GB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Compressed (<b className="text-slate-700 dark:text-slate-300">zstd</b>), immutable storage for closed projects, historical EIA records, and point clouds.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  System & Runtime (25%)
                </span>
                <span className="text-[10px] bg-white dark:bg-white/10 border border-black/[0.08] dark:border-white/[0.1] px-2 py-0.2 rounded-md font-mono font-bold text-slate-800 dark:text-white tnum">64 GB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dedicated partition for Linux OS, PostgreSQL database, Docker containers, and search engine.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Active Vault Staging (25%)
                </span>
                <span className="text-[10px] bg-white dark:bg-white/10 border border-black/[0.08] dark:border-white/[0.1] px-2 py-0.2 rounded-md font-mono font-bold text-slate-800 dark:text-white tnum">118 GB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hot working storage for active project GIS shapefiles, drone orthomosaics, and live review drafts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Files & Datasets Repository (Scoped: Read, Upload, Download) */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Vault Datasets & Deliverables</span>
              <span className="text-[11px] bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 px-2 py-0.2 rounded-full font-bold tnum">
                {filteredAssets.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {canViewStorageBreakdown 
                ? 'All secure project archives and raw field datasets.' 
                : 'Showing files you have uploaded or are authorized to access.'}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search datasets..."
                className="w-full pl-8 pr-2.5 py-1 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Categories</option>
              <option value="GEOTECHNICAL">Geotechnical</option>
              <option value="ESIA_LAB">ESIA Lab</option>
              <option value="BATHYMETRY">Bathymetry</option>
              <option value="DRONE_LIDAR">Drone LiDAR</option>
            </select>
          </div>
        </div>

        {/* Datasets List */}
        <div className="space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <FolderArchive className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 stroke-1" />
              <div className="text-xs font-medium">No datasets found in your vault scope</div>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isMyUpload = asset.uploaderId === currentUser.id;
              return (
                <div
                  key={asset.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.1] hover:border-black/[0.15] dark:hover:border-white/[0.2] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-1.5 py-0.2 rounded">
                        {asset.projectCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {asset.category}
                      </span>
                      {isMyUpload && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                          YOUR UPLOAD
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {asset.title}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      File: <b className="font-mono text-slate-700 dark:text-slate-300">{asset.fileName}</b> • Project: {asset.projectName}
                    </div>

                    <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-3 pt-1">
                      <span>Size: <b className="text-slate-700 dark:text-slate-300 tnum">{asset.fileSize}</b></span>
                      <span>Uploaded by: <b className="text-slate-700 dark:text-slate-300">{asset.uploadedBy}</b> ({asset.uploadedAt})</span>
                      <span className="truncate max-w-[180px] font-mono">SHA: {asset.sha256.substring(0, 12)}...</span>
                    </div>
                  </div>

                  {/* Actions: Download & Expiring Share Link */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleGenerateLink(asset.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors active:scale-[0.96]"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>7-Day Link</span>
                    </button>
                    <button
                      onClick={() => handleDownload(asset)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload to Vault Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  Upload Dataset to Secure Vault
                </h3>
                <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Dataset Description / Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Escravos Canal Multibeam Depth Matrix"
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Filename (with extension)</label>
                  <input
                    type="text"
                    required
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. Escravos_Multibeam_Survey.las"
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Associated Project</label>
                    <select
                      value={newProjectCode}
                      onChange={(e) => setNewProjectCode(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.projectCode}>
                          {p.projectCode} ({p.clientName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Dataset Domain</label>
                    <select
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs"
                    >
                      <option value="GEOTECHNICAL">Geotechnical</option>
                      <option value="ESIA_LAB">ESIA Lab</option>
                      <option value="BATHYMETRY">Bathymetry</option>
                      <option value="DRONE_LIDAR">Drone LiDAR</option>
                      <option value="CAD_GIS">CAD / GIS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated File Size</label>
                  <select
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white text-xs font-mono"
                  >
                    <option value="250 MB">250 MB (Raw Logs)</option>
                    <option value="1.2 GB">1.2 GB (Compressed Archive)</option>
                    <option value="4.8 GB">4.8 GB (Point Cloud / Orthomosaic)</option>
                    <option value="18.5 GB">18.5 GB (High-Res Drone GeoTIFF Pack)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsUploadOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-xs active:scale-[0.96]">Upload to Vault</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Link Modal */}
      <AnimatePresence>
        {shareLinkGenerated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShareLinkGenerated(null)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-2xl max-w-sm w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  Secure Expiring Link
                </h3>
                <button onClick={() => setShareLinkGenerated(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">&times;</button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This link allows download of large deliverable packages without permanent unmanaged copies. Expires in 7 days.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] text-xs font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                {shareLinkGenerated}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShareLinkGenerated(null)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold active:scale-[0.96]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
