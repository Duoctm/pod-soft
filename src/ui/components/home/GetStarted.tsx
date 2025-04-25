import React from 'react';
import Link from "next/link";

export const GetStarted: React.FC = () => {
    return (
        <div className="w-full mx-auto bg-white shadow-lg overflow-hidden relative flex flex-col md:flex-row">
            {/* Image container - full width on mobile, 60% on larger screens */}
            <div className="w-full md:w-3/5 h-64 md:h-auto">
                <img 
                    src="/images/t-shirt-background.jpg"
                    alt="Ảnh minh họa áo thun"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Mobile version - visible only on small screens */}
            <div 
                className="relative w-full bg-purple-700 md:hidden"
                style={{ 
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" 
            }}
            >
                <div className="p-6 text-white h-full flex flex-col justify-center items-center">
                    <h3 className="text-xl sm:text-2xl font-bold border-b-2 border-blue-400 text-center pb-1 mb-4">
                        Curabitur dapibus ex condimentum
                    </h3>
                    <p className="text-sm sm:text-base mb-6 leading-relaxed text-center">
                        Lorem ipsum odor amet, consectetuer adipiscing elit. Purus in laoreet dignissim scelerisque rutrum.
                    </p>
                    <Link href={"#"} className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-md transition duration-300 ease-in-out shadow-md mx-auto underline">
                        Get Started
                    </Link>
                </div>
            </div>

            {/* Desktop version - visible only on medium screens and up */}
            <div 
                className="relative hidden md:block md:w-1/2 md:absolute md:top-0 md:bottom-0 md:right-0 bg-purple-700"
                style={{ 
                    clipPath: "polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)" 
            }}
            >
                <div className="p-10 lg:p-12 text-white h-full flex flex-col justify-center items-center md:pl-12">
                    <h3 className="text-2xl md:text-3xl font-bold border-b-2 border-blue-400 text-center pb-1 mb-4">
                    Curabitur dapibus ex condimentum
                    </h3>
                    <p className="text-base md:text-lg mb-6 leading-relaxed text-center">
                        Lorem ipsum odor amet, consectetuer adipiscing elit. Purus in laoreet dignissim scelerisque rutrum.
                    </p>
                    <Link href={"#"} className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-md transition duration-300 ease-in-out shadow-md mx-auto underline">
                    Get Started
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GetStarted;