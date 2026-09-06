'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

export default function OrgHierarchyPage() {
  const { allUsers } = useAuth();

  const managingConsultant = allUsers.find(u => u.functionalRole === 'MANAGING_CONSULTANT') || allUsers[0];
  const directReports = allUsers.filter(u => u.managerId === managingConsultant.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
          Module 14 & 9 • Organizational Architecture
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          Organizational Hierarchy & Reporting Lines
        </h1>
        <p className="text-xs text-slate-500">
          Defines Line Manager KPI visibility, task delegation scopes, and approval trees.
        </p>
      </div>

      {/* Visual Org Canvas */}
      <div className="apple-glass-card p-8 rounded-3xl flex flex-col items-center space-y-8 overflow-x-auto">
        {/* Top Node */}
        <div className="flex flex-col items-center">
          <motion.div 
            whileHover={{ y: -3 }}
            className="p-5 bg-slate-900 text-white rounded-3xl shadow-xl w-72 text-center space-y-2 relative border border-white/10"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">
              Superadmin & Dept Head
            </span>
            <img
              src={managingConsultant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={managingConsultant.name}
              className="w-12 h-12 rounded-2xl object-cover mx-auto ring-2 ring-emerald-400 mt-1"
            />
            <div>
              <div className="font-bold text-sm text-white">{managingConsultant.name}</div>
              <div className="text-[11px] text-emerald-300 font-medium">{managingConsultant.jobTitle}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Executive Leadership</div>
            </div>
          </motion.div>

          <div className="h-6 w-px bg-slate-300 my-1" />
          <div className="w-full max-w-4xl h-px bg-slate-300" />
        </div>

        {/* Level 2 Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-5xl">
          {directReports.map((mgr) => {
            const subordinates = allUsers.filter(u => u.managerId === mgr.id);
            return (
              <div key={mgr.id} className="flex flex-col items-center space-y-3">
                <div className="h-6 w-px bg-slate-300 -mt-8" />
                
                {/* Manager Card */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-4 bg-white/90 rounded-2xl border border-black/[0.08] text-center w-full shadow-xs space-y-1.5"
                >
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.2 rounded-full uppercase whitespace-nowrap shrink-0">
                    {mgr.managementTier.replace('_', ' ')}
                  </span>
                  <img
                    src={mgr.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={mgr.name}
                    className="w-9 h-9 rounded-xl object-cover mx-auto ring-1 ring-black/[0.06]"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{mgr.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{mgr.jobTitle}</div>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-black/[0.04] tnum">
                    {subordinates.length} Direct Report{subordinates.length === 1 ? '' : 's'}
                  </div>
                </motion.div>

                {/* Subordinates */}
                {subordinates.length > 0 && (
                  <div className="w-full space-y-1.5 pl-3 border-l-2 border-dashed border-slate-200">
                    {subordinates.map((sub) => (
                      <div key={sub.id} className="p-2 bg-slate-50/80 rounded-xl border border-black/[0.04] text-left text-xs flex items-center gap-2">
                        <img
                          src={sub.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'}
                          alt={sub.name}
                          className="w-6 h-6 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-800 truncate">{sub.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{sub.jobTitle}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
