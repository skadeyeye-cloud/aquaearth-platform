'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HrRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/hr/staff');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-[#86868B]">
      Redirecting to HR & Human Capital...
    </div>
  );
}
