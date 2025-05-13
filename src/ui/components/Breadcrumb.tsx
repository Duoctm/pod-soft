"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import Wrapper from "./wrapper";

export function Breadcrumb({ channel }: { channel: string }) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const filteredSegments = segments[0] === channel ? segments.slice(1) : segments;

  // Ẩn breadcrumb nếu chỉ có "Home"
  if (filteredSegments.length === 0) return null;

  const breadcrumbs = filteredSegments.map((segment, index) => {
    const href = "/" + [channel, ...filteredSegments.slice(0, index + 1)].join("/");
    const label = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  return (
    <Wrapper className="bg-white text-sm px-4 py-2 mt-5" aria-label="Breadcrumb">
      <ol className="flex text-gray-700 items-center space-x-2">
        <li className="flex items-center">
          <Link href={`/${channel}`} className="color-[#51525c] hover:underline flex items-center">
            <Home size={16} className="mr-1" />
          </Link>
          {breadcrumbs.length > 0 && <span className="mx-1"><ChevronRight></ChevronRight></span>}
        </li>
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index < breadcrumbs.length - 1 ? (
              <>
                <Link href={item.href} className="hover:underline color-[#51525c]">
                  {item.label}
                </Link>
                <span className="mx-1"><ChevronRight></ChevronRight></span>
              </>
            ) : (
              <span className="color-[#51525c]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </Wrapper>
  );
}
