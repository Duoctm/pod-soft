import React from "react";
import Image from "next/image";
import Wrapper from "../wrapper";
import HeroFeature from "../HeroFeature";

const LeftSideHero = () => {
	return (
		<div className="flex flex-1 flex-col text-[#424255] md:px-4 lg:px-0">
			<h1 className="max-w-[582px] text-4xl font-bold leading-[110%] md:mt-6 md:text-6xl lg:text-7xl">
				Welcome to ZoomPrints
			</h1>
			<span className="mt-4 text-lg w-full font-bold leading-[140%] md:mt-6 md:text-[32px]">
				Digital printing for the promotional product industry.
			</span>
			{/* <p className="mt-4 w-full max-w-[546px] text-base font-normal leading-[1.6] md:mt-7 md:text-[20px]">
				Bring Your Ideas to Life with High-Quality Prints
			</p> */}

			{/* <div className="mt-6 flex flex-row items-center gap-4">
				<Link
					href={"/default-channel/products"}
					className="rounded-md bg-[#8B3958] px-8 py-3 text-base font-semibold text-white shadow-[0_9.67px_29.01px_rgba(253,140,111,0.25)] transition-colors hover:bg-white hover:text-[#8B3958] hover:border hover:border-[#8B3958] hover:shadow-none "
				>
					Get Started
				</Link>

				<Link
					href={"/default-channel/service"}
					className="rounded-md border border-[#8B3958] px-8 py-3 text-base font-semibold text-[#8B3958] transition-colors hover:bg-[#8B3958] hover:text-white"
				>
					Read More
				</Link>
			</div> */}
		</div>
	);
};

// const RatePanel = () => {
// 	return (
// 		<div className="relative flex h-[80px] md:h-[100px] w-[100px] md:w-[117px] flex-col items-center justify-center overflow-hidden rounded-md text-[#0E0E0E] shadow-md ml-4 md:ml-12 mt-8 md:mt-16 mb-[30px] md:mb-[50px]">
// 			<div className="absolute left-0 right-0 top-0 h-[6px] bg-[#8B3958]"></div>
// 			{/* <p className="text-lg md:text-[20px] font-bold leading-[140%]">4.8 ⭐</p> */}
// 			{/* <p className="text-xs md:text-sm font-normal">High-rated</p> */}
// 		</div>
// 	);
// };

// const FuncFact = () => {
// 	return (
// 		<div className="flex flex-col items-center justify-center mt-6 md:mt-8">
// 			<span className="text-3xl md:text-[42px] font-extrabold leading-[140%]">67 M+</span>
// 			<p className="text-sm md:text-base font-medium leading-[160%] text-[#868686]">Items Deliver</p>
// 		</div>
// 	);
// };

// const Label = () => {
// 	return (
// 		<div className="absolute -left-16 top-8 rounded-full bg-[#8B3958] px-2 py-1 text-center text-sm font-semibold uppercase text-white md:-left-24 md:top-12 md:px-3 md:py-2 md:text-base">
// 			HQ PRODUCT
// 		</div>
// 	);
// };

const RightSideHero = () => {
	return (
		<div className="mt-4 flex flex-1 flex-row gap-4 md:mt-0 md:gap-5">
			<div className="relative flex-1 flex-col">
				{/* <Label /> */}
				<Image
					src={"/images/dtg.webp"}
					height={274}
					width={274}
					priority
					alt=""
					className="z-10 mt-2 w-full bg-cover bg-center bg-no-repeat rounded-xl"
				/>
				{/* <FuncFact /> */}
			</div>
		</div>
	);
};

const HeroPage = () => {
	return (
		<Wrapper className="flex flex-1 flex-col md:py-10 min-h-[calc(100vh-142px)] py-6">
			<div className="flex w-full flex-col lg:flex-row">
				<LeftSideHero />
				<RightSideHero />
			</div>
			<HeroFeature />
		</Wrapper>
	);
};

export default HeroPage;
