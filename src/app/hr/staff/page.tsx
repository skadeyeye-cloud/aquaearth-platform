'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Award, 
  Download, 
  CheckCircle2, 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HRStaffPage() {
  const { allUsers, certifications } = useAuth();
  const [activeTab, setActiveTab] = useState<'STAFF' | 'CERTS' | 'QUARTERLY_REPORT'>('STAFF');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 9 • Human Resources & Competency
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Staff & Certifications</h1>
          <p className="text-xs text-slate-500">
            Professional licenses (COREN, COMEG, FMEnv), competencies, and automated quarterly HR reporting.
          </p>
        </div>

        {/* Tab Controls (Apple Segmented Style) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'STAFF' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Staff Roster ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('CERTS')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'CERTS' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Certifications ({certifications.length})
          </button>
          <button
            onClick={() => setActiveTab('QUARTERLY_REPORT')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'QUARTERLY_REPORT' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Auto HR Report
          </button>
        </div>
      </div>

      {/* Tab 1: Staff */}
      {activeTab === 'STAFF' && (
        <div className="apple-glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/60 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Reporting Line</th>
                  <th className="px-5 py-3">Tenure</th>
                  <th className="px-5 py-3">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] font-medium">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={user.name}
                          className="w-7 h-7 rounded-xl object-cover ring-1 ring-black/[0.06]"
                        />
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-[11px]">{user.departmentName || 'Operations'}</td>
                    <td className="px-5 py-3 text-slate-600 text-[11px]">
                      {user.managerName ? `Reports to ${user.managerName}` : 'Executive'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px] tnum">
                      Since {user.createdAt.substring(0, 4)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.2 rounded-md font-semibold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                        85% Billable
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Certifications */}
      {activeTab === 'CERTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certifications.map((cert) => {
            const isImpending = cert.daysUntilExpiry <= 30;
            return (
              <motion.div 
                whileHover={{ y: -2 }}
                key={cert.id} 
                className="apple-glass-card p-5 rounded-3xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full tnum ${
                    isImpending ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {cert.daysUntilExpiry} days left
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 line-clamp-2">{cert.name}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">Holder: <b>{cert.userName}</b></div>
                  <div className="text-[10px] text-slate-400">{cert.issuingBody} • {cert.certNumber || 'Active'}</div>
                </div>

                <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-slate-400">
                  <span>Expiry: <b className="text-slate-600 tnum">{cert.expiryDate}</b></span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Report */}
      {activeTab === 'QUARTERLY_REPORT' && (
        <div className="apple-glass-card p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">FR 98 Automated Assembly</span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">Q3 2026 HR & Resource Allocation Report</h2>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.96]">
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-black/[0.04]">
              <div className="text-2xl font-black text-slate-900 tnum">{allUsers.length}</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Staff Headcount</div>
            </div>
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-black/[0.04]">
              <div className="text-2xl font-black text-emerald-600 tnum">86.4%</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Billable Utilization</div>
            </div>
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-black/[0.04]">
              <div className="text-2xl font-black text-blue-600 tnum">100%</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Certs in Good Standing</div>
            </div>
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-black/[0.04]">
              <div className="text-2xl font-black text-purple-600 tnum">8</div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">Approved Leave Days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
