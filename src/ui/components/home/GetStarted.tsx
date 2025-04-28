import React from "react";
import Link from "next/link";

export const GetStarted: React.FC = () => {
	return (
		<div className="relative mx-auto flex w-full flex-col overflow-hidden bg-[#1C1C1C] shadow-xl md:flex-row">
			{/* Image container - full width on mobile, 60% on larger screens */}
			<div className="group relative h-72 w-full md:h-auto md:w-3/5">
				<img
					src="/images/t-shirt-background.jpg"
					alt="Ảnh minh họa áo thun"
					className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-[#253244] bg-opacity-20 transition-opacity duration-300 group-hover:bg-opacity-30" />
			</div>

			{/* Mobile version - visible only on small screens */}
			<div
				className="relative w-full bg-gradient-to-r from-[#253244] to-[#8C3859] md:hidden"
				style={{
					clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
				}}
			>
				<div className="flex h-full flex-col items-center justify-center p-8 text-white">
					<h3 className="relative mb-4 pb-2 text-center text-2xl font-bold sm:text-3xl">
						ZoomPrints
						<span className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 transform bg-[#FD8C6E]" />
					</h3>
					<p className="mb-8 text-center text-sm leading-relaxed text-gray-100 sm:text-base">
						Digital Priting For The Promotional Product Indistry
					</p>
					<Link
						href={"#"}
						className="inline-block transform rounded-lg bg-[#1C1C1C] px-8 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#253244] hover:shadow-xl"
					>
						Get Started
					</Link>
				</div>
			</div>

			{/* Desktop version - visible only on medium screens and up */}
			<div
				className="relative hidden bg-gradient-to-r from-[#253244] to-[#8C3859] md:absolute md:bottom-0 md:right-0 md:top-0 md:block md:w-1/2"
				style={{
					clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)",
				}}
			>
				<div className="relative flex h-full flex-col items-center justify-center p-12 text-white md:pl-16 lg:p-16">
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1C1C1C]/30 to-transparent" />
					<h3 className="relative mb-6 pb-3 text-center text-3xl font-bold md:text-4xl">
						ZoomPrints
						<span className="shadow-glow absolute bottom-0 left-1/2 h-1 w-32 -translate-x-1/2 transform rounded-full bg-[#FD8C6E]" />
					</h3>
					<p className="mb-10 max-w-xl text-center text-lg leading-relaxed text-gray-100 md:text-xl">
						Digital Priting For The Promotional Product Indistry
					</p>
					<Link
						href={"#"}
						className="group inline-flex transform items-center rounded-lg bg-[#1C1C1C] px-10 py-4 font-semibold text-white transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#253244] hover:shadow-2xl hover:shadow-[#FD8C6E]/20"
					>
						Get Started
						<svg
							className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default GetStarted;
