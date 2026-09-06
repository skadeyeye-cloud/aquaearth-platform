'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { usePresence } from '@/lib/presence-context';
import { haptics } from '@/lib/haptics';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  ScanFace
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import BiometricAuthModal from '@/components/auth/BiometricAuthModal';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export default function Header({ onOpenMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const { currentUser, allUsers, switchUser, logout, theme, toggleTheme, notifications } = useAuth();
  const { activeUsers } = usePresence();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPresenceOpen, setIsPresenceOpen] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-[#000000] sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 select-none border-b border-black/[0.08] dark:border-white/[0.12] transition-colors gap-2 sm:gap-3">
        {/* Left Mobile Menu Trigger & Search */}
        <div className="flex items-center gap-2 flex-1 max-w-[220px] sm:max-w-xs md:max-w-sm lg:max-w-md min-w-0">
          {onOpenMobileSidebar && (
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Spotlight search..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-white/10 border border-black/[0.04] dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-[#0d0d10] transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Collaboration Presence Radar (Multiplayer Team Activity) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setIsPresenceOpen(!isPresenceOpen);
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-black/[0.04] dark:border-white/[0.08] transition-all active:scale-95 cursor-pointer"
              title="Live Team Presence & Multi-disciplinary Collaboration"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tnum">
                {activeUsers.length} Online
              </span>
              <div className="flex -space-x-1.5 ml-0.5">
                {activeUsers.slice(0, 3).map(u => (
                  <img
                    key={u.id}
                    src={u.avatar}
                    alt={u.name}
                    className="w-5 h-5 rounded-full ring-1.5 ring-white dark:ring-black object-cover shrink-0"
                  />
                ))}
              </div>
            </button>

            {/* Presence Flyout Card */}
            {isPresenceOpen && (
              <>
                <div 
                  onClick={() => setIsPresenceOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl shadow-2xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Active Field & Office Personnel</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      LIVE RADAR
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {activeUsers.map(colleague => (
                      <div 
                        key={colleague.id}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={colleague.avatar}
                              alt={colleague.name}
                              className="w-7 h-7 rounded-xl object-cover"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-[11px] leading-tight">
                                {colleague.name}
                              </div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400">
                                {colleague.jobTitle}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                            {colleague.location}
                          </span>
                        </div>

                        {colleague.activeItemTitle && (
                          <div className="pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate max-w-[190px]">
                              {colleague.activeItemTitle}
                            </span>
                            <Link
                              href={colleague.activeModule}
                              onClick={() => setIsPresenceOpen(false)}
                              className="text-[9px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline ml-1"
                            >
                              Join
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Apple Dark Mode Toggle (Instant Touch & Click) */}
          <button
            type="button"
            onClick={() => {
              haptics.impact();
              toggleTheme();
            }}
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-[0.94] shrink-0 flex items-center justify-center cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-800 pointer-events-none" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 pointer-events-none" />
            )}
          </button>

          {/* Notification Bell with Badge & Drawer Trigger */}
          <button
            type="button"
            onClick={() => {
              haptics.impact();
              setIsNotificationOpen(prev => !prev);
            }}
            className="relative p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-[0.94] shrink-0 flex items-center justify-center cursor-pointer"
            title="Open Notification Center"
            aria-label="Open Notification Center"
          >
            <Bell className="w-4 h-4 pointer-events-none" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black animate-pulse pointer-events-none" />
            )}
          </button>

          {/* Persona Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-2 p-1.5 pr-2 sm:pr-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-xl object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.1]"
              />
              <div className="text-left hidden md:block max-w-[130px]">
                <div className="font-bold text-xs text-slate-900 dark:text-white leading-none truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 truncate">
                  {currentUser.jobTitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 pointer-events-none" />
            </button>

            {/* Persona Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-black/[0.08] dark:border-white/[0.15] shadow-2xl p-2 z-50 space-y-1.5 text-xs origin-top-right transition-transform"
                >
                  <div className="px-2.5 py-1.5 border-b border-black/[0.05] dark:border-white/[0.08]">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Switch Persona (RBAC Scoped)
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {allUsers.map((user) => (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                          user.id === currentUser.id 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs font-bold' 
                            : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={user.name}
                            className="w-6 h-6 rounded-lg object-cover shrink-0"
                          />
                          <div className="truncate">
                            <div className="font-semibold text-xs truncate">{user.name}</div>
                            <div className={`text-[10px] truncate ${user.id === currentUser.id ? 'text-slate-300 dark:text-slate-700' : 'text-slate-400 dark:text-slate-500'}`}>
                              {user.jobTitle}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ml-1 shrink-0 whitespace-nowrap ${
                          user.id === currentUser.id 
                            ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950' 
                            : 'bg-black/[0.05] dark:bg-white/10 text-slate-600 dark:text-slate-300'
                        }`}>
                          {user.accessTier}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Biometric Quick Re-auth */}
                  <div className="pt-1.5 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsBiometricModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold transition-all text-xs active:scale-[0.97] cursor-pointer mb-1 whitespace-nowrap shrink-0"
                    >
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <ScanFace className="w-3.5 h-3.5 shrink-0" />
                        <span>FaceID / TouchID Unlock</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 whitespace-nowrap shrink-0">Active</span>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-all text-xs active:scale-[0.97] cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Lock & Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Notification Center Sliding Sheet */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Apple Biometric Quick-Unlock Modal */}
      <BiometricAuthModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onSuccess={(user) => {
          switchUser(user.id);
        }}
      />
    </>
  );
}
