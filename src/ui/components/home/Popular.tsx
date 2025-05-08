import Image from "next/image";

interface PopularyType {
	off: number;
	image: string;
	name: string;
}

const populars: PopularyType[] = [
	{
		off: 0,
		name: "T-shirts",
		image: "/images/unrecognizable-person-working-iron-sublimation-printing-concept-graphic-design.png",
	},
	{
		off: 0,
		name: "Mugs",
		image: "/images/mugs.webp",
	},
	{
		off: 0,
		name: "Fleece",
		image: "/images/fleece.webp",
	},
	{
		off: 0,
		name: "Stickers",
		image: "/images/image.png",
	},
];

const Popular = () => {
	return (
		<div className="w-full bg-[#FFFFFF] px-6 py-[80px]">
			<div className="relative mx-auto w-full max-w-[1200px]">
				{/* Heading and Button */}
				<div className="mb-[60px] flex flex-col gap-[16px] md:flex-row md:items-center md:justify-between">
					<div className="flex flex-col gap-[16px]">
						<div className="text-[18px] font-semibold uppercase leading-[100%] tracking-[0.16em] text-[#EF816B]">
							POPULAR PRODUCTS
						</div>

						<div className="max-w-[484px] text-[36px] font-bold leading-[120%] text-[#212131] md:text-[50px]">
							ZoomPrints Picks
						</div>
					</div>

					<button className="flex h-[49px] w-[183px] items-center justify-center gap-[10px] rounded-[8px] bg-[#8B3958] px-[38px] py-[20px] shadow-[0px_8px_24px_0px_#FD8C6F40]">
						<div className="text-center text-[14px] font-semibold leading-[100%] text-[#F3F3FF]">See All</div>
					</button>
				</div>

				{/* Popular Items */}
				<div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 md:grid-cols-4">
					{populars.map((item, index) => (
						<div key={index} className="flex w-full flex-col gap-[24.4px]">
							{/* Image + Tag */}
							<div className="relative h-[213.5px] w-full overflow-hidden rounded-[10.17px] bg-[#FAF7F7]">
								<Image src={item.image} alt={item.name} fill className="rounded-[10.17px] object-cover" />
								{item.off > 0 && (
									<div className="absolute left-[20px] top-[20.33px] flex h-[31.33px] min-w-[80.33px] items-center justify-center rounded-[4.07px] bg-[#FD8C6F] px-[10.17px] py-[5px]">
										<span className="whitespace-nowrap text-[16.27px] font-bold leading-[100%] text-white">
											{item.off}% off
										</span>
									</div>
								)}
							</div>

							{/* Text + Arrow */}
							<div className="flex items-center gap-[12.2px]">
								<div className="text-[16px] font-bold leading-[100%] text-[#FD8C6F]">{item.name}</div>

								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="44.73"
									height="11"
									viewBox="0 0 44.73 11"
									fill="none"
								>
									<path
										d="M0 5.5H42 M42 5.5L38 1 M42 5.5L38 10"
										stroke="#FD8C6F"
										strokeWidth="1.02"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default Popular;
