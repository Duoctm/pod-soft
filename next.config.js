/** @type {import('next').NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				hostname: "*",
			},
		],
		unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "true",
	},
	experimental: {
		typedRoutes: false,
	},

	// used in the Dockerfile
	output:
		process.env.NEXT_OUTPUT === "standalone"
			? "standalone"
			: process.env.NEXT_OUTPUT === "export"
				? "export"
				: undefined,

	// Add ESLint configuration to ignore errors during build
	eslint: {
		// This setting will ignore ESLint errors during the build
		ignoreDuringBuilds: true,
	},
};

export default config;
