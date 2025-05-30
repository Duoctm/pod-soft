import React from "react";
import Image from "next/image";
import Wrapper from "../wrapper";

const Process = ({ number, name }: { number: number | string; name: string }) => {
	return (
		<div className="flex items-center gap-x-3 md:gap-x-7">
			<div className="flex h-[60px] w-[60px] md:h-[100px] md:w-[100px] items-center justify-center rounded-xl bg-white text-3xl md:text-5xl font-semibold leading-[140%] text-[#8B3958]">
				{number}
			</div>
			<span className="text-xl md:text-[34px] font-semibold leading-[140%]">{name}</span>
		</div>
	);
};

const OurProcess = () => {
	return (
		<div className="bg-[#FFEDE9] py-6 lg:py-24">
			<Wrapper className="flex flex-col flex-1 lg:flex-row lg:items-center ">
				<div className="flex flex-1 flex-col ">
					<span className="space-x-[16%] text-xs md:text-[18px] font-semibold uppercase text-[#EF816B]">
						OUR PROCESS
					</span>
					<h3 className="w-full max-w-[720px] py-2 md:py-4 text-[42px] md:text-[50px] font-bold leading-[120%]">
						Your Guide to <br />
						Our Process
					</h3>
					<p className="max-w-[487px] md:py-4 text-sm md:text-base font-normal leading-6 text-[#909098]">
						A step-by-step guide to help you move from idea to finished product with ease and confidence.
					</p>
					<div className="flex flex-col gap-y-4 md:gap-y-11 pt-6 md:pt-12">
						<Process number="1" name="Pick your product" />
						<Process number="2" name="Design" />
						<Process number="3" name="Let's us do the rest!" />
					</div>
				</div>
				<div
					className="relative w-full max-w-[500px] mt-8 md:mt-0 rounded-md overflow-hidden"
				>
					<Image
						src="/images/image-box.jpg"
						alt="Our Process"
						width={800}
						height={400}
						loading="lazy"
						className="object-contain md:object-cover rounded-md  aspect-[9/16] md:aspect-square"
						sizes="(min-width: 768px) 100vw, 488px"
					/>
				</div>

			</Wrapper>
		</div>
	);
};

export default OurProcess;
