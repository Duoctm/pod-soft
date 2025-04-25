import React from "react";
import xss from "xss";

interface ProductDescriptionProps {
	descriptionHtml: string[] | null;
	title?: string;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
	descriptionHtml,
	title = "Features",
}) => {
	return (
		<div className="mb-4 mt-4 md:mb-6 md:mt-6">
			<h2 className="mb-2 text-sm font-semibold md:text-base">{title}</h2>
			{descriptionHtml && descriptionHtml.length > 0 ? (
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
