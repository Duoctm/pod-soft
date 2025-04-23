import { type ReactNode } from "react";
import { Footer } from "@/ui/components/Footer";
import { Header } from "@/ui/components/Header";

export const metadata = {
	title: "ZoomPrint - Print on Demand",
	description:
		"ZoomPrint is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default function RootLayout(props: { children: ReactNode; params: { channel: string } }) {
	return (
		<>
			<Header channel={props.params.channel} />
			<div className="flex flex-col">
				<main className="flex-1">{props.children}</main>
				<Footer channel={props.params.channel} />
			</div>
		</>
	);
}
