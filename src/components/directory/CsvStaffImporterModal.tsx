'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Users, 
  ArrowRight,
  RefreshCw,
  Trash2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

interface CsvStaffImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ParsedStaffRow {
  index: number;
  name: string;
  email: string;
  jobTitle: string;
  departmentName: string;
  functionalRole: string;
  accessTier: string;
  managementTier: string;
  managerEmail: string;
  phone: string;
  location: string;
  skills: string[];
  certificationsList: string[];
  isValid: boolean;
  errors: string[];
}

export default function CsvStaffImporterModal({
  isOpen,
  onClose,
  onImportSuccess
}: CsvStaffImporterModalProps) {
  const { allUsers, bulkImportUsers } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStaffRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  // Handle sample template download
  const handleDownloadTemplate = () => {
    haptics.selection();
    const headers = 'Full Name,Email,Job Title,Department,Functional Role,Access Tier,Management Tier,Manager Email,Phone,Location,Skills,Certifications';
    const sampleRows = [
      'Babatunde Adeleke,babatunde.adeleke@aquaearth.com,Senior Marine Geophysicist,Geotechnical & Geophysics,TECHNICAL_CONSULTANT,STANDARD,NONE,femi.adebayo@aquaearth.com,+234 802 333 4444,Escravos Terminal Base,"Side Scan Sonar; Sub-bottom Profiling; Bathymetry; Seismic Interpretation","COMEG Licensed; COREN Registered"',
      'Dr. Kelechi Okonkwo,kelechi.okonkwo@aquaearth.com,Lead Hydrogeologist,ESIA & Environmental Studies,TECHNICAL_CONSULTANT,STANDARD,NONE,ngozi.eze@aquaearth.com,+234 803 555 6789,Lekki Phase 1 HQ Lagos,"Groundwater Modeling; MODFLOW; Aquifer Testing; Contaminant Transport","COMEG Fellow; NMGS Member"',
      'Fatima Mohammed,fatima.mohammed@aquaearth.com,HSE & Compliance Specialist,Quality & Field Operations,FIELD_OPERATOR,STANDARD,NONE,emeka.nnamdi@aquaearth.com,+234 809 777 8899,Bonny Island Operations,"NEBOSH IGC; FMEnv Audit Protocol; Field Safety Inductions","NEBOSH Certified; ISPON Member"'
    ];
    const csvContent = [headers, ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aquaearth_staff_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Line Parser handling quotes and commas
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Parse Raw CSV Text
  const processCsvText = (text: string, fileLabel: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setParsedRows([]);
      setFileName(fileLabel);
      return;
    }

    const headerLine = lines[0];
    const headers = parseCsvLine(headerLine).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Map column indices
    const colMap: Record<string, number> = {
      name: headers.findIndex(h => h.includes('name')),
      email: headers.findIndex(h => h.includes('email') && !h.includes('manager')),
      jobTitle: headers.findIndex(h => h.includes('title') || h.includes('role') || h.includes('position')),
      department: headers.findIndex(h => h.includes('dept') || h.includes('department')),
      functionalRole: headers.findIndex(h => h.includes('func') || h.includes('functional')),
      accessTier: headers.findIndex(h => h.includes('access')),
      managementTier: headers.findIndex(h => h.includes('mgmt') || h.includes('management')),
      managerEmail: headers.findIndex(h => h.includes('manager')),
      phone: headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel')),
      location: headers.findIndex(h => h.includes('location') || h.includes('office') || h.includes('base')),
      skills: headers.findIndex(h => h.includes('skill') || h.includes('competenc')),
      certifications: headers.findIndex(h => h.includes('cert') || h.includes('license'))
    };

    const parsed: ParsedStaffRow[] = [];
    const seenBatchEmails = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const rowValues = parseCsvLine(lines[i]);
      if (rowValues.length === 0 || rowValues.every(val => !val)) continue;

      const name = colMap.name !== -1 ? rowValues[colMap.name] || '' : rowValues[0] || '';
      const email = (colMap.email !== -1 ? rowValues[colMap.email] || '' : rowValues[1] || '').trim().toLowerCase();
      const jobTitle = colMap.jobTitle !== -1 ? rowValues[colMap.jobTitle] || '' : rowValues[2] || '';
      const departmentName = colMap.department !== -1 ? rowValues[colMap.department] || '' : rowValues[3] || 'General Operations';
      const functionalRole = colMap.functionalRole !== -1 ? rowValues[colMap.functionalRole] || 'TECHNICAL_CONSULTANT' : 'TECHNICAL_CONSULTANT';
      const accessTier = colMap.accessTier !== -1 ? rowValues[colMap.accessTier] || 'STANDARD' : 'STANDARD';
      const managementTier = colMap.managementTier !== -1 ? rowValues[colMap.managementTier] || 'NONE' : 'NONE';
      const managerEmail = colMap.managerEmail !== -1 ? (rowValues[colMap.managerEmail] || '').trim().toLowerCase() : '';
      const phone = colMap.phone !== -1 ? rowValues[colMap.phone] || '+234 800 000 0000' : '+234 800 000 0000';
      const location = colMap.location !== -1 ? rowValues[colMap.location] || 'Lekki Phase 1 HQ, Lagos' : 'Lekki Phase 1 HQ, Lagos';
      
      const skillsRaw = colMap.skills !== -1 ? rowValues[colMap.skills] || '' : '';
      const skills = skillsRaw ? skillsRaw.split(/[;,]/).map(s => s.trim()).filter(Boolean) : ['Technical Advisory', 'Reporting'];

      const certsRaw = colMap.certifications !== -1 ? rowValues[colMap.certifications] || '' : '';
      const certificationsList = certsRaw ? certsRaw.split(/[;,]/).map(c => c.trim()).filter(Boolean) : [];

      const errors: string[] = [];
      if (!name.trim()) errors.push('Full name is required');
      if (!email || !email.includes('@') || !email.includes('.')) errors.push('Valid email address is required');
      if (!jobTitle.trim()) errors.push('Job title is required');

      // Check existing system users
      if (allUsers.some(u => u.email.toLowerCase() === email)) {
        errors.push(`Email already exists in directory (${email})`);
      }

      // Check duplicate within the uploaded batch
      if (seenBatchEmails.has(email)) {
        errors.push(`Duplicate email in CSV batch (${email})`);
      } else if (email) {
        seenBatchEmails.add(email);
      }

      parsed.push({
        index: i,
        name,
        email,
        jobTitle,
        departmentName,
        functionalRole,
        accessTier,
        managementTier,
        managerEmail,
        phone,
        location,
        skills,
        certificationsList,
        isValid: errors.length === 0,
        errors
      });
    }

    setFileName(fileLabel);
    setParsedRows(parsed);
    setImportResult(null);
  };

  // File Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      processCsvText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      processCsvText(content, file.name);
    };
    reader.readAsText(file);
  };

  // Perform Bulk Import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);
    haptics.selection();

    setTimeout(() => {
      const recordsToImport = validRows.map(r => ({
        name: r.name,
        email: r.email,
        jobTitle: r.jobTitle,
        departmentName: r.departmentName,
        functionalRole: r.functionalRole,
        accessTier: r.accessTier,
        managementTier: r.managementTier,
        managerEmail: r.managerEmail,
        phone: r.phone,
        location: r.location,
        skills: r.skills,
        certificationsList: r.certificationsList
      }));

      const res = bulkImportUsers(recordsToImport);
      setIsImporting(false);
      setImportResult(res);

      if (res.successCount > 0) {
        haptics.success();
        if (onImportSuccess) onImportSuccess();
      }
    }, 600);
  };

  // Clear Uploaded
  const handleReset = () => {
    haptics.selection();
    setFileName(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-3xl bg-white dark:bg-[#0e0e11] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Bulk Staff Roster Importer
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
                    PRD Req 11
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Import employee profiles, reporting hierarchies, and competencies via CSV.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                haptics.selection();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Action Bar / Template Download */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Need the standardized format?
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Includes Nigerian Geotech, ESIA, and QA/QC sample profiles.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/15 text-xs font-semibold border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Download Sample Template (.csv)</span>
              </button>
            </div>

            {/* Drag & Drop Dropzone */}
            {!fileName ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-500/5 scale-[0.99]'
                    : 'border-black/[0.1] dark:border-white/[0.15] hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Drop staff CSV file here, or browse
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Supports comma-separated `.csv` rosters with headers (Name, Email, Job Title, Department, Manager Email).
                </div>
              </div>
            ) : (
              /* File Loaded View */
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {fileName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{validCount} valid</span>
                        {errorCount > 0 && (
                          <span className="text-rose-500 font-semibold">• {errorCount} issues</span>
                        )}
                        <span>• {parsedRows.length} total rows</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Validation Summary & Row Preview */}
                <div className="border border-black/[0.08] dark:border-white/[0.1] rounded-2xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <span>Parsed Roster Preview</span>
                    <span className="font-normal text-slate-400">
                      Review column validation before provisioning
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
                    {parsedRows.map((row) => (
                      <div
                        key={row.index}
                        className={`p-3 flex items-start justify-between gap-4 transition-colors ${
                          row.isValid
                            ? 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                            : 'bg-rose-500/5 dark:bg-rose-500/10'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="mt-0.5 shrink-0">
                            {row.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {row.name || 'Unnamed Employee'}
                              </span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0">
                                {row.departmentName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {row.jobTitle} • {row.email}
                            </div>
                            {row.managerEmail && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Direct Line: reports to <span className="font-medium text-slate-600 dark:text-slate-300">{row.managerEmail}</span>
                              </div>
                            )}
                            {!row.isValid && (
                              <div className="mt-1 space-y-0.5">
                                {row.errors.map((err, eIdx) => (
                                  <div key={eIdx} className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                    • {err}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                            row.isValid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {row.isValid ? 'Ready to Provision' : 'Invalid'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Import Result Feedback */}
                {importResult && (
                  <div className={`p-4 rounded-2xl border text-xs ${
                    importResult.successCount > 0
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {importResult.successCount > 0 ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Successfully provisioned {importResult.successCount} staff profiles!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>No staff profiles could be imported.</span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] mt-1 opacity-90">
                      User accounts have been added to the directory with credentials, department assignments, and audit logging.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              {importResult?.successCount ? 'Close' : 'Cancel'}
            </button>

            {fileName && !importResult?.successCount && (
              <button
                type="button"
                disabled={validCount === 0 || isImporting}
                onClick={handleExecuteImport}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                  validCount > 0 && !isImporting
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Provisioning Profiles...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span>Import {validCount} Staff Members</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}

            {importResult?.successCount ? (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>View in Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
