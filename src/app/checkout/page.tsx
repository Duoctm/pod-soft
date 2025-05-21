import { invariant } from "ts-invariant";
import Image from "next/image";
import { RootWrapper } from "./pageWrapper";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";

export const metadata = {
	title: "Checkout · ZoomPrints",
};

export default function CheckoutPage({
	searchParams,
}: {
	searchParams: { checkout?: string; order?: string };
}) {
	invariant(process.env.NEXT_PUBLIC_SALEOR_API_URL, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

	if (!searchParams.checkout && !searchParams.order) {
		return null;
	}

	return (
		<div className="min-h-dvh bg-white">
			<div className="mx-auto flex max-w-7xl flex-col px-4">
				<div className="flex items-center font-bold">
					<LinkWithChannel aria-label="homepage" href="/" className="flex items-center">
						<Image src="/images/main-logo.png" alt="ZoomPrints" width={150} height={70} />
					</LinkWithChannel>
				</div>
			</div>
			<section className="mx-auto flex max-w-7xl flex-col px-8">
				<h1 className="text-3xl font-bold text-neutral-900">Checkout</h1>

				<section className="mb-12 mt-6 flex-1">
					<RootWrapper saleorApiUrl={process.env.NEXT_PUBLIC_SALEOR_API_URL} />
				</section>
			</section>
		</div>
	);
}
