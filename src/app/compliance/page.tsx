'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplianceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/compliance/permits');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-[#86868B]">
      Redirecting to Regulatory Compliance & Statutory Permits...
    </div>
  );
}
