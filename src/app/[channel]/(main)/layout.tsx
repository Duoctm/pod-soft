import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import { BreadcrumbProvider } from "@/ui/components/BreadcrumbProvider";
import HeaderNewVersion from "@/ui/components/ui-migration/elements/HeaderNewVersion";
import FooterNewVersion from "@/ui/components/ui-migration/elements/FooterNewVersion";
const Footer = dynamic(() => import("@/ui/components/Footer").then((mod) => mod.Footer));
const Header = dynamic(() => import("@/ui/components/Header").then((mod) => mod.Header));




export const metadata = {
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default function RootLayout(props: { children: ReactNode; params: { channel: string } }) {
	const version = process.env.NEXT_PUBLIC_UI_VERSION || "1";

	return (
		<>
			{version === "1" && (
				<>
					<Header channel={props.params.channel} />
					<BreadcrumbProvider channel={props.params.channel}>
						<div className="mx-auto min-h-screen w-full max-w-[100vw]">{props.children}</div>
					</BreadcrumbProvider>
					<Footer channel={props.params.channel} />
				</>
			)}
			{version === "2" && (
				<>
					<HeaderNewVersion channel={props.params.channel} />
					<BreadcrumbProvider channel={props.params.channel}>
						<div className="mx-auto min-h-screen w-full max-w-[100vw]">{props.children}</div>
					</BreadcrumbProvider>
					<FooterNewVersion />
				</>
			)}
		</>
	);
}
