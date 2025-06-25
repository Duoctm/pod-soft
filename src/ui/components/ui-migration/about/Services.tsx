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
import ServiceCard, { type ServiceCardProps } from "../elements/ServiceCard"

const OPTIONS: EmblaOptionsType = { loop: true, align: "start" }





const Services = ({ channel }: { channel: string }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS)
    const PRODUCTS: ServiceCardProps[] = [
        {
            "id": "1",
            "title": "Silk Screening",
            "descriptions": [
                "Fidelity for any sized order.",
                "High-end M&R and Zuect machines.",
                "Specialized in 500+ piece orders."
            ],
            "status": "available",
            "icon": "/icons/silk-printing.svg",
            "image": "/images/we-do.webp ",
            linkHref: `/${channel}/products`
        },
        {
            "id": "2",
            "title": "Direct-To-Garment",
            "descriptions": [
                "Top of the line Brother DTG machines.",
                "No pre-treatment stains.",
                "Leading digital printing innovation."
            ],
            "status": "available",
            "icon": "/icons/dtg.svg",
            "image": "/images/t-shirts.webp",
            "linkHref": `/${channel}/products`
        },
        {
            "id": "3",
            "title": "Embroidery",
            "descriptions": [
                "Single head machines for custom orders.",
                "Dedicated quality embroidery team.",
                "Tajima machines with 15 thread colors."
            ],
            "status": "coming_soon",
            "icon": "/icons/embroidery.svg",
            "image": "/images/embroidery.webp",
            "linkHref": ""
        },
        {
            "id": "4",
            "title": "Custom Boxes",
            "descriptions": [
                "Eye-catching designs.",
                "Perfect for executive kits.",
                "Premium packaging solutions."
            ],
            "status": "coming_soon",
            "icon": "/icons/custom-box.svg",
            "image": "/images/custom-boxes.webp",
            "linkHref": ""
        },
        {
            "id": "5",
            "title": "Hard Goods",
            "descriptions": [
                "Premium drinkware options.",
                "Metal and ceramic machines.",
                "Professional finishing."
            ],
            "status": "coming_soon",
            "icon": "/icons/hard-goods.svg",
            "image": "/images/mug.webp",
            "linkHref": ""
        },
        {
            "id": "6",
            "title": "Canvas Prints",
            "descriptions": [
                "Ultra HD printers.",
                "Vibrant color inks.",
                "Durable materials."
            ],
            "status": "coming_soon",
            "icon": "/icons/canvas.svg",
            "image": "/images/b2b.webp",
            "linkHref": ""
        }
    ]
    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    } = usePrevNextButtons(emblaApi)


    return (
        <div className="w-full max-w-[100vw] mx-auto relative bg-[#F0F2F3]">
            <Wrapper className="min-h-[60vh] flex flex-1 flex-col items-center justify-center px-4 md:0 py-2 md:py-10 lg:py-14 ">
                {/* Controls */}
                <h2 className="w-full text-center font-bold text-3xl md:text-4xl lg:text-[60px] text-[#263246]">Services {channel}</h2>
                <div className="w-full flex items-center justify-end gap-2 my-4">
                    <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                    <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                </div>
                <div ref={emblaRef} className="overflow-hidden w-full">
                    <div className="flex -ml-4 md:-ml-6 lg:-ml-8">
                        {PRODUCTS.map((service, index) => (
                            <div
                                key={index}
                                className="pl-4 md:pl-6 lg:pl-8 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]"
                            >
                                <ServiceCard {...service} />

                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper >
        </div>
    )
}

export default Services
