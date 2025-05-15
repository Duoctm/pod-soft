import React from "react";
import { Printer, User, Image, Layout, FileText, Package } from "lucide-react";
import Link from "next/link";
import Wrapper from "../wrapper";

const SERVICES = [
	{
		icon: <Printer />,
		title: "Direct-To-Garment",
		description:
			"Top of the line Brother DL DTG machines. No pretreatment stains. Leading digital printing innovation.",
		link: "/default-channel/service",
	},
	{
		icon: <User />,
		title: "Silk Screening",
		description:
			"Facility for any sized order. High-end M&R 8 and 12 head machines. Specialized in 500+ piece orders.",
		link: "/default-channel/service",
	},
	// {
	// 	icon: <Layout />,
	// 	title: "Hard Goods",
	// 	description: "Premium drinkware options. Mimaki and Grando machines. Professional finishing.",
	// 	link: "/default-channel/service",
	// },
	{
		icon: <FileText />,
		title: "Custom Boxes",
		description: "Eye-catching designs. Perfect for executive kits. Premium packaging solutions.",
		link: "/default-channel/service",
	},
	// {
	// 	icon: <Image />,
	// 	title: "Embroidery",
	// 	description:
	// 		"Single headed machines for custom orders. Dedicated quality embroidery staff. Tajima machines with 15 thread colors.",
	// 	link: "/default-channel/service",
	// },
	// {
	// 	icon: <FileText />,
	// 	title: "Custom Boxes",
	// 	description: "Eye-catching designs. Perfect for executive kits. Premium packaging solutions.",
	// 	link: "/default-channel/service",
	// },
	// {
	// 	icon: <Package />,
	// 	title: "Canvas Print",
	// 	description: "Latex HP printers. Vibrant colors. Durable materials.",
	// 	link: "/default-channel/service",
	// },
];

interface ServiceCardProps {
	icon: React.JSX.Element;
	title: string;
	description: string;
	link: string;
}

function ServiceCard({ icon, title, description, link }: ServiceCardProps) {
	return (
		<div className="rounded-xl bg-[#F9F8FC] p-4 md:p-6 shadow-sm transition-all hover:shadow-md">
			<div className="mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-md bg-white text-[#8B3958]">
				{icon}
			</div>
			<h3 className="mb-2 text-base md:text-lg font-semibold text-gray-900">{title}</h3>
			<p className="mb-3 md:mb-4 text-xs md:text-sm text-gray-500">{description}</p>
			<Link href={link} className="group flex items-center gap-1 text-xs md:text-sm font-semibold text-[#FD8C6F]">
				Learn More
				<span className="transform transition-transform group-hover:translate-x-1">→</span>
			</Link>
		</div>
	);
}

const OurService = () => {
	return (
		<Wrapper className="flex flex-col items-center justify-center py-12 md:py-24">
			<div className="flex w-full max-w-[544px] flex-col text-center">
				<span className="space-x-[16%] text-xs md:text-[18px] font-semibold uppercase text-[#EF816B]">Our Services</span>
				<h3 className="w-full max-w-[720px] md:py-4 text-[40px] md:text-[50px] font-bold leading-[110%] md:leading-[120%]">
					Printing Solutions for All Your Needs
				</h3>
				{/* <p className="max-w-[487px] py-2 md:py-4 text-sm md:text-base font-normal leading-6 text-[#909098]">
					Netus feugiat vitae enim enim in viverra. Id at sagittis cras pretium dictum nec netus. Ante dolor
					quis convallis.
				</p> */}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-x-28 md:gap-y-[65px]">
				{SERVICES.map((s, i) => (
					<ServiceCard key={i} icon={s.icon} title={s.title} description={s.description} link={s.link} />
				))}
			</div>
		</Wrapper>
	);
};

export default OurService;
