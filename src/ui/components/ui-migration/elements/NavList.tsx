/* eslint-disable import/no-default-export */
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'

const NavList = ({ navLinks }: { navLinks: { name: string; path: string }[] }) => {
    const location = usePathname()

    return (
        <ul className='md:flex items-center gap-2 hidden'>
            {navLinks.map(link => (

                <Link
                    key={link.name}
                    href={link.path}
                    className={cn(`text-white text-sm px-4 py-1 rounded ${location === link.path ? 'bg-[#F58A71] rounded-md text-[#273245]' : ''
                        }`)}
                >
                    {link.name}
                </Link>

            ))}
        </ul>
    )
}

export default NavList
