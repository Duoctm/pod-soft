"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export function Breadcrumb({ channel, catalogName, catalogSlug, productName, productSlug }: { channel: string | null, catalogName: string | null, catalogSlug: string | null, productName: string | null,  productSlug: string | null}) {
  const breadcrumbs : any[] = [];
  breadcrumbs.push({
    href: `/${channel}/catalog`,
    label: `Catalog`
  });
  breadcrumbs.push({
    href: `/${channel}/catalog/${catalogSlug}`,
    label: catalogName
  });
  breadcrumbs.push({
    href: `/${channel}/catalog/${catalogSlug}/${productSlug}`,
    label: productName
  });

  return (
    <nav className="bg-white text-sm px-4 py-2 mt-5" aria-label="Breadcrumb">
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
    </nav>
  );
}
