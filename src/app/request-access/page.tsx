'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  UserPlus, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RequestAccessStandalonePage() {
  const { submitAccessRequest, projects } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [departmentName, setDepartmentName] = useState('Geotechnical Engineering');
  const [justification, setJustification] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAccessRequest({
      fullName,
      email,
      jobTitle,
      departmentName,
      professionalLicense: 'COREN / COMEG Registered',
      assignedProjectCode: projects[0]?.projectCode || 'PRJ-2026-001',
      justification
    });
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-slate-900 dark:text-white flex flex-col justify-center items-center p-4 relative select-none">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white dark:bg-[#0a0a0c] rounded-3xl p-7 border border-black/10 dark:border-white/10 shadow-2xl space-y-6 relative z-10"
      >
        {!isSubmitted ? (
          <>
            <div className="space-y-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Request Platform Access</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Employee & Technical Contractor Provisioning</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chibuike Okonkwo"
                  className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aquaearth.ng"
                  className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Field Surveyor"
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Geotechnical Engineering">Geotechnical</option>
                    <option value="Environmental & Social (ESIA)">ESIA</option>
                    <option value="Geoinformatics & Survey">GIS / Survey</option>
                    <option value="Quality Assurance (QA/QC)">QA / QC</option>
                    <option value="Commercial & BD">Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Assignment Justification</label>
                <textarea
                  required
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="State project assignment and reason for access..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Submit Access Request</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request Submitted</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Your request has been queued for Superadmin review.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white rounded-xl text-xs font-semibold"
            >
              Return to Sign In
            </Link>
          </div>
        )}
      </motion.div>

      <div className="text-[10px] text-slate-400 dark:text-slate-600 mt-6 font-medium">
        AquaEarth Access Governance • ISO 27001 / NDPA Compliant
      </div>
    </div>
  );
}
