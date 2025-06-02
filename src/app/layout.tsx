import { Work_Sans } from "next/font/google";
import "./globals.css";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { DraftModeNotification } from "@/ui/components/DraftModeNotification";
import { UrqlProvider } from "@/components/UrqlProvider";
import ScrollToTop from "@/ui/components/ScrollToTop";
import { AppLifecycleEvents } from "./AppLifecycleEvents"

const workSands = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
	manifest: "/manifest.json",
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
	metadataBase: process.env.NEXT_PUBLIC_STOREFRONT_URL
		? new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL)
		: undefined,
	themeColor: "#FFFFFF",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "ZoomPrints App",
	},
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 1,
	},
	icons: {
		icon: [
			{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
			{ url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [
			{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
			{ url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
		]
	},
};

export default function RootLayout(props: { children: ReactNode }) {
	const { children } = props;

	return (
		<html lang="en" className="min-h-dvh">
			<head>
				<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
			</head>
			<body className={`${workSands.className} min-h-dvh`}>
				<AppLifecycleEvents />
				<ScrollToTop />
				<UrqlProvider>
					{children}

					<DraftModeNotification />
				</UrqlProvider>
			</body>
		</html>
	);
}
