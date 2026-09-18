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
  Hammer,
  Wind,
  Activity,
  Truck,
  FileCheck,
  Thermometer
} from 'lucide-react';
import { FieldFormType, FieldRecordItem, ChainOfCustodyRecord } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function FieldCapturePage() {
  const { projects, fieldRecords, currentUser, createFieldRecord } = useAuth();
  
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || currentUser.functionalRole === 'SUPERADMIN' || currentUser.functionalRole === 'MANAGING_CONSULTANT';
  const isHR = (currentUser.functionalRole === 'HR_ADMIN' || currentUser.departmentName === 'Human Resources') && !isSuperadmin;

  if (isHR) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center space-y-4 apple-glass-card rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Access Restricted (HR Scoping Barrier)</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Human Resources personnel are barred from accessing raw geotechnical and environmental field capture records.
        </p>
        <div className="pt-2">
          <a href="/hr/staff" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold">
            Return to HR Human Capital
          </a>
        </div>
      </div>
    );
  }

  // Offline simulation state
  const [isOnline, setIsOnline] = useState(true);
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FieldRecordItem | null>(null);

  // Form State
  const [formType, setFormType] = useState<FieldFormType>('AIR_QUALITY_NOISE');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [samplePointId, setSamplePointId] = useState('AQ-01 (Refinery Perimeter West Gate)');
  const [lat, setLat] = useState(6.4315);
  const [lng, setLng] = useState(4.0892);
  const [elevation, setElevation] = useState(2.0);
  const [accuracy, setAccuracy] = useState(0.04);
  const [samplingEquipment, setSamplingEquipment] = useState('Aeroqual Series 500 Handheld Gas & PM Monitor (Serial AQ-500-8812)');
  
  // Borehole Form Payload
  const [strata, setStrata] = useState('Very soft dark grey organic CLAY with peat fragments');
  const [depth, setDepth] = useState('12.0m');
  const [waterStrike, setWaterStrike] = useState('1.8m below GL');
  const [sptN, setSptN] = useState('N = 8');
  
  // Water quality parameters
  const [ph, setPh] = useState(7.2);
  const [dissolvedOxygen, setDissolvedOxygen] = useState(6.4);
  const [temp, setTemp] = useState(27.8);
  const [cocBarcode, setCocBarcode] = useState('COC-FMENV-2026-9912');

  // Air Quality & Noise parameters (Aeroqual Series 500)
  const [pm25, setPm25] = useState(14.8);
  const [pm10, setPm10] = useState(28.3);
  const [vocPpm, setVocPpm] = useState(0.042);
  const [coPpm, setCoPpm] = useState(1.2);
  const [no2Ppm, setNo2Ppm] = useState(0.018);
  const [so2Ppm, setSo2Ppm] = useState(0.005);
  const [noiseDbA, setNoiseDbA] = useState(54.2);
  const [relHumidity, setRelHumidity] = useState(78);
  const [ambientTemp, setAmbientTemp] = useState(29.5);

  // Soil Sampling & Chain of Custody (Hand Auger)
  const [soilDepth, setSoilDepth] = useState('0.0m - 0.5m (Topsoil)');
  const [soilTexture, setSoilTexture] = useState('Dark organic sandy loam with trace laterite');
  const [sampleJars, setSampleJars] = useState(8);
  const [testsRequested, setTestsRequested] = useState('TPH (GC-FID), BTEX, Heavy Metals (Pb, Cd, Cr, Ni, V), PAHs');
  const [labName, setLabName] = useState('Analytika Environmental Testing Laboratories Port Harcourt');
  const [turnaroundDays, setTurnaroundDays] = useState(7);
  const [iceChestTemp, setIceChestTemp] = useState(3.4);

  const handleAcquireGps = () => {
    // Simulate real GPS sensor lock
    setLat(5.5800 + Math.random() * 0.02);
    setLng(5.1800 + Math.random() * 0.02);
    setAccuracy(0.03 + Math.random() * 0.05);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId);

    let payload: Record<string, any> = {};
    let cocRecord: ChainOfCustodyRecord | undefined = undefined;

    if (formType === 'BOREHOLE_LOG') {
      payload = {
        depthM: depth,
        strataClassification: strata,
        waterStrikeDepth: waterStrike,
        sptNValue: sptN
      };
    } else if (formType === 'AIR_QUALITY_NOISE') {
      payload = {
        pm25: Number(pm25),
        pm10: Number(pm10),
        vocPpm: Number(vocPpm),
        coPpm: Number(coPpm),
        no2Ppm: Number(no2Ppm),
        so2Ppm: Number(so2Ppm),
        noiseDbA: Number(noiseDbA),
        ambientTempC: Number(ambientTemp),
        relHumidityPct: Number(relHumidity),
        notes: 'In-situ direct sensor readout logged via calibrated Aeroqual Series 500 meter.'
      };
    } else if (formType === 'SOIL_SAMPLING') {
      payload = {
        coreDepthM: soilDepth,
        soilTexture,
        sampleJars: Number(sampleJars),
        testsRequested,
        preservationIceChestTempC: Number(iceChestTemp)
      };
      cocRecord = {
        labName,
        batchNumber: cocBarcode || `COC-AEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        sampleCount: Number(sampleJars),
        preservationMethod: `Sealed pre-cleaned amber glass jars on blue ice (<= ${iceChestTemp}°C)`,
        dispatchDate: new Date().toISOString().split('T')[0],
        turnaroundDays: Number(turnaroundDays),
        status: 'IN_TRANSIT'
      };
    } else if (formType === 'WATER_SAMPLING') {
      payload = {
        pH: Number(ph),
        dissolvedOxygenMgL: Number(dissolvedOxygen),
        temperatureC: Number(temp),
        chainOfCustodyBarcode: cocBarcode
      };
      cocRecord = {
        labName,
        batchNumber: cocBarcode,
        sampleCount: 4,
        preservationMethod: 'Ice chest <= 4°C with HNO3 preservation',
        dispatchDate: new Date().toISOString().split('T')[0],
        turnaroundDays: 7,
        status: 'IN_TRANSIT'
      };
    } else {
      payload = {
        observations: 'Transect observation log verified.'
      };
    }

    createFieldRecord({
      formType,
      projectId,
      projectName: proj?.title || 'Active Project',
      samplePointId,
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      samplingEquipment,
      chainOfCustody: cocRecord,
      gps: {
        lat: Number(lat),
        lng: Number(lng),
        elevationM: Number(elevation),
        accuracyM: Number(accuracy)
      },
      payload,
      photoUrls: ['https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400'],
      syncStatus: isOnline ? 'SYNCED' : 'LOCAL_QUEUED',
      isLockedForQA: true
    });

    setIsNewRecordOpen(false);
  };

  const getFormTypeIcon = (type: FieldFormType) => {
    switch (type) {
      case 'BOREHOLE_LOG':
        return <Hammer className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'AIR_QUALITY_NOISE':
        return <Wind className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'SOIL_SAMPLING':
        return <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'WATER_SAMPLING':
        return <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'ECOLOGY_TRANSECT':
        return <Trees className="w-4 h-4 text-lime-600 dark:text-lime-400" />;
      case 'METOCEAN_READING':
        return <Waves className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Field Data & In-Situ Sampling
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#A39E93] mt-0.5">
            Aeroqual Series 500 air/gas telemetry, hand auger core sampling, and cold-chain lab custody
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
          <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">{fieldRecords.length} Entries</div>
          <div className="text-[10px] text-slate-500 font-medium">In-situ Aeroqual & Lab cores</div>
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
          <div className="text-[10px] uppercase font-bold text-slate-400">Lab Chain of Custody</div>
          <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 tnum">
            {fieldRecords.filter(f => f.chainOfCustody).length} Active CoCs
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Cold chain &le;4°C preserved</div>
        </div>
      </div>

      {/* Field Records Feed */}
      <div className="apple-glass-card rounded-3xl overflow-hidden">
        <div className="px-6 py-3.5 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">Live Field Transmission Stream</h2>
          <span className="text-[11px] text-slate-400 dark:text-[#A39E93] font-mono tnum">Live Repository Sync</span>
        </div>

        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.08]">
          {fieldRecords.map((record) => (
            <div 
              key={record.id} 
              onClick={() => setSelectedRecord(record)}
              className="p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/[0.08] shrink-0 mt-0.5">
                  {getFormTypeIcon(record.formType)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{record.samplePointId}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08] whitespace-nowrap shrink-0 inline-flex items-center">
                      {record.formType.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 inline-flex items-center border ${
                      record.syncStatus === 'SYNCED' 
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                    }`}>
                      {record.syncStatus}
                    </span>
                    {record.samplingEquipment && (
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 truncate max-w-xs">
                        🔧 {record.samplingEquipment.split('(')[0].trim()}
                      </span>
                    )}
                    {record.chainOfCustody && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 flex items-center gap-1">
                        <Truck className="w-2.5 h-2.5" />
                        CoC: {record.chainOfCustody.batchNumber}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300">{record.projectName}</div>

                  <div className="text-[10px] text-slate-400 dark:text-[#A39E93] flex items-center gap-3 pt-0.5 font-mono flex-wrap">
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
                <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 px-2 py-1 rounded-xl">
                  <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  QA Locked
                </span>

                <button
                  onClick={() => setSelectedRecord(record)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] rounded-xl text-slate-700 dark:text-slate-200 font-semibold text-xs active:scale-[0.96] cursor-pointer"
                >
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRecord(null)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Field Log & Equipment Inspector</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedRecord.samplePointId}</h3>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">{selectedRecord.projectName}</div>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">&times;</button>
              </div>

              {/* Watermarked Photo Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-black/[0.1] dark:border-white/10 bg-slate-900">
                <img
                  src={selectedRecord.photoUrls[0]}
                  alt="Field Evidence"
                  className="w-full h-44 object-cover opacity-90"
                />
                {/* On-screen Watermark Stamp */}
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/80 backdrop-blur-md rounded-xl text-[9px] font-mono text-white leading-tight shadow-md border border-white/10">
                  <div className="text-emerald-400 font-bold">AquaEarth Differential GPS Watermark (PRD FR 37)</div>
                  <div>{selectedRecord.watermarkText}</div>
                </div>
              </div>

              {/* Equipment Used Card */}
              {selectedRecord.samplingEquipment && (
                <div className="p-3 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-800/30 space-y-1">
                  <div className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-sky-600" />
                    Standard Field Equipment Protocol
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {selectedRecord.samplingEquipment}
                  </div>
                </div>
              )}

              {/* Chain of Custody (CoC) Card if Present */}
              {selectedRecord.chainOfCustody && (
                <div className="p-3.5 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-2xl border border-cyan-200 dark:border-cyan-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 uppercase flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-cyan-600" />
                      Laboratory Chain of Custody (CoC)
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700">
                      {selectedRecord.chainOfCustody.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white dark:bg-white/[0.06] rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
                      <div className="text-[9px] text-slate-400 uppercase font-mono">Batch Barcode</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedRecord.chainOfCustody.batchNumber}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-white/[0.06] rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
                      <div className="text-[9px] text-slate-400 uppercase font-mono">Sample Count & SLA</div>
                      <div className="font-bold text-slate-900 dark:text-white">{selectedRecord.chainOfCustody.sampleCount} Jars | {selectedRecord.chainOfCustody.turnaroundDays}d Turnaround</div>
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-white/[0.06] rounded-xl border border-black/[0.04] dark:border-white/[0.08] text-[11px] space-y-0.5">
                    <div className="text-[9px] text-slate-400 uppercase font-mono">Destination Accredited Lab</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.chainOfCustody.labName}</div>
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-400 flex items-center gap-1 pt-1 font-mono">
                      <Thermometer className="w-3 h-3 text-cyan-600" />
                      {selectedRecord.chainOfCustody.preservationMethod}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Payload Parameters */}
              <div className="p-3 bg-slate-50 dark:bg-white/[0.04] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white text-xs">Recorded Parameters (Immutable)</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(selectedRecord.payload).map(([key, value]) => (
                    <div key={key} className="p-1.5 bg-white dark:bg-white/[0.06] rounded-lg border border-black/[0.04] dark:border-white/[0.08]">
                      <div className="text-[9px] text-slate-400 dark:text-slate-400 uppercase font-mono">{key}</div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-semibold active:scale-[0.96] cursor-pointer"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewRecordOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-[#121214] rounded-3xl shadow-2xl max-w-lg w-full border border-black/[0.08] dark:border-white/[0.12] p-6 space-y-4 z-10 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Field Data Observation</h3>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Aeroqual in-situ or physical lab sampling</div>
                </div>
                <button onClick={() => setIsNewRecordOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Form Template</label>
                    <select
                      value={formType}
                      onChange={(e) => {
                        const val = e.target.value as FieldFormType;
                        setFormType(val);
                        if (val === 'AIR_QUALITY_NOISE') {
                          setSamplingEquipment('Aeroqual Series 500 Handheld Gas & PM Monitor (Serial AQ-500-8812) + Cirrus CR:162C Sound Meter');
                          setSamplePointId('AQ-01 (Refinery Perimeter West Gate)');
                        } else if (val === 'SOIL_SAMPLING') {
                          setSamplingEquipment('Dormer 70mm Stainless Steel Hand Auger with Teflon core liners');
                          setSamplePointId('SS-01 (Process Area)');
                        } else if (val === 'WATER_SAMPLING') {
                          setSamplingEquipment('Hydro-Bailer Teflon Double-Check Valve + YSI ProDSS Meter');
                          setSamplePointId('SW-01 (Effluent Outfall)');
                        } else {
                          setSamplingEquipment('DGPS Trimble RTK Receiver + Geological Logging Rig');
                          setSamplePointId('BH-05 (Escravos River Crossing)');
                        }
                      }}
                      className="w-full p-2 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="AIR_QUALITY_NOISE">💨 Air Quality & Noise (Aeroqual 500)</option>
                      <option value="SOIL_SAMPLING">🪵 Soil Sampling (Hand Auger & Lab CoC)</option>
                      <option value="WATER_SAMPLING">🧪 Water Sampling (Hydro-Bailer)</option>
                      <option value="BOREHOLE_LOG">🏗️ Geotech Borehole Log</option>
                      <option value="ECOLOGY_TRANSECT">🌿 Ecological Transect</option>
                      <option value="METOCEAN_READING">🌊 Metocean Oceanographic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Target Project</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white truncate"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectCode} - {p.title.substring(0, 25)}...</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Sample Point / Station ID</label>
                  <input
                    type="text"
                    required
                    value={samplePointId}
                    onChange={(e) => setSamplePointId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Sampling Equipment & Model</label>
                  <input
                    type="text"
                    required
                    value={samplingEquipment}
                    onChange={(e) => setSamplingEquipment(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* GPS Location Bar */}
                <div className="p-3 bg-slate-50 dark:bg-white/[0.04] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Differential GPS Location
                    </span>
                    <button
                      type="button"
                      onClick={handleAcquireGps}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 active:scale-[0.96] cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Acquire Fix
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-1.5 bg-white dark:bg-white/[0.06] rounded-lg border border-black/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-slate-200">Lat: <b className="tnum font-bold text-slate-900 dark:text-white">{lat.toFixed(5)}°N</b></div>
                    <div className="p-1.5 bg-white dark:bg-white/[0.06] rounded-lg border border-black/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-slate-200">Lng: <b className="tnum font-bold text-slate-900 dark:text-white">{lng.toFixed(5)}°E</b></div>
                  </div>
                </div>

                {/* Dynamic Form Fields */}
                {formType === 'AIR_QUALITY_NOISE' ? (
                  <div className="space-y-2.5 p-3 bg-sky-50/40 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-800/30">
                    <div className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase flex items-center gap-1">
                      <Wind className="w-3 h-3 text-sky-600" /> Aeroqual In-Situ Gas & Noise Direct Readout
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">PM2.5 (&mu;g/m³)</label>
                        <input type="number" step="0.1" value={pm25} onChange={(e) => setPm25(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">PM10 (&mu;g/m³)</label>
                        <input type="number" step="0.1" value={pm10} onChange={(e) => setPm10(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Noise (dBA)</label>
                        <input type="number" step="0.1" value={noiseDbA} onChange={(e) => setNoiseDbA(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">VOC (ppm)</label>
                        <input type="number" step="0.001" value={vocPpm} onChange={(e) => setVocPpm(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">CO (ppm)</label>
                        <input type="number" step="0.1" value={coPpm} onChange={(e) => setCoPpm(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">NO2 (ppm)</label>
                        <input type="number" step="0.001" value={no2Ppm} onChange={(e) => setNo2Ppm(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                ) : formType === 'SOIL_SAMPLING' ? (
                  <div className="space-y-2.5 p-3 bg-cyan-50/40 dark:bg-cyan-950/20 rounded-2xl border border-cyan-100 dark:border-cyan-800/30">
                    <div className="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 uppercase flex items-center gap-1">
                      <Truck className="w-3 h-3 text-cyan-600" /> Hand Auger Sampling & Lab Custody
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Auger Core Depth</label>
                        <input type="text" value={soilDepth} onChange={(e) => setSoilDepth(e.target.value)} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Soil Texture / Lithology</label>
                        <input type="text" value={soilTexture} onChange={(e) => setSoilTexture(e.target.value)} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Sample Jars</label>
                        <input type="number" value={sampleJars} onChange={(e) => setSampleJars(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Cold Temp (&le;4°C)</label>
                        <input type="number" step="0.1" value={iceChestTemp} onChange={(e) => setIceChestTemp(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Turnaround SLA</label>
                        <select value={turnaroundDays} onChange={(e) => setTurnaroundDays(Number(e.target.value))} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white">
                          <option value={7}>7 Days (Std)</option>
                          <option value={3}>3 Days (Rush)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Accredited Laboratory Name</label>
                      <input type="text" value={labName} onChange={(e) => setLabName(e.target.value)} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Tests Requested</label>
                      <input type="text" value={testsRequested} onChange={(e) => setTestsRequested(e.target.value)} className="w-full p-1.5 bg-white dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white" />
                    </div>
                  </div>
                ) : formType === 'BOREHOLE_LOG' ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Strata Classification (ASTM D2487)</label>
                      <textarea
                        required
                        rows={2}
                        value={strata}
                        onChange={(e) => setStrata(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Drilling Depth</label>
                        <input type="text" value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full p-1.5 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">SPT N-Value</label>
                        <input type="text" value={sptN} onChange={(e) => setSptN(e.target.value)} className="w-full p-1.5 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">pH Value</label>
                        <input type="number" step="0.01" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="w-full p-1.5 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Dissolved Oxygen</label>
                        <input type="number" step="0.01" value={dissolvedOxygen} onChange={(e) => setDissolvedOxygen(Number(e.target.value))} className="w-full p-1.5 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Temp (°C)</label>
                        <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full p-1.5 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">FMEnv Chain of Custody Barcode</label>
                      <input type="text" value={cocBarcode} onChange={(e) => setCocBarcode(e.target.value)} className="w-full p-1.5 bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 rounded-xl text-xs font-mono text-slate-900 dark:text-white" />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button type="button" onClick={() => setIsNewRecordOpen(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-bold shadow-xs active:scale-[0.96] flex items-center gap-1.5 cursor-pointer">
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
