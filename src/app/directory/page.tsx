'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Search, Mail, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DirectoryPage() {
  const { allUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 1 • Universal Directory
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Staff Directory</h1>
          <p className="text-xs text-slate-500">
            Find colleagues, roles, and departments across all advisory and technical teams.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search colleagues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Staff Grid with Apple Squircles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <motion.div 
            whileHover={{ y: -2 }}
            key={staff.id} 
            className="apple-glass-card p-5 rounded-3xl space-y-3.5 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={staff.name}
                className="w-11 h-11 rounded-2xl object-cover ring-1 ring-black/[0.08]"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs text-slate-900 truncate">{staff.name}</h3>
                <div className="text-[11px] text-slate-500 font-medium truncate">{staff.jobTitle}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{staff.departmentName || 'Operations'}</div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-black/[0.05] space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate text-[11px]">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-400">Lekki Phase 1 HQ, Lagos</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
