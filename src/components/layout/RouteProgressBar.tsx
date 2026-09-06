'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathRef = useRef(pathname);

  // Trigger progress bar animation on route or query change
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      
      // Start navigation animation
      setIsVisible(true);
      setProgress(15);

      const t1 = setTimeout(() => setProgress(75), 40);
      const t2 = setTimeout(() => setProgress(100), 160);
      const t3 = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 360);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] overflow-hidden">
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
            transition={{
              width: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
              opacity: { duration: 0.15, delay: progress === 100 ? 0.08 : 0 }
            }}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
