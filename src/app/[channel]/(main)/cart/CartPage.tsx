"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { CheckoutLine, Checkout } from "@/gql/graphql";
import { formatMoney, getHrefForVariant } from "@/lib/utils";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { CheckoutLink } from "./CheckoutLink";
import { DeleteLineButton } from "./DeleteLineButton";
import { ViewDesignButton } from "./ViewDesignButton";
import { DesignButton } from "./DesignButton";
import { CheckoutLineUpdate } from "./CheckoutLineUpdate";
import { getCheckoutList } from "./actions";

export type CheckoutType = Pick<Checkout, "__typename" | "id" | "email" | "lines" | "totalPrice">;

const INITIAL_CHECKOUT_VALUE: CheckoutType = {
	__typename: "Checkout" as const,
	id: "",
	email: "",
	lines: [],
	totalPrice: {
		currency: "USD",
		gross: { amount: 0, currency: "USD" },
		net: { amount: 0, currency: "USD" },
		tax: { amount: 0, currency: "USD" },
	},
};

interface CartPageProps {
	params: { channel: string };
}

export default function CartPage({ params }: CartPageProps) {
	const [checkout, setCheckout] = useState<CheckoutType>(INITIAL_CHECKOUT_VALUE);
	const [items, setItems] = useState<CheckoutLine[]>([]);
	const [checkoutId, setCheckoutId] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const fetchCheckout = useCallback(async () => {
		setLoading(true);
		try {
			const checkoutData = await getCheckoutList(params.channel);
			if (checkoutData) {
				setCheckout(checkoutData.checkout as CheckoutType);
				setItems(checkoutData.checkout.lines as CheckoutLine[]);
			}
			setCheckoutId(checkoutData?.checkoutId as string);
		} catch (error) {
			console.error("Failed to fetch checkout:", error);
		} finally {
			setLoading(false);
		}
	}, [params.channel]);

	useEffect(() => {
		fetchCheckout();
	}, [fetchCheckout]);

	const handleQuantityChange = useCallback(
		async (lineId: string, newQuantity: number) => {
			if (newQuantity <= 0) return;

			setLoading(true);
			try {
				await CheckoutLineUpdate({ id: checkoutId, lineId, quantity: newQuantity });
				setItems((prev) =>
					prev.map((item) => (item.id === lineId ? { ...item, quantity: newQuantity } : item)),
				);
				await fetchCheckout();
			} catch (error) {
				console.error("Failed to update quantity:", error);
			} finally {
				setLoading(false);
			}
		},
		[checkoutId, fetchCheckout],
	);

	const renderCartItem = (item: CheckoutLine) => (
		<li key={item.id} className="flex py-4">
			<div className="aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-neutral-50 sm:h-32 sm:w-32">
				{item.variant?.media && (
					<Image
						src={item.variant.media[0].url}
						alt={item.variant.media[0].alt ?? ""}
						width={200}
						height={200}
						loading="lazy"
						className="h-full w-full object-contain object-center"
					/>
				)}
			</div>
			<div className="relative flex flex-1 flex-col justify-between p-4 py-2">
				<div className="flex justify-between justify-items-start gap-4">
					<div>
						<LinkWithChannel
							href={getHrefForVariant({
								productSlug: item.variant.product.slug,
								variantId: item.variant.id,
							})}
						>
							<h2 className="font-medium text-neutral-700">{item.variant?.product?.name}</h2>
						</LinkWithChannel>
						<p className="mt-1 text-sm text-neutral-500">{item.variant?.product?.category?.name}</p>
						{item.variant.name !== item.variant.id && Boolean(item.variant.name) && (
							<p className="mt-1 text-sm text-neutral-500">Variant: {item.variant.name}</p>
						)}
					</div>
					<p className="text-right font-semibold text-neutral-900">
						{formatMoney(item.totalPrice.gross.amount, item.totalPrice.gross.currency)}
					</p>
				</div>

				<div className="flex items-center justify-between">
					<div className="text-sm font-bold">
						Qty:
						<input
							type="number"
							value={item.quantity}
							onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
							min="1"
							className="ml-2 max-w-[120px] rounded-md border border-gray-300 p-1 text-center"
						/>
					</div>

					<div className="flex space-x-2">
						{Array.isArray(item.metadata) && item.metadata.length > 0 && (
							<ViewDesignButton lineId={item.id} checkout={checkoutId} params={params} />
						)}
						{Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0 && (
							<DesignButton
								colorId={item.variant.attributes[0].values[0].id}
								productId={item.variant.product.id}
								params={params}
								quantity={1}
								selectedVariantId={item.variant.id}
							/>
						)}
					</div>

					<DeleteLineButton
						checkoutId={checkoutId}
						lineId={item.id}
						onRemove={() => setItems((prev) => prev.filter((line) => line.id !== item.id))}
					/>
				</div>
			</div>
		</li>
	);

	return (
		<section className="mx-auto max-w-7xl p-8">
			<h1 className="mt-8 text-3xl font-bold text-neutral-900">Your Shopping Cart</h1>
			{!checkout || !items || items.length < 1 ? (
				!loading ? (
					<section className="mx-auto max-w-7xl p-8">
						<h1 className="mt-8 text-3xl font-bold text-neutral-900">Your Shopping Cart is empty</h1>
						<p className="my-12 text-sm text-neutral-500">
							Looks like you haven't added any items to the cart yet.
						</p>
						<LinkWithChannel
							href="/products"
							className="inline-block max-w-full rounded border border-transparent bg-neutral-900 px-6 py-3 text-center font-medium text-neutral-50 hover:bg-neutral-800 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-500 sm:px-16"
						>
							Explore products
						</LinkWithChannel>
					</section>
				) : (
					<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>
				)
			) : (
				<form className="mt-12">
					<ul
						data-testid="CartProductList"
						role="list"
						className="divide-y divide-neutral-200 border-b border-t border-neutral-200"
					>
						{items.map(renderCartItem)}
					</ul>

					<div className="mt-12">
						<div className="rounded border bg-neutral-50 px-4 py-2">
							<div className="flex items-center justify-between gap-2 py-2">
								<div>
									<p className="font-semibold text-neutral-900">Your Total</p>
									<p className="mt-1 text-sm text-neutral-500">
										Shipping will be calculated in the next step
									</p>
								</div>
								<div className="font-medium text-neutral-900">
									{loading ? (
										<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
									) : (
										formatMoney(checkout.totalPrice.gross.amount, checkout.totalPrice.gross.currency)
									)}
								</div>
							</div>
						</div>
						<div className="mt-10 text-center">
							<CheckoutLink
								
								checkoutId={checkoutId}
								disabled={!checkout.lines.length || loading}
								className="w-full sm:w-1/3"
							/>
						</div>
					</div>
				</form>
			)}
		</section>
	);
}
