import React from "react";
import Wrapper from "../wrapper";
import Image from "next/image";

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
		<div className="bg-[#FFEDE9] py-12 md:py-24">
			<Wrapper className="flex flex-col md:flex-row items-center">
				<div className="flex flex-1 flex-col px-4 md:px-0">
					<span className="space-x-[16%] text-base md:text-[18px] font-semibold uppercase text-[#EF816B]">
						OUR PROCESS
					</span>
					<h3 className="w-full max-w-[720px] py-2 md:py-4 text-3xl md:text-[50px] font-bold leading-[120%]">
						Your Guide to <br />
						Our Process
					</h3>
					<p className="max-w-[487px] py-2 md:py-4 text-sm md:text-base font-normal leading-6 text-[#909098]">
						Netus feugiat vitae enim enim in viverra. Id at sagittis cras pretium dictum nec netus. Ante dolor
						quis convallis.
					</p>
					<div className="flex flex-col gap-y-6 md:gap-y-11 pt-6 md:pt-12">
						<Process number="1" name="Pick your product" />
						<Process number="2" name="Design" />
						<Process number="3" name="Let's us do the rest!" />
					</div>
				</div>
				<div className="flex flex-1 items-center justify-end mt-8 md:mt-0">
					<Image
						src="/images/image-box.png"
						width={488}
						height={562}
						alt="Our Process"
						className="w-full max-w-[300px] md:max-w-[488px]"
					/>
				</div>
			</Wrapper>
		</div>
	);
};

export default OurProcess;
