"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      }
      );
    }, 100); // delay để đảm bảo DOM render xong
  }, [pathname]);

  return null;
}
