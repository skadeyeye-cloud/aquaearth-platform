'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KpiRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/kpi/leaderboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-[#86868B]">
      Redirecting to KPI Leaderboard...
    </div>
  );
}
