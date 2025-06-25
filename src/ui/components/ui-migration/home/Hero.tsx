/* eslint-disable import/no-default-export */
import React from 'react'
import Image from 'next/image'
import Wrapper from '../../wrapper'
import Banner from '../elements/Banner'
import HeroTitle from '../elements/HeroTitle'
import HeroSubTitle from '../elements/HeroSubTitle'
import ShopNow from '../elements/ShopNow'

const HeroNewVersion = ({ channel }: { channel: string }) => {
    return (


        <Wrapper className='flex flex-col items-center justify-center max-w-full px-0 min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-142px)] relative overflow-hidden  '>
            <Banner />
            <div className='relative flex items-center justify-center w-full'>
                <Wrapper className='w-full flex items-start flex-row'>
                    <div className='flex flex-col items-center justify-center lg:items-start lg:justify-start'>
                        <HeroTitle />
                        <div className='flex items-center justify-center flex-1 w-full lg:mt-10 mt-4'>
                            <ShopNow channel={channel} />

                        </div>
                        <HeroSubTitle />
                    </div>
                    <div className='hidden lg:block'></div>
                </Wrapper>
                {/* Responsive background image */}
            </div>
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/hero-section.webp"
                    alt="Hero Image"
                    fill
                    priority
                    className="object-cover object-right blur-sm lg:blur-0 w-full h-full scale-x-[-1] md:scale-x-100"
                />
            </div>
        </Wrapper>


    )
}

export default HeroNewVersion
