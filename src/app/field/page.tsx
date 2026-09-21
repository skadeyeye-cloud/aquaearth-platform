'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FieldRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/field/capture');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-[#86868B]">
      Redirecting to Field Data Capture...
    </div>
  );
}
