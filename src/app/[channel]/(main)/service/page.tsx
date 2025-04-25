// import CatalogSection from "@/ui/components/service/CatalogSection";
// import ServiceCard from "@/ui/components/service/ServiceCard";
// import Image from "next/image";
// import React from "react";

import Image from "next/image";

const ServicesPage = () => {
	return (
		<div className="mx-auto min-h-screen w-full py-12">
			<h1 className="mb-10 text-center text-4xl font-bold text-gray-800">SwiftWear Services</h1>
			<div className="relative mb-10 h-[60vh] w-full">
				<Image
					src="/images/dtf.webp"
					alt="Printing services banner"
					layout="fill"
					objectFit="cover"
					className="bg-center "
					priority
				/>
			</div>
			<div className="mb-6 grid gap-8 md:grid-cols-2 max-w-screen-2xl mx-auto px-4">
				<div className="flex flex-col items-start rounded-lg bg-gray-100 p-6 md:flex-row">
					<div className="flex-1">
						<h2 className="mb-4 text-2xl font-semibold text-gray-800">Direct-To-Garment</h2>
						<ul className="space-y-3">
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>
									We run hundreds of top of the line Brother DL DTG machines that ensures prints are crisp,
									true, and fast.
								</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>No pretreatment stains.</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>At the fore front of researching ways to making digital printing better.</span>
							</li>
						</ul>
					</div>
					<div className="mt-4 flex-shrink-0 md:ml-6 md:mt-0">
						<div className="relative h-32 w-32">
							<Image
								src="/images/dtg.webp"
								alt="Direct-To-Garment printing"
								layout="fill"
								objectFit="cover"
								className="rounded"
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-start rounded-lg bg-gray-100 p-6 md:flex-row">
					<div className="flex-1">
						<h2 className="mb-4 text-2xl font-semibold text-gray-800">Silk Screening</h2>
						<ul className="space-y-3">
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>We have a facility that will handle any sized order.</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>Our factory runs several high end M&R 8 and 12 head machines.</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>This shop is dedicated to high volume printing. 500 pcs and higher.</span>
							</li>
						</ul>
					</div>
					<div className="mt-4 flex-shrink-0 md:ml-6 md:mt-0">
						<div className="relative h-32 w-32">
							<Image
								src="/images/screen.webp"
								alt="Silk Screening"
								layout="fill"
								objectFit="cover"
								className="rounded"
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-start rounded-lg bg-gray-100 p-6 md:flex-row">
					<div className="flex-1">
						<h2 className="mb-4 text-2xl font-semibold text-gray-800">Embroidery</h2>
						<ul className="space-y-3">
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>
									Looking for one-off orders? We have plenty of single headed machines and a dedicated staff
									to quality embroidery for your clients.
								</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>Tajima (currently limited to 15 thread colors but we are looking to expand)</span>
							</li>
						</ul>
					</div>
					<div className="mt-4 flex-shrink-0 md:ml-6 md:mt-0">
						<div className="relative h-32 w-32">
							<Image
								src="/images/embroidery.webp"
								alt="Embroidery service"
								layout="fill"
								objectFit="cover"
								className="rounded"
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-start rounded-lg bg-gray-100 p-6 md:flex-row">
					<div className="flex-1">
						<h2 className="mb-4 text-2xl font-semibold text-gray-800">Hard Goods</h2>
						<ul className="space-y-3">
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>Check out our drinkware options</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>We use Mimaki and Grando machines</span>
							</li>
						</ul>
					</div>
					<div className="mt-4 flex-shrink-0 md:ml-6 md:mt-0">
						<div className="relative h-32 w-32">
							<Image
								src="/images/sublimation.webp"
								alt="Hard Goods"
								layout="fill"
								objectFit="cover"
								className="rounded"
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-start rounded-lg bg-gray-100 p-6 md:flex-row">
					<div className="flex-1">
						<h2 className="mb-4 text-2xl font-semibold text-gray-800">Custom Boxes</h2>
						<ul className="space-y-3">
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>Work with our creative team to make some eye grabbing boxes.</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>Perfect for kits going to executives, sponsors, influencers.</span>
							</li>
						</ul>
					</div>
					<div className="mt-4 flex-shrink-0 md:ml-6 md:mt-0">
						<div className="relative h-32 w-32">
							<Image
								src="/images/branding-slide-1.webp"
								alt="Custom Boxes"
								layout="fill"
								objectFit="cover"
								className="rounded"
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-start rounded-lg bg-gray-100 p-6 md:flex-row">
					<div className="flex-1">
						<h2 className="mb-4 text-2xl font-semibold text-gray-800">Canvas Print</h2>
						<ul className="space-y-3">
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>We print with Latex HP printers</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 mt-1 text-gray-600">•</span>
								<span>Ensuring durability and vibrant colors for your canvas artwork</span>
							</li>
						</ul>
					</div>
					<div className="mt-4 flex-shrink-0 md:ml-6 md:mt-0">
						<div className="relative h-32 w-32">
							<Image
								src="/images/branding-slide-1.webp"
								alt="Canvas Print"
								layout="fill"
								objectFit="cover"
								className="rounded"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ServicesPage;
