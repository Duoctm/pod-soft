"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// import required modules
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import Image from "next/image";

interface Props {
	images: string[];
	loading?: boolean;
}

const Swipper = ({ images, loading = false }: Props) => {
	const [thumbsSwiper, setThumbsSwiper] = useState(null);

	if (loading) {
		return (
			<div className="flex flex-col gap-y-2 animate-pulse">
				<div className="w-full h-[420px] bg-gray-200 rounded"></div>
				<div className="flex gap-x-2">
					{[...Array(4)].map((_, index) => (
						<div key={index} className="w-1/4 h-[70px] bg-gray-200 rounded"></div>
					))}
				</div>
			</div>
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
				modules={[FreeMode, Navigation, Thumbs]}
				className="mySwiper2"
			>
				{images.map((image, index) => (
					<SwiperSlide key={index} className="relative">
						<Image src={image} alt="" fill 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="bg-cover bg-center object-contain w-full h-full" priority />
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
						<Image  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"  src={image} alt="" fill className="bg-cover object-contain"/>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default Swipper;
