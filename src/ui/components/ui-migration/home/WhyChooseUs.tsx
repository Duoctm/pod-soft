/* eslint-disable import/no-default-export */
"use client"

import React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { type EmblaOptionsType } from "embla-carousel/components/Options"
import {
    PrevButton,
    NextButton,
    usePrevNextButtons,
} from "../elements/EmblaCarouselArrowButtons"
import Wrapper from "../../wrapper"
import { ProductCard } from "../elements/ProductCard"

const OPTIONS: EmblaOptionsType = { loop: true, align: "start" }

const PRODUCTS = [
    {
        "id": "1",
        "title": "Highest Quality ",
        "description": "Our DTG printer offer vibrant colors, sharp details, and a soft feel. It’s perfect for complex designs and photo-quality prints that won’t crack or peel over time.",
        "icon": "/icons/highest-qty.svg",
        "image": "/images/hightest-qty.webp",
    },
    {
        "id": "2",
        "title": "Speed",
        "description": "We use our own custom technology to speed up ordering and production, ensuring fast, efficient service with top-quality results.",
        "icon": "/icons/speed.svg",
        "image": "/images/speed.webp",
    },
    {
        "id": "3",
        "title": "Competitive Pricing ",
        "description": "Our pricing is competitive, giving you great value without sacrificing quality. We’re reliable, easy to work with, and committed to helping your business grow—making us a strong partner you can count on. ",
        "icon": "/icons/competitive-pricing.svg",
        "image": "/images/competitive-pricing.webp",
    }
]


const WhyChooseUs = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS)

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi)


    return (
        <div className="w-full max-w-[100vw] mx-auto relative bg-[#F0F2F3]">
            <Wrapper className="min-h-[55vh] flex flex-1 flex-col items-center justify-center px-4 md:0 py-2  md:py-10 lg:py-14 ">
                {/* Controls */}
                <h2 className="w-full text-center font-bold text-3xl md:text-4xl lg:text-[60px] text-[#263246]">Why Choose Us?</h2>
                <div className="w-full flex items-center justify-end gap-2 mt-4">
                    <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                    <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                </div>
                <div ref={emblaRef} className="overflow-hidden w-full lg:py-10 py-4">
                    <div className="flex -ml-4 md:-ml-6 lg:-ml-8">
                        {PRODUCTS.map((product, index) => (
                            <div
                                key={index}
                                className="pl-4 md:pl-6 lg:pl-8 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]"
                            >
                                <ProductCard {...product} />

                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper >
        </div>
    )
}

export default WhyChooseUs
