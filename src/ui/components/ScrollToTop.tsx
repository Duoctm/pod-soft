// app/components/ScrollToTop.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();
  console.log(pathname)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
