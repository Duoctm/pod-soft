import Image from 'next/image';
import React from 'react';

const OurStory: React.FC = () => {
    return (
        <div className="bg-gradient-to-b from-[#253244] to-[#1C1C1C] py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-10 md:mb-12 text-center tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FD8C6E] to-[#8C3859]">
                        Our Story
                    </span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center mt-8 sm:mt-12 md:mt-16 max-w-8xl mx-auto">
                    <div className="flex justify-center group">
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] shadow-[0_20px_50px_rgba(253,140,110,0.15)] w-full lg:w-11/12 transform transition-all duration-700 hover:shadow-[0_30px_60px_rgba(140,56,89,0.2)]">
                            <Image 
                                src="/images/our-story.jpg" 
                                alt="Our Story Image" 
                                className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] object-cover transform transition-transform duration-1000 group-hover:scale-105"
                                width={1200}
                                height={900}
                                quality={100}
                                loading="eager"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1C1C1C]/30"></div>
                        </div>
                    </div>
                    <div className="px-4 sm:px-6 md:px-8 lg:px-16 flex items-center">
                        <ul className="space-y-6 sm:space-y-8 md:space-y-10">
                            {[
                                "We've been printing since 2020. Starting out as a small shop with big dreams. The founders Paul and Frank put their entrepreneurial minds and an eye for print innovation to become the largest and most trusted partner in direct to garment printing.",
                                "We're here to bring unmatched printing techniques from our own research and development team.",
                                "We have 5 locations across the US and 1 in Mexico that can fulfill any order at any time.",
                                "2 Day Ground shipping to anywhere in the US."
                            ].map((text, index) => (
                                <li key={index} className="flex items-start space-x-4 sm:space-x-6 group">
                                    <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 mt-2 bg-gradient-to-br from-[#FD8C6E] to-[#8C3859] rounded-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"></span>
                                    <span className="flex-1 text-base sm:text-lg md:text-xl text-[#FD8C6E] leading-[1.8] font-light tracking-wide transition-colors duration-300 group-hover:text-white">
                                        {text}
                                    </span>
                                </li>
                            ))}
                        </ul>``
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurStory;