import React from "react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "../wrapper";

const SERVICES: ServiceType[] = [
	{
		title: "High-Quality Printing",
		description: "Sharp, vibrant prints with long-lasting quality.",
		link: "/default-channel/service",
		image: "/images/high-quanlity.jpg"
	},
	{
		title: "Customization Options",
		description: "Tailor designs, sizes, and materials your way.",
		link: "/default-channel/service",
		image: "/images/customize-options.jpg"
	},
	{
		title: "Quick Turnaround Time",
		description: "Fast, reliable delivery to meet your deadlines.",
		link: "/default-channel/service",
		image: "/images/quick-turaround.png"
	}
];


type ServiceType = {
    title: string;
    description: string;
    link: string;
    image: string;
}

const Servicecard = ({ service }: { service: ServiceType }) => {
    return (
        <div className="w-full flex flex-col md:p-[11px]">
            <Image src={service.image} alt={service.image} width={356} height={268} className="w-full h-full bg-cover bg-center rounded-xl" />
            <h4 className="py-5 font-bold text-xl md:text-2xl leading-[140%]">
                {service.title}
            </h4>
            <p className="font-normal text-sm md:text-base leading-7 text-[#909098]">
                {service.description}
            </p>
            <Link href={service.link} className="font-semibold text-sm text-[#FD8C6F] mt-5 flex items-center gap-x-3 md:gap-x-5 justify-end md:justify-start">
                Learn More
                <Image src={'/images/arrow-learn-more.jpg'} width={26} height={10} alt="" />
            </Link>
        </div>
    )
}

const AboutUs = () => {
    return (
        <Wrapper className="flex w-full flex-col py-12 md:py-24">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-6 lg:gap-y-0">
                <div className="flex flex-col gap-y-3 md:gap-y-5">
                    <span className="font-semibold text-xs md:text-[18px] space-x-[16%] text-[#EF816B] uppercase">About Us</span>
                    <h3 className="max-w-full md:max-w-[720px] w-full font-bold text-[42px] md:text-[50px] leading-[120%]">
                        Your Trusted Partner for Superior Printing Services
                    </h3>
                </div>
                <Link 
                href={"/default-channel/service"}
                className="w-full max-w-[133px] md:max-w-[200px] text-center text-xs lg:w-auto rounded-md bg-[#8B3958] px-8 md:px-14 py-3 lg:py-4 md:text-sm lg:text-base font-semibold text-white shadow-[0_9.67px_29.01px_rgba(253,140,111,0.25)]">
                    Learn More
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10 md:mt-[76px] gap-8 md:gap-x-16">
                {
                    SERVICES.map((service: ServiceType, index) => (
                        <Servicecard key={index} service={service} />
                    ))
                }
            </div>
        </Wrapper>
    );
};

export default AboutUs;
