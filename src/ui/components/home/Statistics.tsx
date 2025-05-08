import Image from "next/image";
export default function Statistics() {
	interface StaticsType {
		number: string;
		description: string;
	}

  const staticses: StaticsType[] = [
    { number: "15+", description: "Years of Experience" },
    { number: "98%", description: "Satisfaction Rate" },
    { number: "50+", description: "Diverse Product" },
  { number: "10K", description: "Printing Capacity" },
];

	return (
		<div className="w-full bg-[#FFEDE9]">
			<div className="mx-auto max-w-[1200px] px-4 py-12">
				{/* Section Title */}
				<div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
					<div className="w-full md:w-1/2">
						<div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#EF816B] md:text-[18px]">
							Statistic
						</div>
						<div className="text-3xl font-bold leading-[120%] text-[#212131] md:text-[50px]">
							ZoomPrints in Number
						</div>
					</div>
					<div className="w-full md:w-1/2">
						<p className="text-left text-sm leading-[26px] text-[#868686] md:text-right md:text-[16px]">
						From happy clients to fast turnarounds, these numbers show how ZoomPrints delivers on its promise every day.
						</p>
					</div>
				</div>

				{/* Image and Stats */}
				<div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
					{/* Image */}
					<div className="w-full lg:w-1/2">
						<Image
							src="/images/modern-photo-studio-displaying-photography-prints-with-large-format-printer.png"
							alt="Modern photo studio displaying photography prints"
							className="h-[300px] w-full rounded-[16px] object-cover sm:h-[400px] md:h-[500px] lg:h-[745px]"
							width={745}
							height={745}
						/>
					</div>

					{/* Statistics Grid */}
					<div className="relative w-full lg:w-1/2">
						{/* Grid Lines */}
						<div className="absolute inset-0 hidden md:block">
							<div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 transform border-l border-[#868686] opacity-50"></div>
							<div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transform border-t border-[#868686] opacity-50"></div>
						</div>

						{/* Items */}
						<div className="grid grid-cols-2 gap-x-6 gap-y-8 p-4 sm:grid-cols-2 sm:p-6 md:p-8">
							{staticses.map(({ number, description }, i) => (
								<div key={i} className="flex flex-col items-start gap-2">
									<div className="text-[48px] font-semibold leading-[120%] text-[#271E32] sm:text-[60px] md:text-[82px]">
										{number}
									</div>
									<div className="h-1.5 w-16 rounded-full bg-[#8B3958]"></div>
									<div className="text-base font-semibold leading-[140%] text-[#868686] sm:text-lg md:text-[20px]">
										{description}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
