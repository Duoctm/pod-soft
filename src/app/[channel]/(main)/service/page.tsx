import Image from "next/image";

const ServicesPage = () => {
	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
			<div className="w-full pb-16">
				{/* Hero Section with Banner */}
				<div className="group relative mb-8 h-[50vh] w-full overflow-hidden shadow-lg sm:h-[60vh] md:mb-12 md:h-[70vh] md:shadow-xl lg:mb-16 lg:h-[90vh] lg:shadow-2xl">
					<Image
						src="/images/branding-slide-1.webp"
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
						<a
							href="#services"
							className="mt-4 inline-block rounded-full bg-[#FD8C6E] px-8 py-3 font-bold text-white shadow-lg transition-colors duration-300 hover:bg-[#8C3859]"
						>
							Explore Services
						</a>
					</div>
				</div>

				{/* Services Grid */}
				<div className="mx-auto max-w-[2000px] px-4">
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{services.map((service, _index) => (
							<div
								key={service.title}
								className="group overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl"
							>
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
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

const services = [
	{
		title: "Direct-To-Garment",
		image: "/images/dtg.webp",
		features: [
			"Top of the line Brother DL DTG machines",
			"No pretreatment stains",
			"Leading digital printing innovation",
		],
	},
	{
		title: "Silk Screening",
		image: "/images/screen.webp",
		features: [
			"Facility for any sized order",
			"High-end M&R 8 and 12 head machines",
			"Specialized in 500+ piece orders",
		],
	},
	{
		title: "Embroidery",
		image: "/images/embroidery.webp",
		features: [
			"Single headed machines for custom orders",
			"Dedicated quality embroidery staff",
			"Tajima machines with 15 thread colors",
		],
	},
	{
		title: "Hard Goods",
		image: "/images/sublimation.webp",
		features: ["Premium drinkware options", "Mimaki and Grando machines", "Professional finishing"],
	},
	{
		title: "Custom Boxes",
		image: "/images/branding-slide-1.webp",
		features: ["Eye-catching designs", "Perfect for executive kits", "Premium packaging solutions"],
	},
	{
		title: "Canvas Print",
		image: "/images/branding-slide-1.webp",
		features: ["Latex HP printers", "Vibrant colors", "Durable materials"],
	},
];

export default ServicesPage;
