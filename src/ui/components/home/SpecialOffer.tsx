import Link from "next/link";
import Wrapper from "../wrapper";

export default function SpecialOffer() {
	return (
		<div className="w-full bg-[#263246] py-12 sm:py-[120px]">
			<Wrapper className="flex flex-col items-center justify-center px-4 sm:px-0">
				<h3 className="w-full max-w-[743px] text-center text-2xl font-bold leading-tight text-white sm:text-[32px] sm:leading-[71.25px] md:text-5xl lg:text-[56px]">
					Get <span className="text-[#FD8C6F]">Special Offer</span> For Today With ZoomPrints
				</h3>
				<span className="w-full py-3 text-center text-lg font-normal leading-[140%] text-[#BCBBC9] sm:py-4 sm:text-[14px]">
					See, Touch, and Feel the Excellence of ZoomPrints
				</span>
				<Link
					href="/default-channel/products"
					className="mt-8 cursor-pointer rounded-md border-none bg-[#FD8C6F] px-8 py-4 text-center text-sm font-semibold text-[#F3F3FF]  outline-none sm:mt-14 sm:px-12 sm:py-5 sm:text-[8px] md:text-sm"
				>
					Learn More
				</Link>
			</Wrapper>
		</div>
	);
}
