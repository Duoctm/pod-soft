/* eslint-disable import/no-default-export */
import React from 'react'
import Image from 'next/image'
import { Dot, MoveRight } from 'lucide-react';


export type ServiceCardProps = {
    id: string;
    title: string;
    descriptions: string[];
    icon: string;
    image: string;
    linkHref?: string;
    status?: "available" | "coming_soon";
};



const ServiceCard = ({ title, descriptions, icon, image, linkHref, status = "available", }: ServiceCardProps) => {



    return (
        <div className="group relative overflow-hidden rounded-xl shadow-md transition-all duration-300 bg-white group max-w-[400px] w-full">
            {/* Image */}
            <div className="relative h-40 w-full">
                {/* Background image */}
                <Image src={image} alt={title} fill className="object-cover rounded-t-lg" />

                {/* Coming soon label */}
                {status === "coming_soon" && (
                    <div className="absolute top-2 right-2 bg-[#D75E73] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        COMING SOON
                    </div>
                )}
            </div>
            <div className="relative flex flex-col h-full bg-white">
                <div className="absolute -top-12 left-4 w-24 h-24 rounded-full bg-[#273245] flex items-center justify-center border-4 border-white shadow-md">
                    <Image src={icon} alt={title} width={48} height={48} />
                </div>

                <div className="pt-[76px] pb-5 px-4">
                    <h3 className="text-sm font-bold text-[#273245]">{title}</h3>
                    {descriptions.map((desc, index) => (
                        <p key={index} className="text-xs text-gray-600 flex items-center gap-1">
                            <Dot /> {desc}
                        </p>
                    ))}
                    {linkHref ? (
                        <a
                            href={linkHref}
                            className="text-[#f98d62] text-xs font-semibold mt-2 inline-block hover:underline"
                        >
                            Learn More <MoveRight className="inline-block ml-1" />
                        </a>
                    ) : (
                        <span className="text-[##273245] text-xs font-semibold mt-2 inline-block">
                            Coming Soon
                        </span>
                    )}
                </div>
            </div>
            <div className="h-2 group-hover:bg-[#f9d2c0]"></div>
        </div>
    )
}

export default ServiceCard
