import { Inter } from "next/font/google";
import "./globals.css";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { DraftModeNotification } from "@/ui/components/DraftModeNotification";
import { UrqlProvider } from "@/components/UrqlProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "ZoomPrint",
	description: "ZoomPrint is your gateway to rapid fast fulfillment minus the steep investment.",
	metadataBase: process.env.NEXT_PUBLIC_STOREFRONT_URL
		? new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL)
		: undefined,
};

export default function RootLayout(props: { children: ReactNode }) {
	const { children } = props;

	return (
		<html lang="en" className="min-h-dvh">
			<body className={`${inter.className} min-h-dvh`}>
				<UrqlProvider>
				{children}
				<DraftModeNotification />
				</UrqlProvider>
			</body>
		</html>
	);
}
