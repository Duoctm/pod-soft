/* eslint-disable import/no-default-export */
import React from 'react'
import Wrapper from '../../wrapper'
import Banner from '../elements/Banner'
import HeroTitle from '../elements/HeroTitle'
import HeroSubTitle from '../elements/HeroSubTitle'
import ShopNow from '../elements/ShopNow'
import Image from 'next/image'

const HeroNewVersion = ({ channel }: { channel: string }) => {
    return (
        <Wrapper className="flex flex-col items-center justify-center max-w-full px-0 min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-142px)] relative overflow-hidden">

            {/* Ảnh nền bằng Next.js Image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/hero-section.webp"
                    alt="Hero Background"
                    fill
                    priority
                    quality={70}
                    className="object-cover object-right md:object-center"
                />
            </div>

            {/* Overlay nếu cần tối hơn */}
            <div className="absolute inset-0 z-0 bg-[#1E2737] opacity-40 pointer-events-none" />

            <Banner />

            <div className="relative flex items-center justify-center w-full z-10">
                <Wrapper className="w-full flex items-start flex-row">
                    <div className="flex flex-col items-center justify-center lg:items-start lg:justify-start">
                        <HeroTitle />
                        <div className="flex items-center justify-center flex-1 w-full lg:mt-10 mt-4">
                            <ShopNow channel={channel} />
                        </div>
                        <HeroSubTitle />
                    </div>
                    <div className="hidden lg:block"></div>
                </Wrapper>
            </div>
        </Wrapper>
    )
}

export default HeroNewVersion
