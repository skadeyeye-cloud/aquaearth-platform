'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { haptics, playNotificationChime } from '@/lib/haptics';
import { 
  ScanFace, 
  Fingerprint, 
  CheckCircle2, 
  X, 
  ShieldCheck,
  Smartphone,
  Sparkles
} from 'lucide-react';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  targetUser?: UserProfile;
}

export default function BiometricAuthModal({
  isOpen,
  onClose,
  onSuccess,
  targetUser
}: BiometricAuthModalProps) {
  const { allUsers } = useAuth();
  const selectedUser = targetUser || allUsers[0]; // Kaine Edike (Founder & Managing Consultant)

  const [mode, setMode] = useState<'FACE_ID' | 'TOUCH_ID'>('FACE_ID');
  const [scanStep, setScanStep] = useState<'INITIAL' | 'SCANNING' | 'VERIFIED'>('INITIAL');
  const [statusText, setStatusText] = useState('Position your face within the frame');

  useEffect(() => {
    if (!isOpen) {
      setScanStep('INITIAL');
      setStatusText('Position your face within the frame');
      return;
    }

    // Auto-trigger biometric sequence upon modal open
    const startScan = async () => {
      setScanStep('SCANNING');
      setStatusText(mode === 'FACE_ID' ? 'Analyzing facial geometry...' : 'Reading fingerprint sensor...');
      haptics.impact();

      // Check if WebAuthn is supported
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          // Attempt WebAuthn probe without blocking simulation
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch (e) {}
      }

      // Simulate Apple FaceID scan duration (1.2s)
      setTimeout(() => {
        setScanStep('VERIFIED');
        setStatusText('Biometric Identity Verified');
        haptics.success();
        playNotificationChime('success');

        setTimeout(() => {
          onSuccess(selectedUser);
          onClose();
        }, 800);
      }, 1200);
    };

    const timer = setTimeout(startScan, 400);
    return () => clearTimeout(timer);
  }, [isOpen, mode, selectedUser, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Dark Blurred Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Apple Biometric Sheet */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#09090b] border border-black/10 dark:border-white/15 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center space-y-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Card Mini Preview */}
        <div className="flex items-center gap-2.5 p-2 pr-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-9 h-9 rounded-xl object-cover"
          />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedUser.name}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{selectedUser.jobTitle}</div>
          </div>
        </div>

        {/* Biometric Scanning Frame */}
        <div className="relative w-36 h-36 rounded-3xl border-2 border-dashed border-emerald-500/40 dark:border-emerald-400/40 flex items-center justify-center overflow-hidden bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]">
          {scanStep === 'SCANNING' && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse top-0 animate-[bounce_1.5s_infinite]" />
          )}

          {scanStep === 'VERIFIED' ? (
            <div className="text-emerald-500 dark:text-emerald-400 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
            </div>
          ) : mode === 'FACE_ID' ? (
            <div className={`transition-all duration-300 ${scanStep === 'SCANNING' ? 'text-emerald-500 scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
              <ScanFace className="w-16 h-16 stroke-[1.5]" />
            </div>
          ) : (
            <div className={`transition-all duration-300 ${scanStep === 'SCANNING' ? 'text-emerald-500 scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
              <Fingerprint className="w-16 h-16 stroke-[1.5]" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-1">
          <div className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
            {scanStep === 'VERIFIED' ? 'Authentication Successful' : mode === 'FACE_ID' ? 'Apple FaceID' : 'TouchID Biometrics'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {statusText}
          </p>
        </div>

        {/* Switch Between FaceID and TouchID */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10 w-full justify-center">
          <button
            type="button"
            onClick={() => { setMode('FACE_ID'); setScanStep('SCANNING'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              mode === 'FACE_ID'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>FaceID</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('TOUCH_ID'); setScanStep('SCANNING'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              mode === 'TOUCH_ID'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>TouchID</span>
          </button>
        </div>
      </div>
    </div>
  );
}
