import React from "react";
import Image from "next/image";
import { Tag } from "lucide-react";

interface CatalogSectionProps {
	title: string;
	description: string;
	buttonText: string;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({ title, description, buttonText }) => {
	return (
		<div className="w-full overflow-hidden rounded-xl bg-black text-white">
			<div className="flex w-full flex-col items-center gap-6 p-6 sm:p-10 lg:flex-row lg:p-16">
				{/* Left side */}
				<div className="flex flex-1 flex-col gap-6">
					<h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
					<p className="text-base text-gray-300 sm:text-lg">{description}</p>
					<button className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium uppercase text-black transition-all duration-200 hover:bg-gray-100 sm:w-fit sm:text-base">
						<Tag size={20} className="mr-2" />
						{buttonText}
					</button>
				</div>

				{/* Right side */}
				<div className="mt-6 hidden w-full flex-1 lg:mt-0 lg:block">
					<Image
						src="/images/services-bottom.webp"
						alt="Service visual"
						width={500}
						height={300}
						className="h-auto w-full rounded-lg object-cover"
					/>
				</div>
			</div>
		</div>
	);
};
