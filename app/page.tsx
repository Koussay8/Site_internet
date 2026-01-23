'use client';

import { useState, useEffect } from 'react';
import MobileHome from '@/components/MobileHome';
import DesktopHome from '@/components/DesktopHome';

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Avoid hydration mismatch by rendering nothing until client-side check is done
  if (isMobile === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F10] text-white">
        {/* Optional: Add a spinner or loader here */}
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isMobile ? <MobileHome /> : <DesktopHome />;
}


