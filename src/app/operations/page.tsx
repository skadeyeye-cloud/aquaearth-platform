'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OperationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/operations/it-design');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-[#86868B]">
      Redirecting to IT & Design Ops Studio...
    </div>
  );
}
