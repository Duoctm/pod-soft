import { Award, ShieldCheck, ThumbsUp, Users } from "lucide-react";
import React from "react";

const FEATURES = [
	{
		icon: <ThumbsUp className="h-5 w-5 text-[#ED806B]" />,
		title: "Best Quality",
		subTitle: "Elementum consectetur at aliquet turpis.",
	},
	{
		icon: <ShieldCheck className="h-5 w-5 text-[#ED806B]" />,
		title: "Secure Payment",
		subTitle: "Elementum consectetur at aliquet turpis.",
	},
	{
		icon: <Users className="h-5 w-5 text-[#ED806B]" />,
		title: "Professional",
		subTitle: "Elementum consectetur at aliquet turpis.",
	},
	{
		icon: <Award className="h-5 w-5 text-[#ED806B]" />,
		title: "Competitive Pricing",
		subTitle: "Elementum consectetur at aliquet turpis.",
	},
];

const HeroFeature = () => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-28">
			{FEATURES.map((feature, index) => (
				<div key={index} className="flex items-start gap-3 sm:gap-5 w-full sm:max-w-[263px] p-[1.5px]">
					<div className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] rounded-md bg-[#FFEDE9] flex items-center justify-center">
						{feature.icon}
					</div>
					<div className="flex items-start flex-col flex-1 sm:w-[180px]">
						<h3 className="text-base sm:text-lg font-bold text-[#212131] leading-[140%]">{feature.title}</h3>
						<p className="text-xs sm:text-sm font-normal leading-5 sm:leading-6">{feature.subTitle}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default HeroFeature;
