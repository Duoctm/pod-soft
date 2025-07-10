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
import { TopProductCard } from "../elements/TopProductCard"

const OPTIONS: EmblaOptionsType = { loop: true, align: "start" }



const TopProducts = ({ channel }: { channel: string }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS)
    const PRODUCTS = [
        {
            "id": "1",
            "title": "Bella Canvas 3001",
            "description": "is a top choice for comfort and style. This unisex tee features a crew neck, tailored fit, and is made from ultra-soft Airlume combed and ring-spun cotton.",
            "icon": "/icons/tshirt.svg",
            "image": "/images/bella-3001.webp",
            "linkText": "Learn more",
            "linkHref": `/${channel}/products/bella-3001`,
            "bestSeller": true
        },
        {
            "id": "2",
            "title": "GILDAN 5000",
            "description": "Ideal for adults seeking style and durability, this tee is made from 100% heavyweight cotton for lasting wear. ",
            "icon": "/icons/mugs.svg",
            "image": "/images/gildan-5000.webp",
            "linkText": "Learn more",
            "linkHref": `/${channel}/products/gildan-5000`,
            "bestSeller": true
        },
        {
            "id": "3",
            "title": "Comfort Colors",
            "description": "If you want a tee for just relaxing or for more comfortable styling, this is perfect for you. ",
            "icon": "/icons/fleece.svg",
            "image": "/images/comfort-color.webp",
            "linkText": "Learn more",
            "linkHref": `/${channel}/products/comfort-color-1717`,
            "bestSeller": false
        },
        {
            "id": "4",
            "title": "Gildan 18000",
            "description": "Featuring a cozy, brushed interior, an extensive color palette, and 1x1 rib with spandex for enhanced stretch and recovery.",
            "icon": "/icons/sticker.svg",
            "image": "/images/gildan-18000.webp",
            "linkText": "Learn more ",
            "linkHref": `/${channel}/products/gildan-18000`,
            "bestSeller": false
        },
        {
            "id": "5",
            "title": "GILDAN 18500",
            "description": "Featuring a cozy brushed interior and an extensive color palette",
            "icon": "/icons/sticker.svg",
            "image": "/images/gildan-18500.webp",
            "linkText": "Learn more ",
            "linkHref": `/${channel}/products/gildan-18500`,
            "bestSeller": false
        },
        {
            "id": "6",
            "title": "GILDAN 500B",
            "description": "Featuring an extensive color palette, this classic fit tee includes a rib collar and taped neck and shoulders for added comfort and durability.",
            "icon": "/icons/sticker.svg",
            "image": "/images/gildan-500b.webp",
            "linkText": "Learn more ",
            "linkHref": `/${channel}/products/gildan-5000B`,
            "bestSeller": false
        },
        {
            "id": "7",
            "title": "Gildan 5000L",
            "description": "Designed for women who value style and comfort, this tee comes in a wide range of colors.",
            "icon": "/icons/gildan-500l.webp",
            "image": "/images/gildan-500l.webp",
            "linkText": "Learn more ",
            "linkHref": `/${channel}/products/gildan-5000L`,
            "bestSeller": false
        },
        {
            "id": "8",
            "title": "GILDAN 64000",
            "description": "Made from soft ring-spun cotton and cotton blends, it features a high stitch density for a smooth printing surface.",
            "icon": "/icons/sticker.svg",
            "image": "/images/gildan-6400.webp",
            "linkText": "Learn more ",
            "linkHref": `/${channel}/products/gildan-64000`,
            "bestSeller": false
        },
        {
            "id": "9",
            "title": "GILDAN 5000B",
            "description": "Featuring an extensive color palette, this classic fit tee includes a rib collar and taped neck and shoulders for added comfort and durability.",
            "icon": "/icons/sticker.svg",
            "image": "/images/gildan-500b1.webp",
            "linkText": "Learn more ",
            "linkHref": `/${channel}/products/next-level-3600`,
            "bestSeller": false
        },
        {
            "id": "10",
            "title": "Next Level 6210",
            "description": "Our top-selling tee known for its retail-inspired cut, softness, and breathability. Combines durability with elevated comfort in a classic style.",
            "icon": "/icons/sticker.svg",
            "image": "/images/next-level.webp",
            "linkText": "Learn more ",
            "linkHref": `/${channel}/products/next-level-6210`,
            "bestSeller": false
        },
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
                <h2 className="w-full text-center font-bold text-3xl md:text-4xl lg:text-[60px] text-[#263246]">Our Top Products</h2>
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
                                <TopProductCard {...product} />

                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper >
        </div>
    )
}

export default TopProducts