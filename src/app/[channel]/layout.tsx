import { type ReactNode } from "react";
import { executeGraphQL } from "@/lib/graphql";
import { ChannelsListDocument } from "@/gql/graphql";

// app/default-channel/page.tsx

export const metadata = {
	title: "ZoomPrint",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
	openGraph: {
		title: "ZoomPrint",
		description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
		url: "../../",
		images: [
			{
				url: "./opengraph-image.png",
				width: 1200,
				height: 630,
				alt: "ZoomPrint - In nhanh",
			},
		],
	},
};

export default function DefaultChannelPage() {
	return (
		<main>
			<h1>Default Channel</h1>
		</main>
	);
}



export const generateStaticParams = async () => {
	// the `channels` query is protected
	// you can either hardcode the channels or use an app token to fetch the channel list here

	if (process.env.SALEOR_APP_TOKEN) {
		const channels = await executeGraphQL(ChannelsListDocument, {
			withAuth: false, // disable cookie-based auth for this call
			headers: {
				// and use app token instead
				Authorization: `Bearer ${process.env.SALEOR_APP_TOKEN}`,
			},
		});
		return (
			channels.channels
				?.filter((channel) => channel.isActive)
				.map((channel) => ({ channel: channel.slug })) ?? []
		);
	} else {
		return [{ channel: "default-channel" }];
	}
};

export default function ChannelLayout({ children }: { children: ReactNode }) {
	return children;
}
