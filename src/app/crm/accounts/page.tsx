'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Building2, 
  Users, 
  Phone, 
  Mail, 
  MessageSquare, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { ClientAccount } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function CrmAccountsPage() {
  const { clients, currentUser, addClientCommunication } = useAuth();
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'REGULATOR'>('CLIENT');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<ClientAccount | null>(null);

  // Add communication modal
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [channel, setChannel] = useState('Meeting');
  const [summary, setSummary] = useState('');
  const [projectTag, setProjectTag] = useState('');

  const filteredAccounts = clients.filter(c => {
    const matchesTab = activeTab === 'CLIENT' ? c.type === 'CLIENT' : (c.type === 'REGULATOR' || c.type === 'STAKEHOLDER');
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.primaryContact.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !summary.trim()) return;

    addClientCommunication(selectedAccount.id, {
      author: currentUser.name,
      channel,
      summary,
      projectTag
    });

    // Update local selected account
    setSelectedAccount(prev => prev ? {
      ...prev,
      lastActivityDate: new Date().toISOString().split('T')[0],
      communicationsLog: [
        {
          id: `com-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: currentUser.name,
          channel,
          summary,
          projectTag
        },
        ...prev.communicationsLog
      ]
    } : null);

    setIsLogOpen(false);
    setSummary('');
    setProjectTag('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 3 • Client & Stakeholder Relationship Management
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Client & Regulator CRM
          </h1>
          <p className="text-xs text-slate-500">
            Unified directory for client organizations, regulatory authorities (FMEnv, NESREA, NUPRC), and institutional communication logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CLIENT')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'CLIENT' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Client Accounts ({clients.filter(c => c.type === 'CLIENT').length})
          </button>
          <button
            onClick={() => setActiveTab('REGULATOR')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'REGULATOR' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Regulators & Stakeholders ({clients.filter(c => c.type !== 'CLIENT').length})
          </button>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="apple-glass-card p-3 rounded-2xl flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations, industries, or contact persons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-black/[0.08] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="text-xs text-slate-400">
          {filteredAccounts.length} organization{filteredAccounts.length === 1 ? '' : 's'} listed
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((account) => {
          const isDormant = account.status === 'DORMANT';
          return (
            <motion.div
              whileHover={{ y: -2 }}
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={`apple-glass-card p-5 rounded-3xl space-y-3 cursor-pointer transition-all ${
                isDormant ? 'border-amber-200/80 bg-amber-50/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                  isDormant ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  account.type === 'REGULATOR' ? 'bg-purple-100 text-purple-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {isDormant ? 'Dormant (>90d)' : account.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{account.name}</h3>
                <div className="text-[11px] text-slate-500">{account.industry}</div>
              </div>

              <div className="pt-2.5 border-t border-black/[0.05] space-y-1.5 text-xs text-slate-600">
                <div className="text-[11px] font-semibold text-slate-800 flex items-center justify-between">
                  <span>Lead Contact: {account.primaryContact.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{account.primaryContact.preferredChannel}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{account.primaryContact.email}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-slate-400">
                <span>Active Projects: <b className="text-slate-700 tnum">{account.activeProjectsCount}</b></span>
                <span>Last Engaged: <b className="text-slate-700 tnum">{account.lastActivityDate}</b></span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 360° Account Detail Drawer / Modal */}
      <AnimatePresence>
        {selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAccount(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-black/[0.08] p-6 space-y-5 z-10 text-xs max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-black/[0.05] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700">
                      {selectedAccount.type}
                    </span>
                    <span className="text-[11px] text-slate-400">{selectedAccount.industry}</span>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900">{selectedAccount.name}</h2>
                  <p className="text-[11px] text-slate-500">{selectedAccount.address}</p>
                </div>
                <button onClick={() => setSelectedAccount(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              {/* Primary Contact Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-black/[0.05] space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Contact Person</div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{selectedAccount.primaryContact.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedAccount.primaryContact.role}</div>
                  </div>
                  <div className="text-right space-y-0.5 text-[11px] text-slate-600">
                    <div className="font-mono tnum">{selectedAccount.primaryContact.phone}</div>
                    <div className="text-slate-400">{selectedAccount.primaryContact.email}</div>
                  </div>
                </div>
              </div>

              {/* Communications Log Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Communications & Engagement Log (PRD FR 29)</span>
                  </h3>
                  <button
                    onClick={() => setIsLogOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold active:scale-[0.96]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Log Call / Meeting</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedAccount.communicationsLog.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border border-black/[0.06] bg-white space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {log.channel} • by {log.author}
                        </span>
                        <span className="text-slate-400 font-mono tnum">{log.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{log.summary}</p>
                      {log.projectTag && (
                        <div className="text-[9px] font-semibold text-emerald-700">Project: #{log.projectTag}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-black/[0.05]">
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Interaction Modal */}
      <AnimatePresence>
        {isLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <h3 className="text-sm font-bold text-slate-900">Log Account Interaction</h3>
                <button onClick={() => setIsLogOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Channel / Interaction Type</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-medium"
                  >
                    <option value="In-Person Meeting">In-Person Meeting</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email Exchange">Email Exchange</option>
                    <option value="Official Regulatory Submission">Official Regulatory Submission</option>
                    <option value="Video Conference (Teams/Zoom)">Video Conference (Teams/Zoom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tagged Project / Tender (Optional)</label>
                  <input
                    type="text"
                    value={projectTag}
                    onChange={(e) => setProjectTag(e.target.value)}
                    placeholder="e.g. Escravos Expansion, OML-130, Statutory Audit"
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Summary & Key Action Items</label>
                  <textarea
                    required
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Document discussion points, agreed milestones, or decisions..."
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setIsLogOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Save Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
