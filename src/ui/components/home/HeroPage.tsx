import React from "react";
import Image from "next/image";
import Wrapper from "../wrapper";
import HeroFeature from "../HeroFeature";

const LeftSideHero = () => {
	return (
		<div className="flex flex-1 flex-col text-[#424255] md:px-4 lg:px-0 items-stretch h-full min-h-[100px]">
			<h1 className="max-w-[582px] text-4xl font-bold leading-[110%] md:mt-6 md:text-6xl lg:text-7xl">
				Welcome to ZoomPrints
			</h1>
			<span className="mt-4 text-[14px] w-full font-bold leading-[140%] md:mt-6 md:text-[32px]">
				Digital printing for the promotional product industry.
			</span>
		</div>
	);
};

// const RatePanel = () => {

const RightSideHero = () => {
	return (
		<div className="relative w-full max-w-[588px] aspect-[2/3] md:aspect-[588/431] rounded-xl overflow-hidden lg:mt-0">
			<Image
				src="/images/promotion.webp"
				alt="DTG machine image"
				fill
				priority
				className="object-cover rounded-xl hidden md:block"
				quality={75}
				sizes="(max-width: 768px) 100vw, 588px"
			/>

			<Image
				src="/images/promotion-mobile.webp"
				alt="DTG machine image"
				fill
				priority
				className="object-cover rounded-xl md:hidden block"
				quality={75}
				sizes="(max-width: 768px) 100vw, 588px"
			/>
		</div>
	);
};

const HeroPage = () => {
	return (
		<Wrapper className="flex flex-1 flex-col lg:py-10 min-h-[calc(100vh-142px)] py-6 justify-center">
			<div className="flex w-full flex-col lg:flex-row items-stretch h-full">
				<div className="flex-[1_1_50%]">
					<LeftSideHero />
				</div>
				<div className="flex-[1_1_50%] flex justify-start lg:justify-end mt-4 md:mt-0">
					<RightSideHero />
				</div>
			</div>
			<HeroFeature />
		</Wrapper>
	);
};

// eslint-disable-next-line import/no-default-export
export default HeroPage;
