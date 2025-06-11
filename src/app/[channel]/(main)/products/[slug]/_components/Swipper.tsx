"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/pagination";

// import required modules
import { FreeMode, Navigation, Thumbs, Pagination } from "swiper/modules";
import Image from "next/image";

interface Props {
	images: string[];
	loading?: boolean;
	onImagesLoaded?: () => void;
}

const Swipper: React.FC<Props> = ({ images, loading, onImagesLoaded }) => {


	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [loadedImages, setLoadedImages] = useState<number>(0);

	useEffect(() => {
		if (images && loadedImages === images.length && images.length > 0) {
			onImagesLoaded?.();
		}
	}, [loadedImages, images.length, onImagesLoaded]);

	if (loading && images.length < 0) {
		return (
			<div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200" />
		);
	}

	return (
		<div className="flex flex-col gap-y-2">
			<Swiper
				style={{
					height: "420px",
					width: "100%",
				}}
				loop={true}
				spaceBetween={10}
				navigation={true}
				thumbs={{ swiper: thumbsSwiper }}
				modules={[FreeMode, Navigation, Thumbs, Pagination]}
				className="mySwiper2"
				pagination={{ clickable: true }}
			>
				{images.map((image, index) => (
					<SwiperSlide key={index} className="relative">
						<div className="relative aspect-square w-full">
							<Image
								src={image}
								alt={`Product image ${index + 1}`}
								fill
								className="bg-cover object-contain bg-center"
								onLoad={() => setLoadedImages(prev => prev + 1)}
								priority={index === 0}
							/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
			<Swiper
				style={{
					height: "70px",
					width: "100%",
				}}
				onSwiper={(swiper) => setThumbsSwiper(swiper as any)}
				loop={true}
				spaceBetween={10}
				slidesPerView={4}
				freeMode={true}
				watchSlidesProgress={true}
				modules={[FreeMode, Navigation, Thumbs]}
				className="mySwiper"
			>
				{images.map((image, index) => (
					<SwiperSlide key={index} className="relative">
						<Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={image} alt="" fill className="bg-cover object-contain" />
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default Swipper;
