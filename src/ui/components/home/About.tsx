import React from "react";

const About = () => {
	return (
		<section className="relative h-screen w-full bg-black text-white">
			{/* Background video */}
			<video
				className="absolute inset-0 z-0 hidden h-full w-full object-cover sm:block"
				autoPlay
				muted
				loop
				playsInline
			>
				<source src="/videos/about.mp4" type="video/mp4" />
				Your browser does not support the video tag.
			</video>

			{/* Overlay */}
			<div className="absolute inset-0 z-[1] bg-black/60" />

			{/* Content */}
			<div className="relative z-[2] flex h-full w-full items-center justify-center px-6 md:px-10 lg:px-20">
				<div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 max-w-7xl w-full text-center md:text-left">
					
					{/* Title */}
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold whitespace-nowrap">
						ABOUT US
					</h2>

					{/* Description */}
					<p className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-3xl leading-relaxed">
						What began as a humble venture at the local swap meet in San Jose, California, has evolved into an
						industry-leading business specializing in print-on-demand. Our cutting-edge technologies and
						global logistics environment allow us to maximize delivery to a wide range of customers and
						partners worldwide — at any scale imaginable.
					</p>
				</div>
			</div>
		</section>
	);
};

export default About;
