'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BdRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bd/pipeline');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-[#86868B]">
      Redirecting to BD & Tendering...
    </div>
  );
}
