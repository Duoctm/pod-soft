'use client'

import { usePathname } from 'next/navigation';
import React from 'react'
import Image from 'next/image';
import { LinkWithChannel } from '@/ui/atoms/LinkWithChannel';

const companyName = "ZOOM PRINTS";


// eslint-disable-next-line import/no-default-export
export default function LogoNewVersion() {
    const pathname = usePathname();

    if (pathname === "/") {
        return (
            <h1 className="flex items-center font-bold text-white" aria-label="homepage">
                {companyName}
            </h1>
        );
    }

    return (
        <div className="flex items-center font-bold">
            <LinkWithChannel
                aria-label="homepage"
                href="/"
                className="flex items-center gap-2 relative w-[100px] h-[40px] md:w-[120px] md:h-[48px] lg:h-[75px] lg:w-[150px]"
            >
                <Image
                    src="/images/logo-new-v.webp"
                    alt="SwiftPod Logo"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100px, 100px"
                    className='object-left'
                    priority
                />
            </LinkWithChannel>
        </div>
    );
}
