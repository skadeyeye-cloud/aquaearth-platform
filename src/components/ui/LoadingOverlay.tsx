'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoadingOverlay() {
  const { isLoading, loadingMessage, currentUser } = useAuth();
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    if (isLoading) {
      setProgress(25);
      const t1 = setTimeout(() => setProgress(55), 350);
      const t2 = setTimeout(() => setProgress(85), 750);
      const t3 = setTimeout(() => setProgress(100), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.04,
            filter: 'blur(10px)',
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-8 bg-white dark:bg-[#000000] text-slate-900 dark:text-white select-none"
        >
          {/* Top Subtle Brand Mark */}
          <div className="pt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <span>AquaEarth Sovereign Cloud</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">Node Lagos-01</span>
          </div>

          {/* Centerpiece: Animated Crest & Multi-stage Progress */}
          <div className="flex flex-col items-center text-center space-y-7 max-w-sm w-full -mt-8">
            {/* Luminous AE Emblem */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer Ambient Breathing Halo */}
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-3xl bg-emerald-500/20 dark:bg-emerald-400/25 blur-xl"
              />

              {/* Rotating Hairline Spinner Orbit */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 rounded-3xl border border-transparent border-t-emerald-500 border-r-teal-400 dark:border-t-emerald-400 dark:border-r-teal-300"
              />

              {/* Core Physical Crest Card */}
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1px] shadow-2xl flex items-center justify-center">
                <div className="w-full h-full bg-emerald-600 dark:bg-[#09090b] rounded-3xl flex items-center justify-center">
                  <span className="text-white font-black text-2xl tracking-tighter drop-shadow-md">
                    AE
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Status Text with Cross-fade */}
            <div className="space-y-2 w-full px-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingMessage || 'Initializing...'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {loadingMessage || 'Authenticating Secure Session...'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Initializing role boundaries & sovereign workspace
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sleek Progress Track */}
            <div className="w-64 space-y-2">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full"
                  initial={{ width: '15%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                <span>Encrypted Tunnel</span>
                <span className="font-bold tnum text-slate-700 dark:text-slate-300">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="pb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-medium">
              100% NDPA Certified • Biometric Zero-Trust Session
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
