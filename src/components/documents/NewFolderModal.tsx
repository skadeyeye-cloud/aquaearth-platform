'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, ShieldAlert, CheckCircle2, Lock, Folder, ShieldCheck } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewFolderModal({ isOpen, onClose, onSuccess }: NewFolderModalProps) {
  const { currentUser, createDocumentFolder } = useAuth();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [description, setDescription] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check RBAC: Only IT and Admins can create non-project loose folders
  const isAuthorized = 
    currentUser.functionalRole === 'IT_LEAD' || 
    currentUser.functionalRole === 'IT_DESIGN_OFFICER' || 
    currentUser.accessTier === 'SUPERADMIN' || 
    currentUser.accessTier === 'ADMIN';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMsg('Unauthorized: Loose folder creation is strictly restricted to IT Support and System Administrators.');
      return;
    }
    if (!name.trim()) return;

    setIsSubmitting(true);
    haptics.impact();

    const result = createDocumentFolder({
      name: name.trim(),
      department,
      description: description.trim() || 'General institutional document repository',
      isRestricted
    });

    if (result.success) {
      haptics.success();
      setIsSubmitting(false);
      setName('');
      setDescription('');
      setErrorMsg('');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Departmental Folder</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Institutional non-project directory</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Authorization Check / Governance Warning */}
          {!isAuthorized ? (
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 flex items-start gap-3">
                <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-300">
                    IT & Admin Permission Required
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                    Not every document belongs to a project. To prevent loose or unstructured folder proliferation, creating institutional folders outside project workspaces is strictly restricted to <strong>IT Support</strong> and <strong>System Administrators</strong>.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If your department requires a dedicated non-project folder (e.g. for ISO audit evidence, corporate governance, or departmental templates), please submit an IT Support ticket or contact your system administrator.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Authorized as <strong className="font-semibold">{currentUser.name}</strong> ({currentUser.functionalRole})</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Folder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. ISO 9001 Audits, Corporate Tax & Legal, Field Safety Manuals"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Owning Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Operations">Operations</option>
                  <option value="Field & Laboratory">Field & Laboratory</option>
                  <option value="Finance & Invoicing">Finance & Invoicing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="IT & Design">IT & Design</option>
                  <option value="Executive Management">Executive Management</option>
                  <option value="Business Development">Business Development</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Folder Purpose & Policy</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Specify what document types belong in this folder..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Confidential / Restricted Access</div>
                  <div className="text-[11px] text-slate-500">Only authorized departmental officers can view deliverables inside</div>
                </div>
                <input
                  type="checkbox"
                  checked={isRestricted}
                  onChange={e => setIsRestricted(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Creating...' : 'Provision Folder'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
