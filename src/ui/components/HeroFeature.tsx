import { Award, ShieldCheck, ThumbsUp, Users } from "lucide-react";
import React from "react";

const FEATURES = [
	{
		icon: <ThumbsUp className="h-5 w-5 text-[#ED806B]" />,
		title: "Best Quality",
		subTitle: "High-quality products built to last.",
	},
	{
		icon: <ShieldCheck className="h-5 w-5 text-[#ED806B]" />,
		title: "Secure Payment",
		subTitle: "Safe and encrypted checkout process.",
	},
	{
		icon: <Users className="h-5 w-5 text-[#ED806B]" />,
		title: "Professional",
		subTitle: "Expert team with trusted experience.",
	},
	{
		icon: <Award className="h-5 w-5 text-[#ED806B]" />,
		title: "Competitive Pricing",
		subTitle: "Fair prices without compromising quality.",
	},
];


const HeroFeature = () => {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 mt-28">
			{FEATURES.map((feature, index) => (
				<div key={index} className="flex md:flex-row flex-col items-center text-center md:text-start gap-3 sm:gap-5 w-full sm:max-w-[263px] p-[1.5px]">
					<div className="w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] rounded-md bg-[#FFEDE9] flex items-center justify-center">
						{feature.icon}
					</div>
					<div className="flex items-center md:items-start flex-col flex-1 sm:w-[180px]">
						<h3 className="text-[17px] sm:text-lg font-bold text-[#212131] leading-[140%]">{feature.title}</h3>
						<p className="text-[13px] sm:text-sm font-normal leading-5 sm:leading-6">{feature.subTitle}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default HeroFeature;
