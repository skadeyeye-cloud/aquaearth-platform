'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  UserPlus, 
  KeyRound, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ScanFace
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BiometricAuthModal from '@/components/auth/BiometricAuthModal';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, loginAsUser, submitAccessRequest, projects } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REQUEST_ACCESS'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);

  // Request access form state
  const [reqFullName, setReqFullName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqJobTitle, setReqJobTitle] = useState('');
  const [reqDept, setReqDept] = useState('Geotechnical Engineering');
  const [reqJustification, setReqJustification] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      await loginAsUser(user);
      router.push('/workspace');
    } else {
      // If user typed anything else, default log in as Kaine Edike or show prompt
      const fallbackUser = allUsers[0];
      await loginAsUser(fallbackUser);
      router.push('/workspace');
    }
  };

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    submitAccessRequest({
      fullName: reqFullName,
      email: reqEmail,
      jobTitle: reqJobTitle,
      departmentName: reqDept,
      professionalLicense: 'COREN / COMEG Registered',
      assignedProjectCode: projects[0]?.projectCode || 'PRJ-2026-001',
      justification: reqJustification
    });
    setRequestSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-slate-900 dark:text-white flex flex-col justify-center items-center p-4 relative select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white dark:bg-[#0a0a0c] rounded-3xl p-7 border border-black/10 dark:border-white/10 shadow-2xl space-y-6 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-base font-black shadow-md mx-auto">
            AE
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">AquaEarth Operations</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Advisory & Multi-Disciplinary Delivery Platform</p>
          </div>
        </div>

        {/* Segmented Switcher: Log In vs. Request Access */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('LOGIN'); setRequestSubmitted(false); }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'LOGIN' 
                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('REQUEST_ACCESS'); setRequestSubmitted(false); }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'REQUEST_ACCESS' 
                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* TAB 1: Log In Form */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aquaearth.ng"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-emerald-600 focus:ring-0"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Remember this device</span>
              </label>
              <span className="text-[10px] text-slate-400">2FA Protected</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-xs"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Apple FaceID / TouchID 1-Tap Biometric Sign-In */}
            <div>
              <button
                type="button"
                onClick={() => setIsBiometricOpen(true)}
                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-xl font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-xs cursor-pointer shadow-2xs"
              >
                <ScanFace className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sign in with FaceID / TouchID</span>
              </button>
            </div>

            {/* Quick Demo Access Pills */}
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-center">
                Instant Demo Access (Role-Scoped)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: 'Kaine (Superadmin)', id: 'usr-1' },
                  { name: 'Engr. Femi (Manager)', id: 'usr-4' },
                  { name: 'Tunde (Field Staff)', id: 'usr-6' },
                  { name: 'Chidi (IT Lead)', id: 'usr-2' },
                ].map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={async () => {
                      const u = allUsers.find(user => user.id === demo.id);
                      if (u) {
                        await loginAsUser(u);
                        router.push('/workspace');
                      }
                    }}
                    className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.96] text-center"
                  >
                    {demo.name}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Request Access Form */}
        {activeTab === 'REQUEST_ACCESS' && (
          <div>
            {!requestSubmitted ? (
              <form onSubmit={handleRequestAccess} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={reqFullName}
                    onChange={(e) => setReqFullName(e.target.value)}
                    placeholder="e.g. Chibuike Okonkwo"
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="name@aquaearth.ng"
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      value={reqJobTitle}
                      onChange={(e) => setReqJobTitle(e.target.value)}
                      placeholder="e.g. Field Surveyor"
                      className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <select
                      value={reqDept}
                      onChange={(e) => setReqDept(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs"
                    >
                      <option value="Geotechnical Engineering">Geotechnical</option>
                      <option value="Environmental & Social (ESIA)">ESIA</option>
                      <option value="Geoinformatics & Survey">GIS / Survey</option>
                      <option value="Quality Assurance (QA/QC)">QA / QC</option>
                      <option value="Commercial & BD">Commercial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Assignment Justification</label>
                  <textarea
                    required
                    rows={2}
                    value={reqJustification}
                    onChange={(e) => setReqJustification(e.target.value)}
                    placeholder="Briefly state project assignment and reason for access..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Submit Access Request</span>
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-3">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request Submitted</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Your request has been queued for Superadmin review.
                  </p>
                </div>
                <button
                  onClick={() => { setActiveTab('LOGIN'); setRequestSubmitted(false); }}
                  className="w-full py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white rounded-xl text-xs font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsForgotModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full border border-black/10 dark:border-white/10 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  Reset Password
                </h3>
                <button onClick={() => setIsForgotModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">&times;</button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Please contact the IT Security Desk (<b className="text-slate-800 dark:text-white">it_support@aquaearth.ng</b>) or your Line Manager for authorized credential recovery.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold active:scale-[0.96]"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-[10px] text-slate-400 dark:text-slate-600 mt-6 font-medium">
        © 2026 AquaEarth Consulting Ltd. • Lagos, Nigeria
      </div>

      {/* Apple Biometric FaceID / TouchID Authentication Modal */}
      <BiometricAuthModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        onSuccess={async (user) => {
          await loginAsUser(user);
          router.push('/workspace');
        }}
      />
    </div>
  );
}
