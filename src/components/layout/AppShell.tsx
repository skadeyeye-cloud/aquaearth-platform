'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import PageTransition from '@/components/layout/PageTransition';
import RouteProgressBar from '@/components/layout/RouteProgressBar';
import { Lock } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/request-access';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthReady && !isAuthenticated && !isAuthPage) {
      router.replace('/login');
    }
  }, [isAuthReady, isAuthenticated, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F6F4F0] flex flex-col justify-center items-center transition-colors">
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <LoadingOverlay />
        <main className="w-full h-full flex flex-col justify-center items-center">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    );
  }

  // Block unauthorized users from seeing internal dashboard chrome
  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F6F4F0] flex flex-col items-center justify-center p-6 select-none transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg mb-4">
          <Lock className="w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Security Gateway Active</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verifying credentials & session keys...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F6F4F0] transition-colors">
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
      <LoadingOverlay />
      
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-col shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex select-none">
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            <Sidebar onMobileItemClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F5F5F7] dark:bg-[#000000] transition-colors">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
