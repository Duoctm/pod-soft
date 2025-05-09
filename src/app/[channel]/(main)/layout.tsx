import { type ReactNode } from "react";
import { Footer } from "@/ui/components/Footer";
import { Header } from "@/ui/components/Header";
import { BreadcrumbProvider } from "@/ui/components/BreadcrumbProvider";

export const metadata = {
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default function RootLayout(props: { children: ReactNode; params: { channel: string } }) {
	return (
		<>
			<Header channel={props.params.channel} />
			<BreadcrumbProvider channel={props.params.channel}>
			<div className="flex flex-col">
				<main className="flex-1">{props.children}</main>
				<Footer  channel={props.params.channel} />
			</div>
			</BreadcrumbProvider>
		</>
	);
}
