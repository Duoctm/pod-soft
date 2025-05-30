"use client";
import { Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "@/ui/components/wrapper";
import ClientRedirect from "@/components/ClientRedirect";

const ServicesPage = ({
	params,
}: {
	params: {
		channel: string;
	};
}) => {

	const ref = useRef<HTMLDivElement>(null);

	const handleScrollToExplore = () => {
		window.scrollTo({
			top: ref.current?.clientHeight,
			behavior: "smooth",
		});
	};

	return (
		<Suspense>
			<ClientRedirect channel={params.channel} />
			<div
				id="services"
				className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50"
			>
				<div className="w-full pb-16">
					{/* Hero Section with Banner */}
					<div
						ref={ref}
						className="group relative mb-8 h-[50vh] w-full overflow-hidden shadow-lg sm:h-[60vh] md:mb-12 md:h-[70vh] md:shadow-xl lg:mb-16 lg:h-[90vh] lg:shadow-2xl"
					>
						<Image
							src="/images/silk_screening.jpg"
							alt="Printing services banner"
							layout="fill"
							objectFit="cover"
							className="transform transition-all duration-700 ease-in-out group-hover:scale-110"
							priority
						/>
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1C1C1C]/30 px-4 transition-all duration-700 ease-in-out group-hover:bg-[#253244]/50 sm:px-6">
							<h1 className="mb-6 transform bg-gradient-to-r from-[#FD8C6E] via-[#F2766A] to-[#8C3859] bg-clip-text text-center text-4xl font-extrabold tracking-tight text-transparent transition-transform duration-500 ease-in-out group-hover:-translate-y-2 sm:text-5xl md:text-6xl lg:text-7xl">
								Services
							</h1>

							<p className="mx-auto mb-8 max-w-xl transform text-center text-base font-medium text-[#FD8C6E] transition-all duration-700 ease-in-out group-hover:translate-y-[-5px] sm:mb-12 sm:max-w-2xl sm:text-lg md:text-xl">
								Professional printing and customization services for all your needs
							</p>
							<div
								onClick={handleScrollToExplore}
								className="mt-4 inline-block rounded-full bg-[#FD8C6E] px-8 py-3 font-bold text-white shadow-lg transition-colors duration-300 hover:bg-[#8C3859]"
							>
								Explore Services
							</div>
						</div>
					</div>

					{/* Services Grid */}
					<Wrapper className="max-w-[1440px]">
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{services.map((service, _index) => (
								<div className="w-full" key={service.title}>
									{service.isActive ? (
										<Link
											id={service.id}
											href={`/${params.channel}/products`}
											className="relative"
										>
											<div className="group flex flex-1 flex-col overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl">
												<div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg">
													<Image
														src={service.image}
														alt={service.title}
														layout="fill"
														objectFit="cover"
														className="transform transition duration-500 group-hover:scale-110"
													/>
												</div>
												<h2 className="mb-4 text-2xl font-bold text-gray-900">{service.title}</h2>
												<ul className="space-y-3">
													{service.features.map((feature, i) => (
														<li key={i} className="flex items-start text-gray-600">
															<svg
																className="mr-3 h-6 w-6 flex-shrink-0 text-blue-500"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
															<span>{feature}</span>
														</li>
													))}
												</ul>
											</div>
										</Link>
									) : (
										<div className="relative">
											<div className="absolute right-8 top-8 z-10 rounded-full bg-yellow-300 px-3 py-1 text-sm font-semibold uppercase text-black">
												Coming Soon
											</div>
											<div className="pointer-events-none opacity-30 group flex flex-1 flex-col overflow-hidden rounded-xl bg-white p-6 shadow-lg">
												<div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg">
													<Image
														src={service.image}
														alt={service.title}
														layout="fill"
														objectFit="cover"
														className="transform transition duration-500"
													/>
												</div>
												<h2 className="mb-4 text-2xl font-bold text-gray-900">{service.title}</h2>
												<ul className="space-y-3">
													{service.features.map((feature, i) => (
														<li key={i} className="flex items-start text-gray-600">
															<svg
																className="mr-3 h-6 w-6 flex-shrink-0 text-blue-500"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
															<span>{feature}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</Wrapper>
				</div>
			</div>
		</Suspense>
	);
};

const services = [
	{
		id: "ss",
		title: "Silk Screening",
		image: "/images/silk_screening.jpg",
		features: [
			"Facility for any sized order",
			"High-end M&R 8 and 12 head machines",
			"Specialized in 500+ piece orders",
		],
		isActive: true,
	},
	{
		id: "dtg",
		title: "Direct-To-Garment",
		image: "/images/dtg.webp",
		features: [
			"Top of the line Brother DL DTG machines",
			"No pretreatment stains",
			"Leading digital printing innovation",
		],
		isActive: false,
	},
	{
		id: "embroidery",
		title: "Embroidery",
		image: "/images/embroidery.webp",
		features: [
			"Single headed machines for custom orders",
			"Dedicated quality embroidery staff",
			"Tajima machines with 15 thread colors",
		],
		isActive: false,
	},
	{
		id: "hard-goods",
		title: "Hard Goods",
		image: "/images/hard_goods.jpg",
		features: ["Premium drinkware options", "Mimaki and Grando machines", "Professional finishing"],
		isActive: false,
	},
	{
		id: "cb",
		title: "Custom Boxes",
		image: "/images/branding-slide-1.webp",
		features: ["Eye-catching designs", "Perfect for executive kits", "Premium packaging solutions"],
		isActive: false,
	},
	{
		id: "canvas-print",
		title: "Canvas Print",
		image: "/images/canvas.png",
		features: ["Latex HP printers", "Vibrant colors", "Durable materials"],
		isActive: false,
	},
];

export default ServicesPage;
