/* eslint-disable import/no-default-export */
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Wrapper from '../../wrapper'

const FooterNewVersion = () => {
    return (
        <div className='min-h-[40vh] flex flex-col items-center justify-center px-4 md:px-0 py-8 md:py-10 lg:py-14 bg-[#1E2737] relative'>
            <Image src='/images/aps-ketches.webp' fill className='object-fill opacity-20 z-10 bg-repeat-y' alt='' />
            <Wrapper className='flex flex-1 items-start md:items-center justify-between flex-col md:flex-row '>
                <div className='flex items-start gap-4 flex-col'>
                    <Link href="/">
                        <Image src="/images/logo-new-v.webp" alt="SwiftPod Logo" width={150} height={75} />
                    </Link>
                    <span className='flex items-center gap-2 text-white text-sm justify-center w-full '>
                        <Link href="/"><Image src="/icons/fb.svg" alt="Facebook Logo" width={24} height={24} /></Link>
                        <Link href="/"><Image src="/icons/linkin.svg" alt="LinkedIn Logo" width={24} height={24} /></Link>
                    </span>
                </div>
                <div className='text-white text-sm flex flex-row md:flex-row gap-2 md:gap-4 mt-4 md:mt-0 flex-1 justify-end'>
                    <div className='flex flex-col items-start gap-2'>
                        <span className='font-semibold text-xl md:text-[20px]  text-[#F98D62]'>Contact Us</span>
                        <Link href="/"><span className='text-[#FAFAFA] xl:text-[15px]'>Customer Service 408-409-5249</span></Link>
                        <Link href="/"><span className='text-[#FAFAFA] xl:text-[15px]'>Sales 408-256-0097</span></Link>
                        <Link href="/"><span className='text-[#FAFAFA] xl:text-[15px]'>info@zoomprints.com
                            <br />
                            orders@zoomprints.com</span></Link>
                    </div>
                </div>
            </Wrapper >
        </div >
    )
}

export default FooterNewVersion
