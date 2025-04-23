import Image from "next/image";
import React from "react";

const Printing = () => {
	return (
		<div className="bg-gray-iron-950 relative mx-auto flex w-full max-w-screen-2xl items-center justify-center py-[60px] md:py-[80px]">
			<div className="main-content z-[1] flex flex-col items-center gap-6 lg:h-screen xl:gap-10 2xl:gap-20">
				<div className="text-future aos-init aos-animate text-center text-xs  first: !leading-normal text-gray-600 md:text-xl lg:text-[32px] font-medium">
					Printing Technologies
				</div>
				<div className="aos-init aos-animate grid w-full grid-cols-1 grid-rows-2 gap-4 sm:grid-cols-2 md:h-[550px] md:grid-cols-10 lg:h-[600px] 2xl:md:h-[700px]">
					<div className="border-gray-iron-700 col-span-1 flex flex-col overflow-hidden border bg-[rgba(252,252,252,0.05)] md:col-span-3 md:col-start-1 md:row-span-2 md:row-start-1">
						<div className="relative w-full object-contain">
							<div style={{}} className="lazy-background relative h-full w-full">
								<Image
									alt="img"
									className="lazy-image h-full w-full object-cover"
									src="/images/dtg.webp"
									width={100}
									height={100}
								/>
								{/**/}
							</div>
						</div>

						<div className="flex w-full flex-col gap-2 p-2 2xl:gap-4 2xl:p-4">
							<div className="text-future text-sm  text-gray-600 font-medium 2xl:text-base">
								DTG Printing
							</div>
							<div className="text-ibm text-sm font-medium text-gray-500 2xl:text-base">
								We print intricate designs directly onto fabric with vibrant colors, perfect for small orders
								and detailed artwork.
							</div>
						</div>
					</div>

					<div className="border-gray-iron-700 col-span-1 flex flex-col-reverse justify-between overflow-hidden border bg-[rgba(252,252,252,0.05)] md:col-span-4 md:col-start-4 md:row-span-1 md:row-start-1">
						<div className="relative w-[180%] object-contain md:w-full">
							<div style={{}} className="lazy-background relative h-full w-full">
								<Image
									style={{}}
									alt="img"
									className="lazy-image h-full w-full object-cover"
									src="/images/dtf.webp"
									width={100}
									height={150}
								/>
								{/**/}
							</div>
						</div>
						<div className="flex w-full flex-col gap-2 p-2 2xl:gap-4 2xl:p-4">
							<div className="text-future text-sm  text-gray-600 font-medium 2xl:text-base">
								DTF Printing
							</div>
							<div className="text-ibm text-sm font-medium text-gray-500 2xl:text-base">
								Transferring designs onto various surfaces using heat, we ensure durable prints on textiles,
								plastics, and more.
							</div>
						</div>
					</div>

					<div className="border-gray-iron-700 col-span-1 flex flex-row overflow-hidden border bg-[rgba(252,252,252,0.05)] md:col-span-3 md:col-start-8 md:row-span-1 md:row-start-1">
						<div className="relative h-full object-contain">
							<div style={{}} className="lazy-background relative h-full w-full">
								<Image
									style={{}}
									alt="img"
									className="lazy-image h-full w-full object-cover"
									src="/images/uv.webp"
									width={100}
									height={150}
								/>
							</div>
						</div>
						<div className="flex w-[51%] flex-col gap-2 p-2 2xl:gap-4 2xl:p-4">
							<div className="text-future text-sm  text-gray-600 font-medium 2xl:text-base">UV LED</div>
							<div className="text-ibm text-sm font-medium text-gray-500 2xl:text-base">
								Rapidly curing ink with UV light, we produce sharp and vibrant prints on materials like
								plastic and metal, perfect for signage and promotional items.
							</div>
						</div>
					</div>

					<div className="border-gray-iron-700 col-span-1 flex flex-row-reverse overflow-hidden border bg-[rgba(252,252,252,0.05)] md:col-span-3 md:row-span-1">
						<div className="relative h-full object-contain">
							<div style={{}} className="lazy-background relative h-full w-full">
								<Image
									style={{}}
									alt="img"
									className="lazy-image h-full w-full object-cover"
									src="/images/screen.webp"
									width={80}
									height={300}
								/>
								{/**/}
							</div>
						</div>
						<div className="flex basis-3/5 flex-col gap-2 p-2 2xl:gap-4 2xl:p-4">
							<div className="text-future text-sm  text-gray-600 font-medium 2xl:text-base">
								Screen Printing
							</div>
							<div className="text-ibm text-sm font-medium text-gray-500 2xl:text-base">
								With ink pushed through a stencil onto the printing surface, we deliver bold and durable
								prints, ideal for large orders.
							</div>
						</div>
					</div>

					<div className="border-gray-iron-700 col-span-1 flex flex-col overflow-hidden border bg-[rgba(252,252,252,0.05)] md:col-span-2 md:row-span-1">
						<div className="relative w-full object-contain">
							<div style={{}} className="lazy-background relative h-full w-full">
								<Image
									style={{}}
									alt="img"
									className="lazy-image h-full w-full object-cover"
									src="/images/sublimation.webp"
									width={300}
									height={80}
								/>
								{/**/}
							</div>
						</div>
						<div className="flex w-full flex-col gap-2 p-2 2xl:gap-4 2xl:p-4">
							<div className="text-future text-sm  text-gray-600 font-medium 2xl:text-base">
								Sublimation Printing
							</div>
							<div className="text-ibm text-sm font-medium text-gray-500 2xl:text-base">
								Heat-transfer dye onto polyester fabric for vivid and long-lasting designs, offering a wide
								range of colors and durability.
							</div>
						</div>
					</div>

					<div className="border-gray-iron-700 col-span-1 flex flex-col-reverse overflow-hidden border bg-[rgba(252,252,252,0.05)] md:col-span-2 md:row-span-1">
						<div className="relative w-full object-contain">
							<div style={{}} className="lazy-background relative h-full w-full">
								<Image
									style={{}}
									alt="img"
									className="lazy-image h-full w-full object-cover"
									src="/images/embroidery.webp"
									width={300}
									height={80}
								/>
								{/**/}
							</div>
						</div>
						<div className="flex w-full flex-col gap-2 p-2 2xl:gap-4 2xl:p-4">
							<div className="text-future text-sm  text-gray-600 font-medium 2xl:text-base">Embroidery</div>
							<div className="text-ibm text-sm font-medium text-gray-500 2xl:text-base">
								Elevating designs with stitched logos or artwork, our embroidery service adds a classy touch
								to garments and textiles.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Printing;
