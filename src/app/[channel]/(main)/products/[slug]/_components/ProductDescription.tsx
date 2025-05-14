import React from "react";
import xss from "xss";

interface ProductDescriptionProps {
	descriptionHtml: string[] | null;
	title?: string;
	isLoading?: boolean;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
	descriptionHtml,
	title = "Features",
	isLoading: externalLoading,
}) => {
	const isContentLoading = externalLoading || !descriptionHtml || (descriptionHtml.length === 1 && descriptionHtml[0] === " ");

	return (
		<div className="mb-4 mt-4 md:mb-6 md:mt-6">
			<h2 className="mb-1 text-sm font-semibold md:text-base">{title}</h2>
			{isContentLoading ? (
				<div className="space-y-2 md:space-y-3">
					<div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-4/7 animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
					<div className="h-4 w-4/12 animate-pulse rounded bg-neutral-200" />
				</div>
			) : descriptionHtml && descriptionHtml.length > 0 ? (
				<div className="prose prose-sm prose-stone max-w-none space-y-2 text-neutral-600 md:prose-base md:space-y-3">
					{descriptionHtml.map((content, index) => (
						<div
							key={index}
							className="text-sm md:text-base"
							dangerouslySetInnerHTML={{ __html: xss(content) }}
						/>
					))}
				</div>
			) : (
				<p className="text-sm italic text-neutral-500 md:text-base">No description available.</p>
			)}
		</div>
	);
};
