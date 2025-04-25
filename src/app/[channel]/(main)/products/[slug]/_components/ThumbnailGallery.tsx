import React from "react";
import Image from "next/image";

interface Media {
	id: string;
	alt: string;
	url: string;
}

interface ThumbnailGalleryProps {
	images: Media[];
	currentIndex: number;
	onThumbnailClick: (index: number) => void;
	maxThumbnails?: number;
}

export const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
	images,
	currentIndex,
	onThumbnailClick,
	maxThumbnails = 4, // Default to 4 thumbnails, but can be customized
}) => {
	if (images.length <= 1) return null;

	// Calculate how many thumbnails to show based on available space and images
	const thumbnailsToShow = Math.min(images.length, maxThumbnails);

	return (
		<div className="mt-4 flex flex-wrap justify-center gap-2">
			{images.slice(0, thumbnailsToShow).map((img, index) => (
				<Image
					width={100}
					height={100}
					key={img.id || img.url + index}
					src={img.url}
					alt={img.alt ? `Thumbnail ${index + 1} - ${img.alt}` : `Thumbnail ${index + 1}`}
					onClick={() => onThumbnailClick(index)}
					className={`h-14 w-14 cursor-pointer rounded-md border-2 object-cover md:h-16 md:w-16 ${
						currentIndex === index ? "border-black" : "border-transparent"
					} hover:border-gray-400`}
				/>
			))}
		</div>
	);
};
