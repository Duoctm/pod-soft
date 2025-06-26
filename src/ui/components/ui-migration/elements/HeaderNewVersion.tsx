import React from 'react'
import Image from 'next/image'
import Wrapper from '../../wrapper'

import LogoNewVersion from './LogoNewVersion'
import Nav from './Nav'

const HeaderNewVersion = ({ channel }: { channel: string }) => {
    return (
        <header className="sticky top-0  bg-[#253244] shadow-md md:rounded-none md:shadow-none lg:py-0 z-50 ">
            <Image src='/images/aps-ketches.webp' fill className='bg-cover object-cover opacity-20' alt='' />
            <Wrapper className="flex items-center xl:h-[142px] py-4 xl:py-0 justify-between lg:px-4">
                <LogoNewVersion />
                <Nav channel={channel} />
            </Wrapper>
        </header>
    )
}

// eslint-disable-next-line import/no-default-export
export default HeaderNewVersion
