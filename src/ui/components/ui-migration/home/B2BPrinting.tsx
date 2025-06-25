/* eslint-disable import/no-default-export */
import Image from 'next/image'
import React from 'react'

const B2BPrinting = () => {
    return (
        <div className='min-h-[35vh] md:min-h-[628px] flex flex-col items-center justify-center px-4 md:px-0 py-8 md:py-10 lg:py-14 bg-[#F0F2F3] relative'>
            <Image src='/images/b2b.webp' fill className='bg-center bg-contain object-cover ' alt='' />
            <div className='z-10 w-full flex flex-col items-center justify-center gap-4 relative'>

                <h2 className="text-4xl md:text-5xl lg:text-[65px] font-bold text-white text-center mb-4">
                    B2B PRINTING FOR
                    <br />
                    DISTRIBUTORS
                </h2>
                <p className='max-w-4xl text-center text-[#FAFAFA] text-sm md:text-base lg:text-2xl  mt-2 md:mt-4 lg:mt-8'>
                    Ready to make your custom design come to life? Get in touch with us and see why so many choose ZoomPrints as their go-to partner.
                </p>
            </div>
        </div>
    )
}

export default B2BPrinting
