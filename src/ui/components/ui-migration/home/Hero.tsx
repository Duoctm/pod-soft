/* eslint-disable import/no-default-export */
import React from 'react'
import Image from 'next/image'
import ShopNow from '../elements/ShopNow'


const HeroNewVersion = ({ channel }: { channel: string }) => {
    return (
        <section
            className="
                relative flex items-center justify-center
                min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-142px)]
                w-full overflow-hidden
            "
        >
            {/* Background Image */}
            <Image
                src="/images/hero-section.webp"
                alt="Hero Background"
                fill
                priority
                quality={70}
                className="
                    object-cover
                    object-left md:object-center
                    transition-all
                    duration-300
                    select-none
                    pointer-events-none
                    -z-10
                "
                sizes="100vw"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-[#1E2737] opacity-40 -z-0 pointer-events-none" />

            {/* Content */}
            <div
                className="
                    relative z-10 flex flex-col
                    items-center lg:items-start
                    justify-center
                    text-center lg:text-left
                    w-full max-w-3xl px-4
                "
            >
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#F58B71] mb-4 leading-tight">
                    Fresh Prints, Fast Delivery
                </h1>
                <p className="text-[#F0F2F3] text-base md:text-xl lg:text-2xl mb-8 max-w-2xl">
                    Get your custom shirts printed and shipped in just 1 day. Top quality, best service, anywhere in the US.
                </p>
                <ShopNow channel={channel} />
            </div>
        </section>
    )
}

export default HeroNewVersion