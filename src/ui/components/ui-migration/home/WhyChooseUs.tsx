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
        "title": "Huge Inventory",
        "description": "We have a huge inventory of the promo industry’s favorite and best selling apparel.",
        "icon": "/icons/warehouse.svg",
        "image": "/images/warehouse.webp",
    },
    {
        "id": "2",
        "title": "Less Waste",
        "description": "We are at the forefront of digital printing. Our method produces a lot less waste than traditional decoration methods.",
        "icon": "/icons/recycle.svg",
        "image": "/images/recycle.webp",
    },
    {
        "id": "3",
        "title": "Line Brother",
        "description": "With top of the line Brother DTG machines, we get your order out, fast and looking mint.",
        "icon": "/icons/printer.svg",
        "image": "/images/printer.webp",
    },
    {
        "id": "4",
        "title": "5 Locations",
        "description": "With 5 locations across the continental US we can ensure that your print will be faster and better than anyone else.",
        "icon": "/icons/locations.svg",
        "image": "/images/locations.webp"
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
