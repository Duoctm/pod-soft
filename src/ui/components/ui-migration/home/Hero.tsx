/* eslint-disable import/no-default-export */
import React from 'react'
import Image from 'next/image'
import ShopNow from '../elements/ShopNow'
import Banner from '../elements/Banner'
import Wrapper from '../../wrapper'
import HeroTitle from '../elements/HeroTitle'
// import HeroSubTitle from '../elements/HeroSubTitle'


const HeroNewVersion = ({ channel }: { channel: string }) => {
    return (
        <section
            className="
                relative flex items-center justify-center
                min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-142px)]
                w-full overflow-hidden
            "
        >
            <Banner />
            {/* Background Image */}
            <Image
                src="/images/hero-section.webp"
                alt="Hero Background"
                fill
                priority
                quality={70}
                className="
                    scale-x-[-1] lg:scale-x-100
                    object-cover
                    object-right lg:object-center
                    transition-all
                    duration-300
                    select-none
                    pointer-events-none
                    -z-10
                    blur-sm
                    lg:blur-none
                "
                sizes="100vw"
            />

            {/* Content */}
            <div className='relative flex items-center justify-center w-full'>
                <Wrapper className='w-full flex items-center flex-row justify-center lg:justify-start'>
                    <div className='flex flex-col items-center justify-center lg:items-start lg:justify-start'>
                        <HeroTitle />
                        <div className='flex items-center justify-center flex-1 w-full lg:mt-10 mt-4'>
                            <ShopNow channel={channel} />

                        </div>
                        {/* <HeroSubTitle /> */}
                    </div>
                </Wrapper>
                {/* Responsive background image */}
            </div>

        </section>
    )
}

export default HeroNewVersion