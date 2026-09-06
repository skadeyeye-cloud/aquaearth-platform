'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Reset scroll container position cleanly on route transition
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.18,
        ease: [0.23, 1, 0.32, 1],
      }}
      style={{ willChange: 'transform, opacity' }}
      className="w-full h-full min-h-0"
    >
      {children}
    </motion.div>
  );
}
