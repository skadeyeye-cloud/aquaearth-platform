'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { haptics } from '@/lib/haptics';
import {
  User,
  Camera,
  Phone,
  MapPin,
  Mail,
  Lock,
  Shield,
  Key,
  Check,
  AlertCircle,
  ScanFace,
  Sun,
  Moon,
  Bell,
  Briefcase,
  Heart,
  Plus,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const PRESET_AVATARS = [
  { label: 'Dr. Kaine (Executive)', url: '/avatars/kaine-edike.png' },
  { label: 'Executive Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&q=80' },
  { label: 'Engineer Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80' },
  { label: 'Scientist Female', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&fit=crop&q=80' },
  { label: 'Technical Lead', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&q=80' },
  { label: 'Field Operations', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&fit=crop&q=80' },
  { label: 'Quality Lead', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80' },
  { label: 'Corporate Legal', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&fit=crop&q=80' },
];

const OFFICE_LOCATIONS = [
  'Port Harcourt HQ — Trans-Amadi Industrial Layout',
  'Lagos Corporate Office — Victoria Island',
  'Warri Marine Base & Logistics Terminal',
  'Abuja Regulatory Liaison Office',
  'Bonny Island Field Station',
  'Eket Offshore Support Hub'
];

export default function SettingsPage() {
  const { currentUser, updateUserProfile, requestPasswordChange, theme, toggleTheme } = useAuth();

  // Profile Form States
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [phone, setPhone] = useState(currentUser.phone || '+234 803 000 0000');
  const [location, setLocation] = useState(currentUser.location || OFFICE_LOCATIONS[0]);
  const [bio, setBio] = useState(currentUser.bio || 'Environmental Consultant & Geotechnical Specialist at AquaEarth Advisory.');
  const [skills, setSkills] = useState<string[]>(currentUser.skills || ['Hydrogeology', 'EIA Auditing', 'GIS Mapping', 'ISO 14001']);
  const [newSkillInput, setNewSkillInput] = useState('');
  
  // Emergency Contact State
  const [emergencyName, setEmergencyName] = useState(currentUser.emergencyContact?.name || 'Chidinma Edike');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.emergencyContact?.phone || '+234 802 999 1122');
  const [emergencyRelation, setEmergencyRelation] = useState(currentUser.emergencyContact?.relation || 'Spouse / Next of Kin');

  // Avatar Picker Modal State
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Password Change Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  // General Notification / Save Feedback
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Sync state if currentUser switches
  useEffect(() => {
    setAvatar(currentUser.avatar || '');
    setPhone(currentUser.phone || '+234 803 000 0000');
    setLocation(currentUser.location || OFFICE_LOCATIONS[0]);
    setBio(currentUser.bio || '');
    setSkills(currentUser.skills || ['Environmental Analysis', 'Statutory Compliance']);
    setEmergencyName(currentUser.emergencyContact?.name || '');
    setEmergencyPhone(currentUser.emergencyContact?.phone || '');
    setEmergencyRelation(currentUser.emergencyContact?.relation || '');
    setPasswordFeedback(null);
  }, [currentUser.id]);

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact();

    const result = updateUserProfile(currentUser.id, {
      avatar,
      phone,
      location,
      bio,
      skills,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation
      }
    });

    if (result.success) {
      haptics.success();
      setSaveSuccessNotice('Profile changes saved successfully.');
      setTimeout(() => setSaveSuccessNotice(null), 3500);
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact();

    if (!currentPassword) {
      setPasswordFeedback({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match. Please re-type.' });
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      const res = requestPasswordChange(currentUser.id, {
        currentPassword,
        newPassword,
        requestType: 'DIRECT'
      });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({ type: 'success', text: res.message });
      haptics.success();
      setTimeout(() => setPasswordFeedback(null), 5000);
    }, 600);
  };

  // Handle Request Reset Link
  const handleRequestResetLink = () => {
    haptics.selection();
    setIsRequestingReset(true);
    setTimeout(() => {
      const res = requestPasswordChange(currentUser.id, {
        requestType: 'ADMIN_RESET'
      });
      setIsRequestingReset(false);
      setPasswordFeedback({ type: 'success', text: res.message });
      haptics.success();
      setTimeout(() => setPasswordFeedback(null), 6000);
    }, 700);
  };

  // Handle Add Skill
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
      haptics.selection();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
    haptics.selection();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
        </div>

        {/* Quick Save Pill Notification */}
        <AnimatePresence>
          {saveSuccessNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{saveSuccessNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Settings Form Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Summary Profile Card */}
        <div className="md:col-span-1 space-y-5">
          <div className="apple-glass-card p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 text-center space-y-4">
            
            {/* Interactive Squircle Avatar */}
            <div className="relative inline-block mx-auto group">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={currentUser.name}
                className="w-28 h-28 rounded-3xl object-cover ring-2 ring-black/[0.08] dark:ring-white/15 shadow-md mx-auto transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setIsAvatarPickerOpen(true);
                }}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-md transition-all active:scale-[0.92] cursor-pointer"
                title="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{currentUser.name}</h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{currentUser.jobTitle}</div>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3 h-3" />
                <span>{currentUser.accessTier} • {currentUser.functionalRole.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Staff ID</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{currentUser.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Department</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{currentUser.departmentName || 'Operations'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Line Manager</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                  {currentUser.managerName || 'Managing Consultant'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setIsAvatarPickerOpen(true);
              }}
              className="w-full py-2 px-3 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              Choose Profile Photo
            </button>
          </div>

          {/* Biometric Status Pill */}
          <div className="apple-glass-card p-4 rounded-3xl border border-black/[0.06] dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ScanFace className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">FaceID / TouchID</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Biometric Quick Auth Active</div>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Theme Quick Toggle Card */}
          <div className="apple-glass-card p-4 rounded-3xl border border-black/[0.06] dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] text-slate-700 dark:text-slate-200">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">System Appearance</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {theme === 'dark' ? 'Pitch-Black OLED Mode' : 'Light Mode Active'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                haptics.impact();
                toggleTheme();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all active:scale-[0.96] cursor-pointer"
            >
              Toggle
            </button>
          </div>

        </div>

        {/* Right Columns: Edit Details & Security */}
        <div className="md:col-span-2 space-y-6">

          {/* Personal & Contact Information Form */}
          <div className="apple-glass-card p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Personal & Contact Information</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Self-Service</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Full Legal / Display Name
                  </label>
                  <input
                    type="text"
                    value={currentUser.name}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                    title="Managed by HR Admin"
                  />
                  <span className="text-[10px] text-slate-400">HR Stamped. Contact HR Admin to modify.</span>
                </div>

                {/* Corporate Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Corporate Email</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium pr-8"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Verified Single-Sign-On Account
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number (Editable) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Mobile / WhatsApp Number</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
                  />
                  <span className="text-[10px] text-slate-400">Used for field dispatches and SMS emergency notifications.</span>
                </div>

                {/* Location / Base (Editable) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Duty Station / Base Location</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all cursor-pointer"
                  >
                    {OFFICE_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="dark:bg-slate-900 dark:text-white">{loc}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400">Sets your clock-in geofence radius.</span>
                </div>
              </div>

              {/* Bio / Professional Summary */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Professional Bio & Technical Focus
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Provide a brief summary of your role, certifications, or operating expertise..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all resize-none"
                />
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Competencies & Core Skills</span>
                  <span className="text-[10px] text-slate-400 font-normal">Press Enter to add</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.08]">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-black/[0.06] dark:border-white/10 font-medium text-xs shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-500 transition-colors p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1 ml-1 flex-1 min-w-[120px]">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="+ Add skill..."
                      className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden w-full placeholder:text-slate-400"
                    />
                    {newSkillInput.trim() && (
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="p-1 text-emerald-600 hover:text-emerald-500"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button for Profile */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.96] flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Personal Details</span>
                </button>
              </div>

            </form>
          </div>

          {/* Emergency Contact Information Card */}
          <div className="apple-glass-card p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
              <Heart className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Contact (HSE / Field Compliance)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Contact Full Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Next of Kin Name"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="Spouse / Parent / Sibling"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Emergency Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+234 802 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-xs shadow-xs transition-all active:scale-[0.96] cursor-pointer"
              >
                Update Emergency Contact
              </button>
            </div>
          </div>

          {/* Security & Password Change Card */}
          <div className="apple-glass-card p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password Management</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
              </button>
            </div>

            {/* Live Feedback Alert */}
            <AnimatePresence>
              {passwordFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {passwordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium leading-relaxed">{passwordFeedback.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Direct Change Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Current Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                  {newPassword && (
                    <div className="flex items-center gap-1 pt-1">
                      <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                      <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                      <div className={`h-1 flex-1 rounded-full ${/[^a-zA-Z0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-black border border-black/[0.1] dark:border-white/15 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleRequestResetLink}
                  disabled={isRequestingReset}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-xs transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRequestingReset ? 'animate-spin' : ''}`} />
                  <span>Forgot or Request Official Reset Link</span>
                </button>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isChangingPassword ? 'Securing...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {isAvatarPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAvatarPickerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-2xl p-6 z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Choose Profile Picture</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select a professional portrait or enter a photo URL.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Corporate Presets
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset.url);
                        haptics.selection();
                        setIsAvatarPickerOpen(false);
                      }}
                      className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer text-center"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className={`w-14 h-14 rounded-2xl object-cover ring-2 transition-all ${
                          avatar === preset.url
                            ? 'ring-emerald-500 shadow-md scale-105'
                            : 'ring-black/[0.06] dark:ring-white/10 group-hover:ring-emerald-400'
                        }`}
                      />
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate w-full">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="space-y-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Or Custom Photo Web URL
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-black border border-black/[0.08] dark:border-white/15 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl.trim()) {
                        setAvatar(customAvatarUrl.trim());
                        haptics.selection();
                        setIsAvatarPickerOpen(false);
                        setCustomAvatarUrl('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all active:scale-[0.96] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
