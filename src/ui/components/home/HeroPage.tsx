import React from "react";
import Wrapper from "../wrapper";
import HeroFeature from "../HeroFeature";
import Image from "next/image";

const LeftSideHero = () => {
	return (
		<div className="flex flex-1 flex-col text-[#424255] md:px-4 lg:px-0">
			<span className="space-x-[16%] text-base md:text-lg font-semibold uppercase text-[#FD8C6F]">
				Printing Service Company
			</span>
			<h1 className="mt-4 md:mt-6 max-w-[582px] text-4xl md:text-6xl lg:text-7xl font-bold leading-[110%]">Welcome to ZoomPrints</h1>
			<span className="mt-4 md:mt-6 text-lg md:text-[22px] font-bold leading-[140%]">
				Bring Your Ideas to Life with High-Quality Prints
			</span>
			<p className="mt-4 md:mt-7 w-full max-w-[546px] text-base md:text-[20px] font-normal leading-[1.6]">
				Elementum consectetur at aliquet turpis ultricies felis egestas aliquam porta. Amet vitae.
			</p>

			<div className="mt-6 md:mt-9 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-7">
				<button className="w-full md:w-auto rounded-md bg-[#8B3958] px-8 md:px-14 py-3 md:py-4 text-base font-semibold text-white shadow-[0_9.67px_29.01px_rgba(253,140,111,0.25)]">
					Get Started
				</button>

				<button className="w-full md:w-auto rounded-md border-[1.21px] border-[#8B3958] px-8 md:px-14 py-3 md:py-4 text-base font-semibold text-[#8B3958]">
					Read More
				</button>
			</div>
		</div>
	);
};

const RatePanel = () => {
	return (
		<div className="relative flex h-[80px] md:h-[100px] w-[100px] md:w-[117px] flex-col items-center justify-center overflow-hidden rounded-md text-[#0E0E0E] shadow-md ml-4 md:ml-12 mt-8 md:mt-16 mb-[30px] md:mb-[50px]">
			<div className="absolute left-0 right-0 top-0 h-[6px] bg-[#8B3958]"></div>
			<p className="text-lg md:text-[20px] font-bold leading-[140%]">4.8 ⭐</p>
			<p className="text-xs md:text-sm font-normal">High-rated</p>
		</div>
	);
};

const FuncFact = () => {
	return (
		<div className="flex flex-col items-center justify-center mt-6 md:mt-8">
			<span className="text-3xl md:text-[42px] font-extrabold leading-[140%]">67 M+</span>
			<p className="text-sm md:text-base font-medium leading-[160%] text-[#868686]">Items Deliver</p>
		</div>
	);
};

const Label = () => {
	return (
		<div className="font-semibold text-sm md:text-base uppercase px-2 md:px-3 py-1 md:py-2 rounded-full bg-[#8B3958] text-white text-center absolute top-8 md:top-12 -left-16 md:-left-24">
            HQ PRODUCT
        </div>
	)
}

const RightSideHero = () => {
	return (
		<div className="flex flex-col md:flex-row flex-1 gap-4 md:gap-5 mt-8 md:mt-0">
			<div className="flex flex-1 flex-col">
				<RatePanel />
				<div className="relative flex w-full flex-col overflow-hidden rounded-xl bg-[#271E32] text-white">
					<Image src={"/images/line-bg.png"} alt="" className="absolute inset-0" fill />
					<div className="z-10 px-4 md:px-6 py-5 md:py-7">
						<div className="relative z-10 flex items-center justify-between">
							<span className="text-xs md:text-sm font-medium leading-[140%]">How It Works?</span>
							<Image src={"/play-icon.svg"} alt="" width={16} height={16} className="md:w-[20px] md:h-[20px]" />
						</div>
						<h4 className="relative z-10 flex w-full items-center justify-center text-2xl md:text-[32px] font-bold leading-[140%]">
							Wanna <br />
							Know How
							<br />
							We Work..
						</h4>
						<Image src={"/images/arrow.png"} height={1} width={100} alt="" className="z-10 mt-4 md:mt-6 w-full" />
					</div>
					<Image
						src={"/images/hero-right-side.png"}
						height={274}
						width={274}
						alt=""
						className="z-10 mt-2 w-full bg-cover bg-center bg-no-repeat"
					/>
				</div>
			</div>
			<div className="flex-1 flex-col relative">
                <Label/>
				<Image
					src={"/images/hero-right-side-2.png"}
					height={274}
					width={274}
					alt=""
					className="z-10 mt-2 w-full bg-cover bg-center bg-no-repeat"
				/>
                <FuncFact />
			</div>
		</div>
	);
};

const HeroPage = () => {
	return (
		<Wrapper className="flex flex-1 flex-col py-6 md:py-10 ">
			<div className="flex flex-col md:flex-row w-full">
				<LeftSideHero />
				<RightSideHero />
			</div>
			<HeroFeature />
		</Wrapper>
	);
};

export default HeroPage;
