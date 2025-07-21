'use client'
import { invariant } from "ts-invariant";
import Image from "next/image";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { RootWrapper } from "./pageWrapper";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
//import { RefreshTokenCaller } from "./refreshTokenCaller";

export default function CheckoutPage({
	searchParams,
}: {
	searchParams: { checkout?: string; order?: string };
}) {
	invariant(process.env.NEXT_PUBLIC_SALEOR_API_URL, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");
	const router = useRouter();

	if (!searchParams.checkout && !searchParams.order) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br ">
			{/* Header with Logo */}
			<header className="bg-white border-b border-gray-200 shadow-sm">
				<div className="mx-auto max-w-7xl px-4 py-4">
					<div className="flex items-center justify-between">
						<LinkWithChannel
							aria-label="homepage"
							href="/"
							className="flex items-center transition-opacity hover:opacity-80"
						>
							<Image
								src="/images/main-logo.webp"
								alt="ZoomPrints"
								width={150}
								height={70}
								className="h-auto"
							/>
						</LinkWithChannel>

					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-6">
				{/* Back Button */}
				<div className="mb-6">
					<button
						className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:border-gray-300"
						type="button"
						onClick={() => router.back()}
					>
						<ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
						<span className="font-medium">Back to Shopping</span>
					</button>
				</div>

				{/* Page Title */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
							<ShoppingBag className="w-4 h-4 text-blue-600" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
					</div>

				</div>

				{/* Checkout Content */}
				<div className="overflow-hidden">
					<div className="p-2">
						<RootWrapper saleorApiUrl={process.env.NEXT_PUBLIC_SALEOR_API_URL} />
					</div>
				</div>
			</main>

		</div>
	);
}