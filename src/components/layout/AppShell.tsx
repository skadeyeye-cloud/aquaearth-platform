'use client';

import React, { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import PageTransition from '@/components/layout/PageTransition';
import RouteProgressBar from '@/components/layout/RouteProgressBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/request-access';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-[#ffffff] dark:bg-[#000000] text-slate-900 dark:text-white flex flex-col justify-center items-center transition-colors">
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ffffff] dark:bg-[#000000] text-slate-900 dark:text-slate-100 transition-colors">
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            <Sidebar onMobileItemClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-[#fcfcfd] dark:bg-[#000000] transition-colors">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
