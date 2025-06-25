/* eslint-disable import/no-default-export */


// import { usePathname } from 'next/navigation'
import React, { Suspense } from 'react'
import { CartNavItem } from '../../nav/components/CartNavItem'
import { UserMenuContainer } from '../../nav/components/UserMenu/UserMenuContainer'
import { MobileMenu } from '../../nav/components/MobileMenu'
import NavList from './NavList'
import NavListMobile from './NavListMobile'



const Nav = ({ channel }: { channel: string }) => {

    const navLinks = [
        { name: 'Home', path: `/${channel}` },
        { name: 'About', path: `/${channel}/about` },
        { name: 'Shop', path: `/${channel}/products` },
        { name: 'Support', path: `/${channel}/support` },
    ]



    return (
        <div className='flex items-center justify-between z-10'>
            <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                <NavList navLinks={navLinks} />
                <Suspense fallback={<div className="w-8" />}>
                    <UserMenuContainer params={{ channel: channel }} />
                </Suspense>
                <Suspense fallback={<div className="w-6" />}>
                    <CartNavItem channel={channel} />
                </Suspense>
                <Suspense fallback={<div className="w-6" />}>
                    <MobileMenu>
                        <NavListMobile navLinks={navLinks} />
                    </MobileMenu>
                </Suspense>
            </div>


        </div >
    )
}

export default Nav
