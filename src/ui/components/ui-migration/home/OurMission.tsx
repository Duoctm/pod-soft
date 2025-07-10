/* eslint-disable import/no-default-export */
import Image from 'next/image'
import React from 'react'
import Wrapper from '../../wrapper'

const OurMission = () => {
    return (
        <div className='min-h-[70vh] flex flex-col items-center justify-center  md:px-0 py-8 md:py-10 lg:py-14 bg-[#1E2737] relative'>
            <Image src='/images/aps-ketches.webp' fill className='bg-center opacity-30' alt='' />
            <Wrapper className='flex flex-1 items-center justify-center flex-col gap-4 relative z-10 max-w-[1080px]'>
                <h2 className='text-3xl md:text-4xl lg:text-[65px] font-bold text-[#F58B71]'>Our Mission</h2>
                <p className='max-w-4xl lg:px-4 px-2  text-center text-[#F0F2F3] text-sm md:text-base lg:text-[25px] lg:mt-8 leading-tight'>
                    At ZoomPrints, we get you the freshest digital prints, fast: *just 1 day.
                    Our team is all about giving you the best service and top-quality prints every time from anywhere in the US. We stay ahead of the game, always pushing tech forward and keeping it green for the industry.
                </p>
                <div className='flex w-full justify-end max-w-3xl'>
                    <span className='text-white text-sm !font-light'>*Orders of 144 and lower single side print.</span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 lg:mt-8 min-h-0 md:min-h-[261px] h-full'>
                    {/* IMAGE BLOCK */}
                    <div className='relative w-full aspect-[16/9] md:aspect-auto md:h-auto'>
                        <Image
                            src="/images/t-shirts.webp"
                            alt=''
                            fill
                            className='object-cover rounded-2xl'
                        />
                    </div>

                    {/* TEXT BLOCK */}
                    <div className='bg-[#F58A71] text-white rounded-2xl flex items-center justify-center p-4 md:p-6 lg:p-8 text-center aspect-[16/9] md:aspect-auto'>
                        <p className='text-sm'>
                            Our digital printing offers hassle-free, detailed, and colorful designs—perfect for small or one-off orders. With no screens needed and water-based inks, it&apos;s eco-friendly and low-waste.
                            Plus, we have everything in stock, so your order is always ready to go.
                        </p>
                    </div>
                </div>
            </Wrapper>
        </div>
    )
}

export default OurMission
