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



const OurProduct = ({ channel }: { channel: string }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS)
    const PRODUCTS = [
        {
            "id": "1",
            "title": "T-Shirt",
            "description": "Our custom T-shirt printing service brings your ideas to life with high-quality prints on premium fabric.",
            "icon": "/icons/tshirt.svg",
            "image": "/images/t-shirts.webp",
            "linkText": "Learn more",
            "linkHref": `/${channel}/catalog/tee`
        },
        {
            "id": "2",
            "title": "Mugs",
            "description": "Sip in style with our custom printed mugs—perfect for gifts, branding, or daily inspiration.",
            "icon": "/icons/mugs.svg",
            "image": "/images/mug.webp",
            "linkText": "Learn more",
            "linkHref": null,
        },
        {
            "id": "3",
            "title": "Fleece",
            "description": "Your logo, design, or message is printed on soft, high-quality fleece that’s built to last.",
            "icon": "/icons/fleece.svg",
            "image": "/images/fleeces.webp",
            "linkText": "Learn more",
            "linkHref": `/${channel}/catalog/fleece`
        },
        {
            "id": "4",
            "title": "Sticker",
            "description": "Stick with creativity! Our custom stickers are perfect for branding, packaging, promotions, or personal expression.",
            "icon": "/icons/sticker.svg",
            "image": "/images/sticker.webp",
            "linkText": "Learn more ",
            "linkHref": null
        }
    ]

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi)

    return (
        <div className="w-full max-w-[100vw] mx-auto relative bg-[#F0F2F3] px-4  py-2 md:py-10 lg:py-14 ">
            <Wrapper className="min-h-[55vh] flex flex-1 flex-col items-center justify-center px-0 ">
                {/* Controls */}
                <h2 className="w-full text-center font-bold text-3xl md:text-4xl lg:text-[60px] text-[#263246]">Our Products</h2>
                <div className="w-full flex items-center justify-end gap-2 my-4">
                    <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                    <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                </div>
                <div ref={emblaRef} className="overflow-hidden w-full lg:py-10 ">
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

export default OurProduct