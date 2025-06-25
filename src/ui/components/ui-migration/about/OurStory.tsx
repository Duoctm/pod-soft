/* eslint-disable import/no-default-export */
import React from 'react'
import Image from 'next/image'
import Wrapper from '../../wrapper'

const OurStory = () => {
    return (
        <Wrapper className='flex flex-col items-center justify-center max-w-full px-0 min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-142px)]  relative overflow-hidden'>
            <div className='relative w-full  flex flex-1 flex-col z-20  text-white text-center py-20 lg:py-32 px-4 lg:px-0'>
                <Wrapper className='w-full flex items-start '>
                    <div className='flex flex-col items-start justify-center gap-4 lg:gap-6 flex-1 max-w-3xl w-full'>
                        <h2 className="text-4xl md:text-5xl lg:text-[65px] font-bold text-white text-start">
                            OUR STORY
                        </h2>
                        <ul className='style-none list-disc text-left text-lg md:text-xl lg:text-2xl font-semibold lg:mt-10 space-y-4'>
                            <li>We’ve been printing since 2020.</li>
                            <li>We’re here to bring unmatched printing techniques from our own research and development team</li>
                            <li>We have 5 locations across the US that can fulfill any order at any time.</li>
                            <li>2 Day Ground shipping to anywhere in the US.</li>
                        </ul>
                    </div>

                </Wrapper>
            </div>
            <Image src={'/images/our-story.webp'} alt='Hero Image' fill className='bg-cover object-cover  bg-center -z-10 blur-sm md:blur-none' />
        </Wrapper>
    )
}

export default OurStory
