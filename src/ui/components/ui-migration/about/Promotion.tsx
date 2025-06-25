/* eslint-disable import/no-default-export */
import Image from 'next/image'
import React from 'react'
import Wrapper from '../../wrapper'

const Promotion = () => {
    return (
        <div className="bg-[#1E2737] overflow-hidden relative pt-4 lg:pt-0">
            <Wrapper className="flex flex-col lg:flex-row items-center justify-between min-h-[660px] h-[660px] relative px-4 lg:px-0 ">
                {/* LEFT CONTENT */}
                <div className="flex flex-col justify-center gap-6 z-10 text-white max-w-xl">
                    <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold uppercase text-[#F58B71] leading-tight">
                        Looking For A Shop<br />
                        That Specializes<br />
                        In Large Orders?
                    </h2>
                    <p className="text-sm md:text-base lg:text-xl text-[#F0F2F3] max-w-[500px]">
                        <span className="text-[#F58B71]">$2.50/4 color</span> custom print silk screen printed shirt{' '}
                        <span className="text-[#F58B71]">(front only)</span> 1,200 qty.
                    </p>
                    <div>
                        <span className="inline-block bg-[#F58B71] text-[#1E2737] font-semibold text-sm lg:text-base px-6 py-3 rounded-full mt-4">
                            PROMO CODE: SILKC250
                        </span>
                    </div>
                </div>

                {/* RIGHT IMAGE SECTION */}
                <div className="relative w-full lg:w-[500px] h-full flex items-center justify-center">
                    {/* T-shirt 2 (background) */}
                    <div className="absolute inset-0 z-0" style={{ transform: 'translateX(40px)' }}>
                        <Image
                            src="/images/tshirt-promotion-2.webp"
                            alt="T-shirt 2"
                            fill
                            className="object-contain object-bottom"
                        />
                    </div>

                    {/* T-shirt 1 (front) */}
                    <div className="absolute inset-0 z-10" style={{ transform: 'translateX(-40px)' }}>
                        <Image
                            src="/images/tshirt-promotion-1.webp"
                            alt="T-shirt 1"
                            fill
                            className="object-contain object-bottom"
                        />
                    </div>
                </div>
            </Wrapper>
        </div>
    )
}

export default Promotion
