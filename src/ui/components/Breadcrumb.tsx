"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ChevronRight } from "lucide-react";
import Wrapper from "./wrapper";

export function Breadcrumb({ channel }: { channel: string }) {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const filteredSegments = segments[0] === channel ? segments.slice(1) : segments;

    // Ẩn breadcrumb nếu chỉ có "Home" hoặc có từ "design"
    if (filteredSegments.length === 0 || segments.includes("design") || segments.includes("about")) {
      setShouldShow(false);
    } else {
      setShouldShow(true);
    }
  }, [pathname, channel, shouldShow]);


  if (!shouldShow) return null;

  const segments = pathname.split("/").filter(Boolean);
  const filteredSegments = segments[0] === channel ? segments.slice(1) : segments;

  const breadcrumbs = filteredSegments.map((segment, index) => {
    const href = "/" + [channel, ...filteredSegments.slice(0, index + 1)].join("/");
    const label = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  return (
    <div className="bg-[#fafafa] py-2">
      <Wrapper className=" text-sm px-4" aria-label="Breadcrumb">
        <ol className="flex text-gray-700 items-center space-x-2">
          <li className="flex items-center">
            <Link href={`/${channel}`} className="text-[#51525c] hover:underline flex items-center">
              <Home size={16} className="mr-1" />
            </Link>
            {breadcrumbs.length > 0 && <span className="mx-1"><ChevronRight /></span>}
          </li>
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index < breadcrumbs.length - 1 ? (
                <>
                  <Link href={item.href} className="hover:underline text-[#51525c]">
                    {item.label}
                  </Link>
                  <span className="mx-1"><ChevronRight /></span>
                </>
              ) : (
                <span className="text-[#51525c]" aria-current="page">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </Wrapper>
    </div>
  );
}
