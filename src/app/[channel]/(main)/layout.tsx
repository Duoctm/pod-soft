import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import { BreadcrumbProvider } from "@/ui/components/BreadcrumbProvider";

const Footer = dynamic(() => import("@/ui/components/Footer").then(mod => mod.Footer));
const Header = dynamic(() => import("@/ui/components/Header").then(mod => mod.Header));

export const metadata = {
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default function RootLayout(props: { children: ReactNode; params: { channel: string } }) {
	return (
		<>
			<Header channel={props.params.channel} />
			<BreadcrumbProvider channel={props.params.channel}>
				<div className="w-full">
					{props.children}
					<Footer channel={props.params.channel} />
				</div>
			</BreadcrumbProvider>
		</>
	);
}
