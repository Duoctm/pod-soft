import Wrapper from "../wrapper";

export default function SpecialOffer() {
	return (
		<div className="w-full bg-[#263246] py-12 sm:py-[120px]">
			<Wrapper className="flex flex-col items-center justify-center px-4 sm:px-0">
				<h3 className="w-full max-w-[743px] text-center text-2xl sm:text-[32px] md:text-5xl lg:text-[56px] font-bold leading-tight sm:leading-[71.25px] text-white">
					Get <span className="text-[#FD8C6F]">Special Offer</span> For Today With ZoomPrints
				</h3>
				<span className="w-full py-3 sm:py-4 text-center text-lg sm:text-[14px] font-normal leading-[140%] text-[#BCBBC9]">
					See, Touch, and Feel the Excellence of ZoomPrints
				</span>
				<button className="mt-8 sm:mt-14 cursor-pointer rounded-md border-none bg-[#FD8C6F] px-8 sm:px-12 py-4 sm:py-5 text-center  md:text-sm text-sm sm:text-[8px] font-semibold text-[#F3F3FF] outline-none">
					Learn More
				</button>
			</Wrapper>
		</div>
	);
}
