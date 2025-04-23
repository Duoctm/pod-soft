import React from 'react';

const OurStory: React.FC = () => {
    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6 text-center">
                    Our Story
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-6">
                    <div className="flex justify-center">
                        <img 
                            src="/images/our-story.jpg" 
                            alt="Our Story Image" 
                            className="rounded-lg shadow-md w-4/5 md:w-3/4 h-auto" 
                        />
                    </div>
                    <div>
                        <ul className="list-disc list-inside text-lg text-gray-500">
                            <li className="mb-2">
                                We've been printing since 2020. Starting out as a small shop with big dreams. The founders Paul and Frank put their entrepreneurial minds and an eye for print innovation to become the largest and most trusted partner in direct to garment printing.
                            </li>
                            <li className="mb-2">
                                We're here to bring unmatched printing techniques from our own research and development team.
                            </li>
                            <li className="mb-2">
                                We have 5 locations across the US and 1 in Mexico that can fulfill any order at any time.
                            </li>
                            <li>
                                2 Day Ground shipping to anywhere in the US.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurStory;