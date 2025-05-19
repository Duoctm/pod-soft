import type { Metadata } from "next";

type Props = {
  params: { channel: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channel } = params;

  return {
	title: "ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
	openGraph: {
		title: "ZoomPrints",
		description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
		url: `https://mypod.io.vn/${channel}`,
		images: [
			{
				url: "./opengraph-image.png",
				width: 1200,
				height: 630,
				alt: "ZoomPrints",
			},
		],
	},
}
};