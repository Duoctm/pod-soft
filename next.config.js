/** @type {import('next').NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				hostname: "*",
			},
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "dzzqvl1b2/image/**",
			}
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

	reactStrictMode: true,
	experimental: {
		appDir: true,
	},
	webpack: (config, { webpack }) => {
		config.experiments = {
		...config.experiments,
		topLevelAwait: true,
	}
	config.externals.push({
		sharp: "commonjs sharp",
		canvas: "commonjs canvas",
	})
	config.plugins.push(
		new webpack.ProvidePlugin({
		Buffer: ["buffer", "Buffer"],
		//process: "process/browser",
	})
	)
	return config
	},
};

export default config;
