/* eslint-disable import/no-default-export */
import Image from 'next/image'
import React from 'react'
import Wrapper from '../../wrapper'

const WeDo = () => {
    return (
        <div className='min-h-[50vh] w-full relative flex items-center justify-center flex-col gap-6 px-4 lg:px-8' >
            <Wrapper className='z-10 flex items-center justify-center flex-col'>
                <h2 className='text-3xl md:text-4xl lg:text-[58px] font-bold text-[#FAFAFA]'>What We Do</h2>
                <p className='text-center max-w-5xl text-[#F0F2F3] text-sm md:text-base lg:text-2xl  mt-2 md:mt-4 lg:mt-8'>
                    We specialize in on-demand digital printing for custom apparel, helping brands, teams, and creators bring their designs to life with speed and precision. Whether you need shirts for a marketing event or your online merch store, ZoomPrints delivers — often in just 1 business day.
                </p>
            </Wrapper>


            <Image
                src={'/images/we-do_1.webp'}
                alt='We Do'
                fill
                className='object-cover object-center -z-10 blur-sm md:blur-none '

            />
        </div>
    )
}

export default WeDo
