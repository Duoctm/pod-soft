/* eslint-disable import/no-default-export */
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Wrapper from '../../wrapper'



const FooterNewVersion = () => {
    return (
        <div className='min-h-[30vh] flex flex-col items-center justify-center px-4 md:px-0 py-8 md:py-10 lg:py-14 bg-[#1E2737] relative'>
            <Image src='/images/aps-ketches.webp' fill className='bg-center opacity-30 -z-10' alt='' />
            <Wrapper className='flex flex-1 items-start md:items-center justify-between flex-col md:flex-row gap-4'>
                <div className='flex items-start gap-4 flex-col flex-1 w-full'>
                    <Link href="/">
                        <Image src="/images/logo-new-v.webp" alt="SwiftPod Logo" width={150} height={75} />
                    </Link>
                    <span className='flex items-center gap-2 text-white text-sm justify-between w-full md:max-w-[300px]'>
                        <Link href="/"><Image src="/icons/fb.svg" alt="Facebook Logo" width={20} height={20} /></Link>
                        <Link href="/"><Image src="/icons/x.svg" alt="Twitter Logo" width={20} height={20} /></Link>
                        <Link href="/"><Image src="/icons/instagram.svg" alt="Instagram Logo" width={20} height={20} /></Link>
                        <Link href="/"><Image src="/icons/linkin.svg" alt="LinkedIn Logo" width={20} height={20} /></Link>
                        <Link href="/"><Image src="/icons/ytb.svg" alt="YouTube Logo" width={20} height={20} /></Link>
                    </span>
                </div>
                <div className='text-white text-sm flex flex-row md:flex-row gap-2 md:gap-4 mt-4 md:mt-0'>
                    <div className='flex flex-col items-start  '>
                        <span className='font-semibold text-xl md:text-[20px] lg:mb-6 mb-4 text-[#F98D62] uppercase' >COMPANY</span>
                        <Link href="/"><span className='text-[#FAFAFA] text-base'>Retail</span></Link>
                        <Link href="/"><span className='text-[#FAFAFA] text-base'>Location</span></Link>
                        <Link href="/"><span className='text-[#FAFAFA] text-base'>About Us</span></Link>
                    </div>
                    <div className='flex flex-col items-start'>
                        <span className='font-semibold text-xl md:text-[20px] lg:mb-6 mb-4 text-[#F98D62] uppercase'>Contact Us</span>
                        <Link href="/"><span className='text-[#FAFAFA] text-base'>Number</span></Link>
                        <Link href="/"><span className='text-[#FAFAFA] text-base'>Location</span></Link>
                        <Link href="/"><span className='text-[#FAFAFA] text-base'>Email</span></Link>
                    </div>
                </div>
            </Wrapper >
        </div >
    )
}

export default FooterNewVersion
