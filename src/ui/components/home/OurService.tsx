import React from "react";
import Wrapper from "../wrapper";
import { Printer, User, Image, Layout, FileText, Package } from "lucide-react";

const SERVICES = [
	{
		icon: <Printer />,
		title: "Digital Print",
		description:
			"Mi donec risus commodo auctor phasellus adipiscing. Faucibus magna cursus sed sodales amet. Nunc.",
	},
	{
		icon: <User />,
		title: "Shirt Print",
		description:
			"Mi donec risus commodo auctor phasellus adipiscing. Faucibus magna cursus sed sodales amet. Nunc.",
	},
	{
		icon: <Image />,
		title: "Photo Print",
		description:
			"Mi donec risus commodo auctor phasellus adipiscing. Faucibus magna cursus sed sodales amet. Nunc.",
	},
	{
		icon: <Layout />,
		title: "Stationery Print",
		description:
			"Mi donec risus commodo auctor phasellus adipiscing. Faucibus magna cursus sed sodales amet. Nunc.",
	},
	{
		icon: <FileText />,
		title: "Document Print",
		description:
			"Mi donec risus commodo auctor phasellus adipiscing. Faucibus magna cursus sed sodales amet. Nunc.",
	},
	{
		icon: <Package />,
		title: "Packaging Print",
		description:
			"Mi donec risus commodo auctor phasellus adipiscing. Faucibus magna cursus sed sodales amet. Nunc.",
	},
];

interface ServiceCardProps {
	icon: React.JSX.Element;
	title: string;
	description: string;
}

function ServiceCard({ icon, title, description }: ServiceCardProps) {
	return (
		<div className="rounded-xl bg-[#F9F8FC] p-4 md:p-6 shadow-sm transition-all hover:shadow-md">
			<div className="mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-md bg-white text-[#8B3958]">
				{icon}
			</div>
			<h3 className="mb-2 text-base md:text-lg font-semibold text-gray-900">{title}</h3>
			<p className="mb-3 md:mb-4 text-xs md:text-sm text-gray-500">{description}</p>
			<a href="#" className="group flex items-center gap-1 text-xs md:text-sm font-semibold text-[#FD8C6F]">
				Learn More
				<span className="transform transition-transform group-hover:translate-x-1">→</span>
			</a>
		</div>
	);
}

const OurService = () => {
	return (
		<Wrapper className="flex flex-col items-center justify-center py-12 md:py-24">
			<div className="flex w-full max-w-[544px] flex-col text-center px-4 md:px-0">
				<span className="space-x-[16%] text-base md:text-[18px] font-semibold uppercase text-[#EF816B]">Our Services</span>
				<h3 className="w-full max-w-[720px] py-2 md:py-4 text-3xl md:text-[50px] font-bold leading-[120%]">
					Printing Solutions for All Your Needs
				</h3>
				<p className="max-w-[487px] py-2 md:py-4 text-sm md:text-base font-normal leading-6 text-[#909098]">
					Netus feugiat vitae enim enim in viverra. Id at sagittis cras pretium dictum nec netus. Ante dolor
					quis convallis.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-x-28 md:gap-y-[65px] px-4 md:px-0">
				{SERVICES.map((s, i) => (
					<ServiceCard key={i} icon={s.icon} title={s.title} description={s.description} />
				))}
			</div>
		</Wrapper>
	);
};

export default OurService;
