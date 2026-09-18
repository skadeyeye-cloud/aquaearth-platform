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
  Send,
  X
} from 'lucide-react';
import { ClientAccount } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

export default function CrmAccountsPage() {
  const { clients, currentUser, addClientCommunication, createClientOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'REGULATOR'>('CLIENT');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<ClientAccount | null>(null);

  // Add communication modal
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [channel, setChannel] = useState('Meeting');
  const [summary, setSummary] = useState('');
  const [projectTag, setProjectTag] = useState('');

  // Create Client Modal state
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientType, setNewClientType] = useState<'CLIENT' | 'REGULATOR' | 'STAKEHOLDER'>('CLIENT');
  const [newClientIndustry, setNewClientIndustry] = useState('Energy & Infrastructure');
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('Procurement & Contracts Lead');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('+234 ');
  const [newClientAddress, setNewClientAddress] = useState('Lagos, Nigeria');

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
    haptics.success();
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    createClientOrganization({
      name: newClientName.trim(),
      type: newClientType,
      industry: newClientIndustry.trim() || 'Energy & Infrastructure',
      primaryContact: {
        name: newContactName.trim() || 'Commercial Liaison',
        role: newContactRole.trim() || 'Contracts Manager',
        email: newContactEmail.trim() || 'contracts@client.com',
        phone: newContactPhone.trim() || '+234 800 000 0000',
        preferredChannel: 'EMAIL' as const
      },
      address: newClientAddress.trim() || 'Lagos, Nigeria',
      status: 'ACTIVE',
      lastActivityDate: new Date().toISOString().split('T')[0]
    });

    setIsNewClientOpen(false);
    setNewClientName('');
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewClientAddress('');
    haptics.success();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tracking-tight">
            Client & Regulator CRM
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl text-xs font-semibold">
            <button
              onClick={() => { haptics.selection(); setActiveTab('CLIENT'); }}
              className={`px-3 py-1 rounded-xl transition-all active:scale-[0.96] ${
                activeTab === 'CLIENT' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-bold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              Clients ({clients.filter(c => c.type === 'CLIENT').length})
            </button>
            <button
              onClick={() => { haptics.selection(); setActiveTab('REGULATOR'); }}
              className={`px-3 py-1 rounded-xl transition-all active:scale-[0.96] ${
                activeTab === 'REGULATOR' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F6F4F0] shadow-xs font-bold' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              Regulators ({clients.filter(c => c.type !== 'CLIENT').length})
            </button>
          </div>

          {/* Create New Client Action Button */}
          <button
            onClick={() => { haptics.selection(); setIsNewClientOpen(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.96] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Client Account</span>
          </button>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations, industries, or contact persons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0] placeholder:text-[#86868B] focus:outline-none"
          />
        </div>
        <div className="text-xs text-[#86868B] font-mono tnum">
          {filteredAccounts.length} organization{filteredAccounts.length === 1 ? '' : 's'} listed
        </div>
      </div>

      {/* Accounts Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((account) => {
          const isDormant = new Date().getTime() - new Date(account.lastActivityDate || '2026-01-01').getTime() > 90 * 24 * 60 * 60 * 1000;
          return (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className="bg-white dark:bg-[#0C0C0D] border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 space-y-4 hover:border-black/[0.12] dark:hover:border-white/[0.15] cursor-pointer transition-all shadow-xs group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center text-base font-bold text-[#1D1D1F] dark:text-[#F6F4F0] shrink-0">
                  {account.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F6F4F0] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {account.name}
                  </h3>
                  <p className="text-[11px] text-[#86868B] truncate">{account.industry}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                  account.type === 'CLIENT' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                  account.type === 'REGULATOR' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {account.type}
                </span>
              </div>

              {/* Primary Contact Details */}
              <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 text-xs">
                <div className="font-medium text-[#1D1D1F] dark:text-[#F6F4F0] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#86868B] dark:text-[#A39E93]" />
                  <span>{account.primaryContact.name}</span>
                  <span className="text-[10px] text-[#86868B] dark:text-[#D1CDC7]">({account.primaryContact.role})</span>
                </div>
                <div className="text-[11px] text-[#86868B] dark:text-[#D1CDC7] flex items-center gap-3">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#86868B] dark:text-[#A39E93]" /> {account.primaryContact.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#86868B] dark:text-[#A39E93]" /> {account.primaryContact.phone}</span>
                </div>
              </div>

              {/* Account Telemetry */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[#86868B]">
                  {account.activeProjectsCount || 0} active project{(account.activeProjectsCount || 0) === 1 ? '' : 's'}
                </span>
                <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] tnum">
                  ₦{((account.totalRevenueBilled || 0) / 1000000).toFixed(1)}M billed
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account 360° Drawer */}
      <AnimatePresence>
        {selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAccount(null)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-lg h-full bg-white dark:bg-[#0C0C0D] border-l border-black/[0.08] dark:border-white/[0.1] p-6 space-y-6 overflow-y-auto shadow-2xl z-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#86868B]">{selectedAccount.type} Account Profile</span>
                  <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F6F4F0]">{selectedAccount.name}</h2>
                  <p className="text-xs text-[#86868B]">{selectedAccount.industry}</p>
                </div>
                <button onClick={() => setSelectedAccount(null)} className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action: Log Communication */}
              <div className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F6F4F0]">Log Client Interaction / Meeting</span>
                <button
                  onClick={() => setIsLogOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-xs"
                >
                  + Add Log
                </button>
              </div>

              {/* Interaction History */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-[#86868B] tracking-wider">Communication Logs</h3>
                <div className="space-y-3">
                  {(selectedAccount.communicationsLog || []).map((log) => (
                    <div key={log.id} className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{log.channel}</span>
                        <span className="text-[#86868B] font-mono tnum">{log.date}</span>
                      </div>
                      <p className="text-xs text-[#1D1D1F] dark:text-[#F6F4F0] leading-relaxed">{log.summary}</p>
                      <div className="text-[10px] text-[#86868B]">Recorded by {log.author}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Interaction Modal */}
      <AnimatePresence>
        {isLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-sm w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Log Communication</h3>
                <button onClick={() => setIsLogOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full p-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  >
                    <option value="Meeting">Meeting / Physical</option>
                    <option value="Call">Phone Call</option>
                    <option value="Email">Official Email</option>
                    <option value="Presentation">Technical Proposal Pitch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Project Linkage (Optional)</label>
                  <input
                    type="text"
                    value={projectTag}
                    onChange={(e) => setProjectTag(e.target.value)}
                    placeholder="e.g. Escravos Expansion, OML-130"
                    className="w-full p-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Summary & Key Action Items</label>
                  <textarea
                    required
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Document discussion points, agreed milestones, or decisions..."
                    className="w-full p-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs resize-none text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsLogOpen(false)} className="px-3 py-1.5 text-[#86868B] font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold shadow-xs active:scale-[0.96]">Save Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Client Organization Modal */}
      <AnimatePresence>
        {isNewClientOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewClientOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#0C0C0D] rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">Register New Client Account</h3>
                  <p className="text-[11px] text-[#86868B]">Adds client to system database & makes selectable across projects & billing.</p>
                </div>
                <button onClick={() => setIsNewClientOpen(false)} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Dangote Oil Refining Company Limited"
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Account Type</label>
                    <select
                      value={newClientType}
                      onChange={(e: any) => setNewClientType(e.target.value)}
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    >
                      <option value="CLIENT">Commercial Client</option>
                      <option value="REGULATOR">Statutory Regulator</option>
                      <option value="STAKEHOLDER">Host Community / Stakeholder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Industry / Sector</label>
                    <input
                      type="text"
                      required
                      value={newClientIndustry}
                      onChange={(e) => setNewClientIndustry(e.target.value)}
                      placeholder="e.g. Refining & Petrochemicals"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Primary Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="e.g. Engr. Babatunde Lawal"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Designation / Role</label>
                    <input
                      type="text"
                      required
                      value={newContactRole}
                      onChange={(e) => setNewContactRole(e.target.value)}
                      placeholder="e.g. GM Engineering & Contracts"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="e.g. b.lawal@dangote.com"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868B] mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs font-mono text-[#1D1D1F] dark:text-[#F6F4F0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] mb-1">Office / Project Base Address</label>
                  <input
                    type="text"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="e.g. Lekki Free Trade Zone, Ibeju-Lekki, Lagos"
                    className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsNewClientOpen(false)} className="px-3.5 py-1.5 text-[#86868B] font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold shadow-xs active:scale-[0.96]">Save & Register Client</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
