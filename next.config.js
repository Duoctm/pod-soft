import { default as nextPWA } from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "saleor-media-bucket-name.s3.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "api-dev.mypodsoftware.io.vn",
				port: "",
				pathname: "/thumbnail/**",
			},
			{
				protocol: "https",
				hostname: "api.mypodsoftware.io.vn",
				port: "",
				pathname: "/thumbnail/**",
			},
			{
				protocol: "https",
				hostname: "zoomprints-production-s3-media-bucket.s3.us-west-1.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "zoomprints-production-s3-media-bucket.s3.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "api.podsoftware.io.vn",
				port: "",
				pathname: "/thumbnail/**",
			},
		],
		unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "true",
	},
	experimental: {
		typedRoutes: false,
	}, // used in the Dockerfile

	output:
		process.env.NEXT_OUTPUT === "standalone"
			? "standalone"
			: process.env.NEXT_OUTPUT === "export"
				? "export"
				: undefined, // Add ESLint configuration to ignore errors during build

	eslint: {
		// This setting will ignore ESLint errors during the build
		ignoreDuringBuilds: true,
	},

	reactStrictMode: false,
	// experimental: {
	// 	appDir: true,
	// },
	webpack: (config, { webpack }) => {
		config.experiments = {
			...config.experiments,
			topLevelAwait: true,
		};
		config.externals.push({
			sharp: "commonjs sharp",
			canvas: "commonjs canvas",
		});
		config.plugins.push(
			new webpack.ProvidePlugin({
				Buffer: ["buffer", "Buffer"],
				//process: "process/browser",
			}),
		);
		return config;
	},
};

const withPWA = nextPWA({
	dest: "public",
});

export default withPWA(config);
