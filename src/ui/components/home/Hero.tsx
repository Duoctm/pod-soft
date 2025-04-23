import Image from "next/image";
import Link from "next/link";
import React from "react";

const Hero = () => {
	return (
		<section className="w-full bg-white text-gray-600 h-screen flex items-center">
			<div className="mx-auto flex w-full max-w-[1600px] px-6 lg:px-20 items-center justify-between gap-10 flex-col md:flex-row">
				
				{/* Left content */}
				<div className="flex flex-col gap-6 max-w-xl w-full">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
						E-commerce Made Easy
					</h1>
					<p className="text-lg sm:text-xl lg:text-2xl text-gray-600">
						SwiftPOD is your gateway to rapid fast fulfillment minus the steep investment.
					</p>

					<div className="mt-6 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
						<Link href="/">
							<button className="uppercase w-full sm:w-auto rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold bg-transparent hover:bg-gray-100 text-gray-800 transition">
								View Catalogs
							</button>
						</Link>
						<Link href="/">
							<button className="uppercase w-full sm:w-auto rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold bg-transparent hover:bg-gray-100 text-gray-800 transition">
								Our Services
							</button>
						</Link>
					</div>
				</div>

				{/* Right image */}
				<div className="flex justify-center items-center w-full max-w-[700px]">
					<Image
						src="/images/intro3.webp"
						alt="Hero visual"
						width={700}
						height={500}
						className="rounded-xl object-contain w-full h-auto"
						priority
					/>
				</div>
			</div>
		</section>
	);
};

export default Hero;
