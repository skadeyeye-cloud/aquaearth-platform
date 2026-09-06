'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Laptop, 
  Wifi, 
  Palette, 
  Plus, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Download,
  Flame,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItDesignOperationsPage() {
  const { hardwareAssets, subscriptions, designRequests, projects, createDesignRequest } = useAuth();
  const [activeTab, setActiveTab] = useState<'HARDWARE' | 'SUBSCRIPTIONS' | 'DESIGN'>('HARDWARE');
  const [isNewDesignOpen, setIsNewDesignOpen] = useState(false);

  // New Design Form
  const [designTitle, setDesignTitle] = useState('');
  const [designProjectId, setDesignProjectId] = useState(projects[0]?.id || '');
  const [is24hRush, setIs24hRush] = useState(false);

  const handleCreateDesign = (e: React.FormEvent) => {
    e.preventDefault();
    createDesignRequest({
      title: designTitle,
      projectId: designProjectId,
      requesterName: 'Tunde Bakare',
      is24hRush
    });
    setIsNewDesignOpen(false);
    setDesignTitle('');
    setIs24hRush(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 12 • Digital Assets, Connectivity & Design Studio
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            IT & Design Operations
          </h1>
          <p className="text-xs text-slate-500">
            Hardware asset register, remote site connectivity (Starlink/SIM), GIS software licenses, and 24h rush design queues.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('HARDWARE')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'HARDWARE' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hardware ({hardwareAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('SUBSCRIPTIONS')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'SUBSCRIPTIONS' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            SIM & Licenses ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('DESIGN')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              activeTab === 'DESIGN' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Design Queue ({designRequests.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Hardware Assets */}
      {activeTab === 'HARDWARE' && (
        <div className="space-y-4">
          <div className="apple-glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Asset Tag & Device</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Assigned User</th>
                    <th className="px-5 py-3">Current Location</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] font-medium">
                  {hardwareAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-[10px] font-bold text-slate-500">{asset.assetTag}</div>
                        <div className="font-bold text-xs text-slate-900">{asset.name}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.2 rounded-md font-semibold text-[10px] bg-slate-100 text-slate-700">
                          {asset.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700 text-[11px]">
                        <div className="font-semibold">{asset.assignedToName}</div>
                        <div className="text-[10px] text-slate-400">{asset.assignedToDept}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 text-[11px]">{asset.location}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscriptions & SIM */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptions.map((sub) => {
            const isExpiring = sub.daysRemaining <= 30;
            return (
              <motion.div whileHover={{ y: -2 }} key={sub.id} className="apple-glass-card p-5 rounded-3xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {sub.category.replace('_', ' ')}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full tnum ${
                    isExpiring ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {sub.daysRemaining}d to renewal
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 line-clamp-2">{sub.serviceName}</h3>
                  <div className="text-[10px] text-slate-400 mt-0.5">Provider: <b>{sub.provider}</b> • {sub.assignedUnit}</div>
                </div>

                <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-600 tnum">₦{sub.monthlyCostNgn.toLocaleString()}/mo</span>
                  <span className="text-emerald-700 font-bold text-[10px]">Active Node</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Design Request Queue */}
      {activeTab === 'DESIGN' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsNewDesignOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Design Request</span>
            </button>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden">
            <div className="divide-y divide-black/[0.04]">
              {designRequests.map((req) => (
                <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{req.requestNumber}</span>
                      {req.is24hRush && (
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.2 rounded-full text-[9px] font-extrabold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600 fill-current" />
                          24H RUSH FLAG
                        </span>
                      )}
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                        req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900">{req.title}</h3>
                    <div className="text-[10px] text-slate-400">Requested by: {req.requesterName} • {req.createdAt}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.deliverableUrl && (
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Final Graphic</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Design Request Modal */}
      <AnimatePresence>
        {isNewDesignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewDesignOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <h3 className="text-sm font-bold text-slate-900">Request GIS / Graphic Deliverable</h3>
                <button onClick={() => setIsNewDesignOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <form onSubmit={handleCreateDesign} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deliverable Title / Specification</label>
                  <input
                    type="text"
                    required
                    value={designTitle}
                    onChange={(e) => setDesignTitle(e.target.value)}
                    placeholder="e.g. Escravos 3D Bathymetric Elevation Profile Chart"
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Associated Project</label>
                  <select
                    value={designProjectId}
                    onChange={(e) => setDesignProjectId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs truncate"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectCode} - {p.title.substring(0, 25)}...</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      24-Hour Urgent Rush Delivery
                    </div>
                    <div className="text-[10px] text-slate-400">Prioritizes queue for imminent tender deadlines</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={is24hRush}
                    onChange={(e) => setIs24hRush(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setIsNewDesignOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Submit to Studio</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
