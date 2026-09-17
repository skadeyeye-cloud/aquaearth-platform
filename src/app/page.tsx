'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    if (isAuthReady) {
      if (isAuthenticated) {
        router.replace('/workspace');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthReady, isAuthenticated, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F7] dark:bg-[#000000] select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md animate-pulse">
          AE
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Securing session...</p>
      </div>
    </div>
  );
}
