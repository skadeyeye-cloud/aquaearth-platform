'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  FileText, 
  Search, 
  Filter, 
  UploadCloud, 
  Download, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  HardDrive,
  FolderKanban,
  FileCheck,
  Sparkles,
  Plus,
  Folder,
  FolderPlus
} from 'lucide-react';
import { DocumentCategory, DocumentItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { NewFolderModal } from '@/components/documents/NewFolderModal';
import { haptics } from '@/lib/haptics';

export default function DocumentsPage() {
  const { documents, projects, allUsers, uploadDocument, submitForQa, documentFolders, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isQaSubmitOpen, setIsQaSubmitOpen] = useState(false);
  const [selectedDocForQa, setSelectedDocForQa] = useState<DocumentItem | null>(null);

  // QA Submit Modal Form
  const [peerReviewerId, setPeerReviewerId] = useState('usr-4');
  const [qaLeadId, setQaLeadId] = useState('usr-3');

  // Upload Modal Form
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [category, setCategory] = useState<DocumentCategory>('TECHNICAL_REPORT');
  const [version, setVersion] = useState('v0.1 Draft');
  const [fileSizeMb, setFileSizeMb] = useState(12.5);

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'TECHNICAL_REPORT':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'PROPOSAL':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'LAB_CERTIFICATE':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
      case 'REGULATORY_PERMIT':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'GIS_MAP':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'IMML_APPROVAL':
        return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';
      case 'JOB_COMPLETION_CERT':
        return 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30';
      case 'CLIENT_FEEDBACK_CPFS':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30';
      case 'COMMENT_CHECKLIST':
        return 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30';
      case 'SCOPING_REPORT':
        return 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30';
      case 'INFORMATION_REQUEST_SHEET':
        return 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenQaSubmit = (doc: DocumentItem) => {
    setSelectedDocForQa(doc);
    setIsQaSubmitOpen(true);
  };

  const handleConfirmQaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForQa) return;
    submitForQa(selectedDocForQa.id, peerReviewerId, qaLeadId);
    setIsQaSubmitOpen(false);
    setSelectedDocForQa(null);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId);
    uploadDocument({
      title,
      projectId,
      projectName: proj?.title || 'General Advisory',
      category,
      version,
      fileSizeMb: Number(fileSizeMb),
      authorName: 'Tunde Bakare',
      qaStatus: 'DRAFT_WATERMARKED',
      storageTier: 'ACTIVE_VAULT',
      downloadUrl: '/vault/downloads/new-document.pdf'
    });
    setIsUploadOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Documents & Knowledge Base
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsNewFolderOpen(true); haptics.selection(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
            <span>New Folder (IT / Admin)</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Institutional & Departmental Non-Project Folders */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Institutional Repositories & Non-Project Folders
          </span>
          <span className="text-[10px] text-slate-400">
            Provisioned and restricted strictly to IT Support & System Administrators
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {documentFolders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => {
                setSelectedFolderId(selectedFolderId === folder.id ? 'ALL' : folder.id);
                haptics.selection();
              }}
              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] ${
                selectedFolderId === folder.id
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Folder className="w-4 h-4" />
                </div>
                {folder.isRestricted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Restricted</span>
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {folder.name}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {folder.department} • {folder.itemCount || 0} items
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="apple-glass-card p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by code, title, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-black/[0.08] dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-black/[0.08] dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="IMML_APPROVAL">📜 IMML Letters (Statutory Approval)</option>
            <option value="JOB_COMPLETION_CERT">🤝 Job Completion Certs (JCC)</option>
            <option value="CLIENT_FEEDBACK_CPFS">⭐ Client Feedback Sheets (CPFS)</option>
            <option value="COMMENT_CHECKLIST">📋 QA Comment Checklists</option>
            <option value="TECHNICAL_REPORT">Technical Reports (EIA/Geotech)</option>
            <option value="PROPOSAL">Commercial Proposals</option>
            <option value="LAB_CERTIFICATE">Laboratory Certificates</option>
            <option value="REGULATORY_PERMIT">Regulatory Permits</option>
            <option value="GIS_MAP">GIS Maps & CAD Charts</option>
            <option value="INFORMATION_REQUEST_SHEET">📝 Information Request Sheets (IRS)</option>
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.08] text-slate-400 dark:text-[#A39E93] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Document Number & Title</th>
                <th className="px-5 py-3 whitespace-nowrap">Category</th>
                <th className="px-5 py-3 whitespace-nowrap">Version & Size</th>
                <th className="px-5 py-3 whitespace-nowrap">Author / Project</th>
                <th className="px-5 py-3 whitespace-nowrap">QA Release Gate</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] font-medium">
              {filteredDocs.map((doc) => {
                const isApproved = doc.qaStatus === 'RELEASED_TO_CLIENT' || doc.qaStatus === 'QA_APPROVED';
                return (
                  <tr key={doc.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">{doc.documentNumber}</div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{doc.title}</div>
                      </div>
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap shrink-0 border ${getCategoryBadgeStyle(doc.category)}`}>
                        {doc.category.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{doc.version}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tnum">{doc.fileSizeMb} MB • {doc.storageTier.replace(/_/g, ' ')}</div>
                    </td>

                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{doc.authorName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">{doc.projectName || '—'}</div>
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 border ${
                        doc.qaStatus === 'RELEASED_TO_CLIENT' 
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                        doc.qaStatus === 'IN_REVIEW' 
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' :
                          'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                      }`}>
                        {doc.qaStatus === 'RELEASED_TO_CLIENT' ? <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                        {doc.qaStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* Submit for QA Action */}
                      {doc.qaStatus === 'DRAFT_WATERMARKED' && (
                        <button
                          onClick={() => handleOpenQaSubmit(doc)}
                          className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-[0.96]"
                        >
                          Submit QA (M7)
                        </button>
                      )}

                      {/* Download Button */}
                      <button
                        onClick={() => alert(`Downloading: ${doc.title} (${isApproved ? 'Official Clean Copy' : 'DRAFT - WATERMARKED'})`)}
                        className={`p-1.5 rounded-xl border transition-all active:scale-[0.96] ${
                          isApproved 
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                        }`}
                        title={isApproved ? "Download Final Release" : "Download Draft (Watermarked)"}
                      >
                        <Download className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit for QA Modal (Module 7 Integration) */}
      <AnimatePresence>
        {isQaSubmitOpen && selectedDocForQa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQaSubmitOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/10 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/10 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Initiate QA Review Chain</h3>
                </div>
                <button onClick={() => setIsQaSubmitOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">&times;</button>
              </div>

              <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] space-y-1">
                <div className="font-bold">{selectedDocForQa.title}</div>
                <div className="text-[10px] text-purple-600/80 dark:text-purple-300/80">
                  Initiates a 48h SLA review chain: Peer Review ➔ QA Lead ➔ Managing Consultant Sign-off.
                </div>
              </div>

              <form onSubmit={handleConfirmQaSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Peer Reviewer (Technical Specialist)</label>
                  <select
                    value={peerReviewerId}
                    onChange={(e) => setPeerReviewerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {allUsers.filter(u => u.functionalRole === 'PROJECT_MANAGER' || u.functionalRole === 'TECHNICAL_CONSULTANT').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">QA Lead (Methodology & Standards)</label>
                  <select
                    value={qaLeadId}
                    onChange={(e) => setQaLeadId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {allUsers.filter(u => u.functionalRole === 'QA_LEAD' || u.functionalRole === 'MANAGING_CONSULTANT').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/10">
                  <button type="button" onClick={() => setIsQaSubmitOpen(false)} className="px-3 py-1.5 text-slate-500 dark:text-slate-400 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Start QA Review</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/10 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/10 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Technical Deliverable</h3>
                <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Escravos Subsea Soil Stratigraphy Interpretative Report"
                    className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Project</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs truncate text-slate-900 dark:text-white"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectCode} - {p.title.substring(0, 20)}...</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      <option value="TECHNICAL_REPORT">Technical Report</option>
                      <option value="IMML_APPROVAL">Impact Mitigation Monitoring Letter (IMML Approval)</option>
                      <option value="JOB_COMPLETION_CERT">Job Completion Certificate (JCC)</option>
                      <option value="CLIENT_FEEDBACK_CPFS">Client Performance Feedback Sheet (CPFS)</option>
                      <option value="COMMENT_CHECKLIST">Quality Assurance Comment Checklist</option>
                      <option value="PROPOSAL">Commercial Proposal</option>
                      <option value="LAB_CERTIFICATE">Lab Certificate</option>
                      <option value="REGULATORY_PERMIT">Regulatory Permit</option>
                      <option value="GIS_MAP">GIS Map / CAD Chart</option>
                      <option value="INFORMATION_REQUEST_SHEET">Information Request Sheet (IRS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Version</label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">File Size (MB)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fileSizeMb}
                      onChange={(e) => setFileSizeMb(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/10">
                  <button type="button" onClick={() => setIsUploadOpen(false)} className="px-3 py-1.5 text-slate-500 dark:text-slate-400 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold shadow-xs active:scale-[0.96]">Upload to Vault</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Folder Modal (IT & Admin Governed) */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
      />
    </div>
  );
}
