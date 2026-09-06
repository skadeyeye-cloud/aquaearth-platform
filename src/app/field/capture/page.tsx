'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Layers, 
  Lock, 
  Send,
  Droplets,
  Trees,
  Waves,
  Hammer
} from 'lucide-react';
import { FieldFormType, FieldRecordItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function FieldCapturePage() {
  const { projects, fieldRecords, currentUser, createFieldRecord } = useAuth();
  
  // Offline simulation state
  const [isOnline, setIsOnline] = useState(true);
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FieldRecordItem | null>(null);

  // Form State
  const [formType, setFormType] = useState<FieldFormType>('BOREHOLE_LOG');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [samplePointId, setSamplePointId] = useState('BH-05 (Escravos River Crossing)');
  const [lat, setLat] = useState(5.5912);
  const [lng, setLng] = useState(5.1887);
  const [elevation, setElevation] = useState(2.8);
  const [accuracy, setAccuracy] = useState(0.04);
  
  // Form Payload
  const [strata, setStrata] = useState('Very soft dark grey organic CLAY with peat fragments');
  const [depth, setDepth] = useState('12.0m');
  const [waterStrike, setWaterStrike] = useState('1.8m below GL');
  const [sptN, setSptN] = useState('N = 8');
  
  // Water quality parameters
  const [ph, setPh] = useState(7.2);
  const [dissolvedOxygen, setDissolvedOxygen] = useState(6.4);
  const [temp, setTemp] = useState(27.8);
  const [cocBarcode, setCocBarcode] = useState('COC-FMENV-2026-9912');

  const handleAcquireGps = () => {
    // Simulate real GPS sensor lock
    setLat(5.5800 + Math.random() * 0.02);
    setLng(5.1800 + Math.random() * 0.02);
    setAccuracy(0.03 + Math.random() * 0.05);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId);

    const payload = formType === 'BOREHOLE_LOG' ? {
      depthM: depth,
      strataClassification: strata,
      waterStrikeDepth: waterStrike,
      sptNValue: sptN
    } : {
      pH: Number(ph),
      dissolvedOxygenMgL: Number(dissolvedOxygen),
      temperatureC: Number(temp),
      chainOfCustodyBarcode: cocBarcode
    };

    createFieldRecord({
      formType,
      projectId,
      projectName: proj?.title || 'Active Project',
      samplePointId,
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      gps: {
        lat: Number(lat),
        lng: Number(lng),
        elevationM: Number(elevation),
        accuracyM: Number(accuracy)
      },
      payload,
      photoUrls: ['https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400'],
      syncStatus: isOnline ? 'SYNCED' : 'LOCAL_QUEUED',
      isLockedForQA: true
    });

    setIsNewRecordOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 5 • Offline-First Mobile Data Capture Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Field Data & In-Situ Sampling
          </h1>
          <p className="text-xs text-slate-500">
            Offline borehole logs, water quality probing, automated differential GPS watermarking, and QA immutability.
          </p>
        </div>

        {/* Action Controls & Offline Toggle */}
        <div className="flex items-center gap-2">
          {/* Network Simulator */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-[0.96] ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs' 
                : 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
            }`}
            title="Toggle network connectivity simulation"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Online (4G LTE Connected)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Offline Mode (Zero Signal)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsNewRecordOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Field Entry</span>
          </button>
        </div>
      </div>

      {/* Field Telemetry & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Captured Field Records</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">{fieldRecords.length} Entries</div>
          <div className="text-[10px] text-slate-500 font-medium">Auto-GPS tagged & watermarked</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Offline Queue</div>
          <div className="text-xl font-extrabold text-amber-600 tnum">
            {fieldRecords.filter(f => f.syncStatus === 'LOCAL_QUEUED').length} Pending Sync
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Local IndexedDB buffer</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">GPS Accuracy (DGPS)</div>
          <div className="text-xl font-extrabold text-emerald-600 tnum">&plusmn;0.04 m</div>
          <div className="text-[10px] text-slate-500 font-medium">RTK centimeter fix locked</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">QA Integrity Lock</div>
          <div className="text-xl font-extrabold text-purple-600 tnum">100% Locked</div>
          <div className="text-[10px] text-slate-500 font-medium">Defensible regulatory audit trail</div>
        </div>
      </div>

      {/* Field Records Feed */}
      <div className="apple-glass-card rounded-3xl overflow-hidden">
        <div className="px-6 py-3.5 border-b border-black/[0.05] flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900">Live Field Transmission Stream</h2>
          <span className="text-[11px] text-slate-400 font-mono tnum">Module 5 $\rightarrow$ Module 6 Integration</span>
        </div>

        <div className="divide-y divide-black/[0.04]">
          {fieldRecords.map((record) => (
            <div 
              key={record.id} 
              onClick={() => setSelectedRecord(record)}
              className="p-4 hover:bg-black/[0.02] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                  {record.formType === 'BOREHOLE_LOG' ? <Hammer className="w-4 h-4 text-amber-700" /> : <Droplets className="w-4 h-4 text-cyan-600" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900">{record.samplePointId}</span>
                    <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-black/[0.06]">
                      {record.formType.replace('_', ' ')}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                      record.syncStatus === 'SYNCED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {record.syncStatus}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600">{record.projectName}</div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-0.5 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {record.gps.lat.toFixed(4)}°N, {record.gps.lng.toFixed(4)}°E (&plusmn;{record.gps.accuracyM}m)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {record.timestamp}
                    </span>
                    <span>By: {record.technicianName}</span>
                  </div>
                </div>
              </div>

              {/* Watermark & QA Lock Indicator */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-1 rounded-xl">
                  <Lock className="w-3 h-3 text-purple-600" />
                  QA Locked
                </span>

                <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold text-xs active:scale-[0.96]">
                  Inspect Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Inspector & Photo Watermark Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRecord(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-start justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Field Log Inspector</span>
                  <h3 className="text-sm font-bold text-slate-900">{selectedRecord.samplePointId}</h3>
                  <div className="text-[11px] text-slate-400">{selectedRecord.projectName}</div>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              {/* Watermarked Photo Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-black/[0.1] bg-slate-900">
                <img
                  src={selectedRecord.photoUrls[0]}
                  alt="Field Evidence"
                  className="w-full h-48 object-cover opacity-90"
                />
                {/* On-screen Watermark Stamp */}
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/75 backdrop-blur-md rounded-xl text-[9px] font-mono text-white leading-tight shadow-md border border-white/10">
                  <div className="text-emerald-400 font-bold">AquaEarth Differential GPS Watermark (PRD FR 37)</div>
                  <div>{selectedRecord.watermarkText}</div>
                </div>
              </div>

              {/* Data Payload Parameters */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-black/[0.05] space-y-1.5">
                <div className="font-bold text-slate-900 text-xs">Recorded Parameters (Immutable)</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(selectedRecord.payload).map(([key, value]) => (
                    <div key={key} className="p-1.5 bg-white rounded-lg border border-black/[0.04]">
                      <div className="text-[9px] text-slate-400 uppercase font-mono">{key}</div>
                      <div className="font-bold text-slate-800 truncate">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-semibold active:scale-[0.96]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Field Entry Modal */}
      <AnimatePresence>
        {isNewRecordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewRecordOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">New Field Data Observation</h3>
                  <div className="text-[10px] text-slate-400">Offline-ready digital web log</div>
                </div>
                <button onClick={() => setIsNewRecordOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Form Template</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as FieldFormType)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-semibold"
                    >
                      <option value="BOREHOLE_LOG">🏗️ Geotech Borehole Log</option>
                      <option value="WATER_SAMPLING">🧪 Water Quality Probing</option>
                      <option value="ECOLOGY_TRANSECT">🌿 Ecological Transect</option>
                      <option value="METOCEAN_READING">🌊 Metocean Oceanographic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Target Project</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs truncate"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectCode} - {p.title.substring(0, 25)}...</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Sample Point / Station ID</label>
                  <input
                    type="text"
                    required
                    value={samplePointId}
                    onChange={(e) => setSamplePointId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  />
                </div>

                {/* GPS Location Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-black/[0.05] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Differential GPS Location
                    </span>
                    <button
                      type="button"
                      onClick={handleAcquireGps}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 active:scale-[0.96]"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Acquire Fix
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-1.5 bg-white rounded-lg border">Lat: <b className="tnum">{lat.toFixed(5)}°N</b></div>
                    <div className="p-1.5 bg-white rounded-lg border">Lng: <b className="tnum">{lng.toFixed(5)}°E</b></div>
                  </div>
                </div>

                {/* Dynamic Form Fields */}
                {formType === 'BOREHOLE_LOG' ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Strata Classification (ASTM D2487)</label>
                      <textarea
                        required
                        rows={2}
                        value={strata}
                        onChange={(e) => setStrata(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Drilling Depth</label>
                        <input type="text" value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full p-1.5 bg-slate-50 border rounded-xl text-xs font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">SPT N-Value</label>
                        <input type="text" value={sptN} onChange={(e) => setSptN(e.target.value)} className="w-full p-1.5 bg-slate-50 border rounded-xl text-xs font-mono" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">pH Value</label>
                        <input type="number" step="0.01" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="w-full p-1.5 bg-slate-50 border rounded-xl text-xs font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Dissolved Oxygen</label>
                        <input type="number" step="0.01" value={dissolvedOxygen} onChange={(e) => setDissolvedOxygen(Number(e.target.value))} className="w-full p-1.5 bg-slate-50 border rounded-xl text-xs font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Temp (°C)</label>
                        <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full p-1.5 bg-slate-50 border rounded-xl text-xs font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">FMEnv Chain of Custody Barcode</label>
                      <input type="text" value={cocBarcode} onChange={(e) => setCocBarcode(e.target.value)} className="w-full p-1.5 bg-slate-50 border rounded-xl text-xs font-mono" />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setIsNewRecordOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96] flex items-center gap-1.5">
                    <Send className="w-3 h-3" />
                    <span>Submit & Lock Entry</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
