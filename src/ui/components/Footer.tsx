import Image from "next/image";
import Wrapper from "./wrapper";
import Link from "next/link";

// Common styles for text elements
const textStyles = {
	base: "text-white text-[14px] md:text-[16px] font-[400] leading-[24px] md:leading-[26px]",
	heading: "text-[#FFFFFF] text-[18px] md:text-[20px] font-[700] leading-[140%]",
};

// Footer navigation data
const footerNavigation = [
	{
		title: "Company",
		links: [
			{ label: "Home", path: "/" },
			{ label: "Services", path: "/service" },
			{ label: "Order", path: "/products" },
			{ label: "Support", path: "/support" },
		],
	},
	// {
	//   title: "Resources",
	//   links: ["Gift Cards", "Design Tutorial", "How to - Blog", "Spotify Podcast"],
	// },
	// {
	//   title: "Help",
	//   links: [
	//     "Customer Support",
	//     "Delivery Details",
	//     "Terms & Conditions",
	//     "Privacy Policy",
	//   ],
	// },
];

interface FooterProps {
	channel: string;
}

const renderNavigationColumn = ({ links }: (typeof footerNavigation)[0], channel: string, title: string) => (
	<div className="flex w-full flex-col gap-[16px] md:gap-[24px]">
		<div className={textStyles.heading}>{title}</div>
		<div className="flex flex-row justify-between gap-[8px] md:gap-[10px]   ">
			{links.map((link, index) => (
				<Link key={index} className={textStyles.base} href={`/${channel}${link.path}`}>
					{link.label}
				</Link>
			))}
		</div>
	</div>
);

export async function Footer({ channel }: FooterProps) {
	return (
		<div className="flex flex-col bg-[#1C1C1C] py-8 md:py-16">
			<Wrapper className="flex flex-col items-start justify-between gap-8 lg:gap-32 md:flex-row md:items-end md:gap-0">
				<div className="flex w-full flex-col gap-y-5 md:w-auto flex-1">
					<Image src="/images/main-logo.png" alt="Logo" className="object-cover" width={200} height={100} />
					<p className="max-w-full text-[14px] font-[400] leading-[24px] tracking-[0%] text-white  md:text-[16px] md:leading-[26px]">
						Digital printing for the promotional product industry.
					</p>
				</div>
				<div className="md:w-aut flex w-full flex-1 flex-row items-center gap-8 md:gap-16">
					{footerNavigation.map((section, index) => (
						<div key={index} className="flex w-full">
							{renderNavigationColumn(section, channel, section.title)}
						</div>
					))}
				</div>
			</Wrapper>
			<hr className="my-4 border-t border-[#424255] md:my-6" />
			<div className="text-center text-xs text-[#F3F3FF] md:text-sm">
				© 2025 ZoomPrints. All rights reserved.
			</div>
		</div>
	);
}
