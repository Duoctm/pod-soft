import Image from "next/image";
import React from "react";

const logos = [
  "wb.png",
  "sega.png",
  "hbo.png",
  "century.png",
  "paramount.png",
  "metro.png",
  "nbcu.png",
  "cn.png",
  "dc.png",
  "blum.png",
  "sony.png",
  "more.png",
];

const Trusted = () => {
  return (
    <div className="bg-gray-iron-950 relative flex w-full items-center justify-center px-4 py-[60px]">
      <div className="z-[1] flex max-w-[1000px] flex-col items-center gap-20 w-full">
        {/* Heading */}
        <div className="aos-init aos-animate relative flex w-full flex-col items-center">
          <Image
            src="/images/trust-background.webp"
            alt="Trusted background"
            width={900}
            height={500}
          />
          <span className="text-future text-xs md:text-2xl lg:text-[32px] font-medium text-gray-600 whitespace-nowrap">
            Trusted by
          </span>
        </div>

        {/* Logo Grid */}
        <div className="aos-init aos-animate grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex h-[112px] cursor-pointer items-center justify-center transition-transform duration-300 hover:scale-110"
            >
              <div className="relative h-full w-full">
                <Image
                  src={`https://d1dif2dtw17xb9.cloudfront.net/public/${logo}`}
                  alt={logo.split(".")[0]}
                  width={100}
                  height={100}
                  className="object-contain h-full w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trusted;
