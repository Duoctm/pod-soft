"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export function Breadcrumb({ channel, id }: { channel: string | null, id: string | null }) {
    const breadcrumbs: any[] = [];
    breadcrumbs.push({
        href: `/${channel}/orders`,
        label: 'Orders'
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
                <li className="flex items-center">
                    <Link href={`/${channel}/orders`} className="hover:underline color-[#51525c]">
                        Orders
                    </Link>
                    <span className="mx-1"><ChevronRight></ChevronRight></span>

                </li>
                <li className="flex items-center">
                    <span className="color-[#51525c]">{id}</span>
                </li>
            </ol>
        </nav>
    );
}
