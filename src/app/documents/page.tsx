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
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 6 • Engineering & Scientific Document Repository
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Documents & Knowledge Base
          </h1>
          <p className="text-xs text-slate-500">
            Version-controlled repository for technical reports, bathymetric charts, lab certificates, and FMEnv regulatory filings.
          </p>
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
            <option value="TECHNICAL_REPORT">Technical Reports (EIA/Geotech)</option>
            <option value="PROPOSAL">Commercial Proposals</option>
            <option value="LAB_CERTIFICATE">Laboratory Certificates</option>
            <option value="REGULATORY_PERMIT">Regulatory Permits</option>
            <option value="GIS_MAP">GIS Maps & CAD Charts</option>
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Document Number & Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Version & Size</th>
                <th className="px-5 py-3">Author / Project</th>
                <th className="px-5 py-3">QA Release Gate</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-medium">
              {filteredDocs.map((doc) => {
                const isApproved = doc.qaStatus === 'RELEASED_TO_CLIENT' || doc.qaStatus === 'QA_APPROVED';
                return (
                  <tr key={doc.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[10px] font-bold text-slate-500">{doc.documentNumber}</div>
                        <div className="font-semibold text-xs text-slate-900 line-clamp-1">{doc.title}</div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className="px-2 py-0.2 rounded-md font-semibold text-[10px] bg-slate-100 text-slate-700">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-600 text-[11px]">
                      <div className="font-bold text-slate-800">{doc.version}</div>
                      <div className="text-[10px] text-slate-400 font-mono tnum">{doc.fileSizeMb} MB • {doc.storageTier.replace('_', ' ')}</div>
                    </td>

                    <td className="px-5 py-3 text-slate-600 text-[11px]">
                      <div className="font-semibold text-slate-800">{doc.authorName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{doc.projectName || '—'}</div>
                    </td>

                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.qaStatus === 'RELEASED_TO_CLIENT' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        doc.qaStatus === 'IN_REVIEW' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {doc.qaStatus === 'RELEASED_TO_CLIENT' ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                        {doc.qaStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right space-x-1.5">
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
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQaSubmitOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase">PRD Module 7 Gate</span>
                  <h3 className="text-sm font-bold text-slate-900">Initiate QA Review Chain</h3>
                </div>
                <button onClick={() => setIsQaSubmitOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 text-[11px] space-y-1">
                <div className="font-bold">{selectedDocForQa.title}</div>
                <div className="text-[10px] text-purple-800/80">
                  Initiates a 48h SLA review chain: Peer Review ➔ QA Lead ➔ Managing Consultant Sign-off.
                </div>
              </div>

              <form onSubmit={handleConfirmQaSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assign Peer Reviewer (Technical Specialist)</label>
                  <select
                    value={peerReviewerId}
                    onChange={(e) => setPeerReviewerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-semibold"
                  >
                    {allUsers.filter(u => u.functionalRole === 'PROJECT_MANAGER' || u.functionalRole === 'TECHNICAL_CONSULTANT').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">QA Lead (Methodology & Standards)</label>
                  <select
                    value={qaLeadId}
                    onChange={(e) => setQaLeadId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-semibold"
                  >
                    {allUsers.filter(u => u.functionalRole === 'QA_LEAD' || u.functionalRole === 'MANAGING_CONSULTANT').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setIsQaSubmitOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-purple-700 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Start QA Review</button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <h3 className="text-sm font-bold text-slate-900">Upload Technical Deliverable</h3>
                <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Escravos Subsea Soil Stratigraphy Interpretative Report"
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Project</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs truncate"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectCode} - {p.title.substring(0, 20)}...</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                    >
                      <option value="TECHNICAL_REPORT">Technical Report</option>
                      <option value="PROPOSAL">Commercial Proposal</option>
                      <option value="LAB_CERTIFICATE">Lab Certificate</option>
                      <option value="GIS_MAP">GIS Map / CAD Chart</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Version</label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">File Size (MB)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fileSizeMb}
                      onChange={(e) => setFileSizeMb(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setIsUploadOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Upload to Vault</button>
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
