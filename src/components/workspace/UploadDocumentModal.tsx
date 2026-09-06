'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DocumentCategory } from '@/lib/types';
import { 
  X, 
  UploadCloud, 
  FileText, 
  FileCheck, 
  ShieldAlert, 
  HardDrive, 
  FolderKanban, 
  Sparkles,
  FileType,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadDocumentModal({ isOpen, onClose, onSuccess }: UploadDocumentModalProps) {
  const { currentUser, projects, uploadDocument } = useAuth();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [category, setCategory] = useState<DocumentCategory>('TECHNICAL_REPORT');
  const [version, setVersion] = useState('v0.1 Draft');
  const [fileSizeMb, setFileSizeMb] = useState<number>(8.4);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFileName(file.name);
    const sizeMb = Number((file.size / (1024 * 1024)).toFixed(1));
    setFileSizeMb(sizeMb > 0 ? sizeMb : 1.2);
    
    // Auto-detect title from file name without extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    if (!title) {
      setTitle(nameWithoutExt.replace(/[-_]/g, ' '));
    }

    // Auto-categorize by extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      if (file.name.toLowerCase().includes('report') || file.name.toLowerCase().includes('esia')) {
        setCategory('TECHNICAL_REPORT');
      } else if (file.name.toLowerCase().includes('proposal')) {
        setCategory('PROPOSAL');
      } else if (file.name.toLowerCase().includes('permit')) {
        setCategory('REGULATORY_PERMIT');
      }
    } else if (ext === 'docx' || ext === 'doc') {
      setCategory('TECHNICAL_REPORT');
    } else if (ext === 'pptx' || ext === 'ppt') {
      setCategory('PROPOSAL');
    } else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      setCategory('GIS_MAP');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    haptics.impact();

    // Simulate upload progress animation
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        
        const proj = projects.find(p => p.id === projectId);
        uploadDocument({
          title: title.trim(),
          projectId: projectId || undefined,
          projectName: projectId ? (proj?.title || 'General Project') : undefined,
          category,
          version,
          fileSizeMb,
          authorName: currentUser.name,
          qaStatus: 'DRAFT_WATERMARKED',
          storageTier: 'ACTIVE_VAULT',
          downloadUrl: `/vault/downloads/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}.pdf`
        });

        haptics.success();
        setIsSubmitting(false);
        setUploadProgress(0);
        setSelectedFileName(null);
        setTitle('');
        if (onSuccess) onSuccess();
        onClose();
      }
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative w-full max-w-xl bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-2xl p-6 z-10 space-y-5 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-black/[0.05] dark:border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap shrink-0">
                Module 6 • Direct Intake
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0 inline-flex items-center gap-1">
                <HardDrive className="w-2.5 h-2.5" />
                Active Vault Staging
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Upload Document to Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload technical deliverables, Word/PDF reports, or CAD/GIS maps directly into the sovereign archive.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' 
                : selectedFileName 
                  ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20' 
                  : 'border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/25 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {selectedFileName ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                    {selectedFileName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 tnum">
                    {fileSizeMb} MB • Click or drop new file to replace
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto stroke-1" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Drop Word (.docx), PDF, PowerPoint (.pptx), or Image files here
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  or click to browse from your device • Max single file size 150 MB
                </div>
              </div>
            )}
          </div>

          {/* Title Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Escravos Tank 12 Sedimentology Log Final Draft"
              className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Version Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="TECHNICAL_REPORT">Technical Report / ESIA</option>
                <option value="PROPOSAL">Commercial Proposal / RFP</option>
                <option value="LAB_CERTIFICATE">Lab Certificate & Soil Analysis</option>
                <option value="REGULATORY_PERMIT">Regulatory Permit (FMEnv / NESREA)</option>
                <option value="GIS_MAP">GIS / Bathymetry / CAD Map</option>
                <option value="FIELD_LOG">Field Data Capture Log</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Initial Version Tag
              </label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="v0.1 Draft">v0.1 Draft (Internal Review)</option>
                <option value="v0.2 Draft">v0.2 Revised Draft</option>
                <option value="v0.9 Pre-QA">v0.9 Pre-QA Release Candidate</option>
                <option value="v1.0 Final">v1.0 Final (QA Signed)</option>
              </select>
            </div>
          </div>

          {/* Associated Project */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Associated Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">🏢 Firm-Wide Template / General Repository</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} — {p.title} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Automated Watermark Warning Banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <span className="font-bold">Automated ISO/FMEnv Watermarking:</span>
              <p className="text-amber-800/80 dark:text-amber-300/80">
                Deliverables in draft stage will automatically carry the cryptographic <b>"DRAFT - FOR INTERNAL REVIEW ONLY"</b> watermark until 4-stage review is completed in Module 7.
              </p>
            </div>
          </div>

          {/* Progress Bar (during submission) */}
          {isSubmitting && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Encrypting & Staging in Sovereign Vault...</span>
                <span className="tnum">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-[0.96]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-[0.96] disabled:opacity-50 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmitting ? 'Staging File...' : 'Upload & Stage Document'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
