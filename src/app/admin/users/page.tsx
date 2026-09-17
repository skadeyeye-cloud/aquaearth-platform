'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Lock, 
  UserPlus, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { NewEmployeeModal } from '@/components/hr/NewEmployeeModal';
import { haptics } from '@/lib/haptics';

export default function UserManagementPage() {
  const { currentUser, allUsers, updateUserStatus, updateUserRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);

  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN';
  const isManager = currentUser.managementTier !== 'NONE';

  const visibleUsers = allUsers.filter(u => {
    if (isSuperadmin) return true;
    if (isManager) {
      return u.id === currentUser.id || u.managerId === currentUser.id;
    }
    return u.id === currentUser.id;
  });

  const filteredUsers = visibleUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || u.departmentName?.toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserRole(
      editingUser.id,
      editingUser.functionalRole,
      editingUser.accessTier,
      editingUser.managementTier
    );
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 14 • Access Control & Permissions
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">User Access & Roles</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure functional roles, two-tier access permissions, and Management Tiers.
          </p>
        </div>

        {isSuperadmin && (
          <button 
            type="button"
            onClick={() => {
              haptics.selection();
              setIsNewEmployeeOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision Staff</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="apple-glass-card p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#A39E93] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-[#F6F4F0] placeholder:text-slate-400 dark:placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-[#A39E93]" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#F6F4F0] focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Executive">Executive</option>
            <option value="Geotechnical">Geotechnical</option>
            <option value="Environmental">Environmental (ESIA)</option>
            <option value="Geoinformatics">Geoinformatics & Survey</option>
            <option value="IT">IT & Digital Operations</option>
            <option value="Quality">Quality Control</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 dark:bg-white/[0.03] border-b border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-[#A39E93] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Access Tier</th>
                <th className="px-5 py-3">Management Tier</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
              {filteredUsers.map((user) => {
                const isUserActive = user.status === 'ACTIVE';
                return (
                  <tr key={user.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={user.name}
                          className="w-7 h-7 rounded-xl object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.1]"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-xs">{user.name}</div>
                          <div className="text-[10px] text-slate-400 dark:text-[#A39E93]">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-slate-600 dark:text-[#D1CDC7] text-[11px]">
                      {user.departmentName || 'General Staff'}
                    </td>

                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.2 rounded-md font-semibold text-[10px] whitespace-nowrap shrink-0 ${
                        user.accessTier === 'SUPERADMIN' 
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50' 
                          : user.accessTier === 'ADMIN'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                          : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-[#D1CDC7]'
                      }`}>
                        {user.accessTier}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-700 dark:text-[#D1CDC7] text-[11px] whitespace-nowrap shrink-0">
                      {user.managementTier !== 'NONE' ? user.managementTier.replace('_', ' ') : '—'}
                    </td>

                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.2 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0 ${
                        isUserActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isUserActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap shrink-0">
                      {isSuperadmin && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 text-slate-500 dark:text-[#A39E93] hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-lg transition-colors"
                          title="Edit Permissions"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 inline" />
                        </button>
                      )}

                      {isSuperadmin && user.id !== currentUser.id && (
                        <button
                          onClick={() => updateUserStatus(user.id, isUserActive ? 'DEACTIVATED' : 'ACTIVE')}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all active:scale-[0.96] whitespace-nowrap shrink-0 ${
                            isUserActive 
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50' 
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {isUserActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingUser(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-sm w-full border border-black/[0.08] dark:border-white/[0.1] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{editingUser.name}</h3>
                  <div className="text-[10px] text-slate-400 dark:text-[#A39E93]">Edit Role & Tiers</div>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 dark:text-[#A39E93] hover:text-slate-700 dark:hover:text-white cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleSaveRole} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#D1CDC7] mb-1">Functional Role</label>
                  <select
                    value={editingUser.functionalRole}
                    onChange={(e: any) => setEditingUser({ ...editingUser, functionalRole: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-[#F6F4F0]"
                  >
                    <option value="MANAGING_CONSULTANT">Managing Consultant</option>
                    <option value="BD_LEAD">BD Lead</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="FIELD_STAFF">Field Specialist</option>
                    <option value="QA_LEAD">QA Lead</option>
                    <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                    <option value="HR_ADMIN">HR Administrator</option>
                    <option value="FINANCE_ADMIN">Finance Administrator</option>
                    <option value="IT_LEAD">IT Lead</option>
                    <option value="DESIGN_LEAD">Design Lead</option>
                    <option value="IT_DESIGN_OFFICER">IT/Design Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#D1CDC7] mb-1">Access Tier</label>
                  <select
                    value={editingUser.accessTier}
                    onChange={(e: any) => setEditingUser({ ...editingUser, accessTier: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-[#F6F4F0]"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="ADMIN">Admin (Scoped to reports)</option>
                    <option value="SUPERADMIN">Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#D1CDC7] mb-1">Management Tier</label>
                  <select
                    value={editingUser.managementTier}
                    onChange={(e: any) => setEditingUser({ ...editingUser, managementTier: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-[#F6F4F0]"
                  >
                    <option value="NONE">None (Individual)</option>
                    <option value="TEAM_LEAD">Team Lead</option>
                    <option value="LINE_MANAGER">Line Manager</option>
                    <option value="DEPT_HEAD">Department Head</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-3 py-1.5 text-slate-500 dark:text-[#A39E93] hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold shadow-xs active:scale-[0.96] cursor-pointer">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Provision Staff Modal */}
      <NewEmployeeModal
        isOpen={isNewEmployeeOpen}
        onClose={() => setIsNewEmployeeOpen(false)}
      />
    </div>
  );
}
