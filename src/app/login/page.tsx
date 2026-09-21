'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  UserPlus, 
  KeyRound, 
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, loginWithPassword, submitAccessRequest, projects, isAuthenticated, isAuthReady } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REQUEST_ACCESS'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [showCredsHelper, setShowCredsHelper] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Request access form state
  const [reqFullName, setReqFullName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqJobTitle, setReqJobTitle] = useState('');
  const [reqDept, setReqDept] = useState('Geotechnical Engineering');
  const [reqJustification, setReqJustification] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.replace('/workspace');
    }
  }, [isAuthReady, isAuthenticated, router]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both corporate email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await loginWithPassword(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setFailedAttempts(0);
      router.push('/workspace');
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      setShakeKey((prev) => prev + 1);
      if (newCount >= 5) {
        setLockoutSeconds(60);
        setErrorMsg('SECURITY LOCKOUT: Too many failed attempts. Terminal locked for 60 seconds.');
      } else {
        setErrorMsg(res.error || `Invalid credentials. (${5 - newCount} attempts remaining before security lockout)`);
      }
      setPassword('');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText('AquaEarth@2026!');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
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

      {/* Main Glassmorphic Auth Card with Shake Animation on failed attempt */}
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.38, ease: 'easeInOut' }}
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
            {/* Security Alert on Failure */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-[11px]">Authentication Failed</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{errorMsg}</div>
                </div>
              </div>
            )}

            {/* Lockout Banner */}
            {lockoutSeconds > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Security cooldown active</span>
                </div>
                <span className="font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-lg">
                  {lockoutSeconds}s remaining
                </span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={lockoutSeconds > 0 || isSubmitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="kaine.edike@aquaearth.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutSeconds > 0 || isSubmitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
            </div>

            <button
              type="submit"
              disabled={lockoutSeconds > 0 || isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Authorized Personnel Directory & Testing Credentials */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowCredsHelper(!showCredsHelper)}
                className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                  Corporate Credentials Directory
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {showCredsHelper ? 'Hide' : 'View'}
                </span>
              </button>

              <AnimatePresence>
                {showCredsHelper && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2.5 pt-2.5"
                  >
                    {/* Master Password Box */}
                    <div className="p-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">Default Corporate Key</div>
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5">AquaEarth@2026!</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="px-2.5 py-1 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-semibold border border-black/10 dark:border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Select any corporate profile to populate the email. Enter <code className="bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-[10px] text-slate-900 dark:text-white">AquaEarth@2026!</code> to authenticate:
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: 'Dr. Kaine Edike', role: 'Superadmin', email: 'kaine.edike@aquaearth.com' },
                        { name: 'Chidi Okafor', role: 'IT Lead', email: 'chidi.okafor@aquaearth.com' },
                        { name: 'Engr. Femi Adebayo', role: 'Geotech PM', email: 'femi.adebayo@aquaearth.com' },
                        { name: 'Amina Bello', role: 'HR Lead', email: 'amina.bello@aquaearth.com' },
                      ].map((item) => (
                        <button
                          key={item.email}
                          type="button"
                          onClick={() => {
                            setEmail(item.email);
                            setErrorMsg('');
                          }}
                          className="p-2 text-left bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/10"
                        >
                          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                          <div className="text-[9px] text-slate-400 truncate">{item.role}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

    </div>
  );
}
