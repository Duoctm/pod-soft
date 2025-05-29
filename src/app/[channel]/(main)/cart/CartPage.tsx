"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useMemo } from "react";
import { CheckoutLink } from "./CheckoutLink";
import { DeleteLineButton } from "./DeleteLineButton";
import { ViewDesignButton } from "./ViewDesignButton";
import { DesignButton } from "./DesignButton";
import { CheckoutLineUpdate } from "./CheckoutLineUpdate";
import { getCheckoutList } from "./actions";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { formatMoney, getHrefForVariant } from "@/lib/utils";
import { type CheckoutLine, type Checkout } from "@/gql/graphql";
import Wrapper from "@/ui/components/wrapper";

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

export function CartPage({ params }: CartPageProps) {
	const [checkout, setCheckout] = useState<CheckoutType>(INITIAL_CHECKOUT_VALUE);
	const [items, setItems] = useState<CheckoutLine[]>([]);
	const [checkoutId, setCheckoutId] = useState<string>("");
	const [loading, setLoading] = useState(false);



	const fetchCheckout = useCallback(async () => {
		//await checkTokenServerAction();
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
		void fetchCheckout();
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

	const totalSubtotal = useMemo(
		() => checkout.lines.reduce((total, item) => total + item.quantity, 0),
		[checkout.lines],
	);
	const renderCartItem = (item: CheckoutLine) => (
		<div key={item.id} className="flex flex-1 flex-col py-4">
			<li className="flex gap-x-2">
				<div className="relative aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-neutral-50 sm:h-32 sm:w-32">
					{item.variant?.media && (
						<Image
							src={item.variant.media[0].url}
							alt={item.variant.media[0].alt ?? ""}
							fill
							loading="lazy"
							className="h-full w-full object-contain object-center"
						/>
					)}
				</div>
				<div className="relative flex flex-1 flex-col justify-between">
					<div className="flex flex-col justify-between justify-items-start gap-4 md:flex-row">
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
						<p className="text-left  font-semibold text-neutral-900 md:text-right">
							{/* {formatMoney(item.totalPrice.gross.amount, item.totalPrice.gross.currency)} */}
							{formatMoney(
								item.variant?.pricing?.price?.gross?.amount as number,
								item.variant?.pricing?.price?.gross?.currency as string,
							)}
						</p>
					</div>

					<div className="flex flex-col items-start justify-start gap-y-2 md:flex-row md:items-center">
						<div className="flex items-center gap-2 font-bold">
							<button
								type="button"
								onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
								className="lex items-center justify-center rounded-md border border-gray-300 px-2 hover:bg-gray-100"
								disabled={item.quantity <= 1}
							>
								-
							</button>
							<input
								type="number"
								value={item.quantity}
								onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
								min="1"
								className="w-16 rounded-md border border-gray-300 p-0 text-center"
							/>
							<button
								type="button"
								onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
								className="flex items-center justify-center rounded-md border border-gray-300 px-2 hover:bg-gray-100"
							>
								+
							</button>
						</div>

						<div className="hidden items-center justify-center gap-2 md:flex">
							{Array.isArray(item.metadata) && item.metadata.length > 0 && (
								<ViewDesignButton lineId={item.id} checkout={checkoutId} params={params} />
							)}
							{Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0 && (
								<DesignButton
									colorId={item.variant.attributes[0].values[0].id}
									variantId={item.variant.id}
									productId={item.variant.product.id}
									params={params}
									quantity={1}
									selectedVariantId={item.variant.id}
								/>
							)}
							|
							<DeleteLineButton
								checkoutId={checkoutId}
								lineId={item.id}
								onRemove={() => {
									void fetchCheckout()
									setItems((prev) => prev.filter((line) => line.id !== item.id))
								}}
							/>
							|
						</div>
						<div className="my-2 flex items-center justify-center gap-2 md:hidden">
							{Array.isArray(item.metadata) && item.metadata.length > 0 && (
								<ViewDesignButton lineId={item.id} checkout={checkoutId} params={params} />
							)}
							{Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0 && (
								<DesignButton
									colorId={item.variant.attributes[0].values[0].id}
									variantId={item.variant.id}
									productId={item.variant.product.id}
									params={params}
									quantity={1}
									selectedVariantId={item.variant.id}
								/>
							)}
							<DeleteLineButton
								checkoutId={checkoutId}
								lineId={item.id}
								onRemove={() => setItems((prev) => prev.filter((line) => line.id !== item.id))}
							/>
						</div>
					</div>
				</div>
			</li>
		</div>
	);

	return (
		<Wrapper className="mx-auto min-h-screen">
			<h1 className="mt-8 text-3xl font-bold text-neutral-900">Shopping Cart</h1>
			{!checkout || !items || items.length < 1 ? (
				!loading ? (
					<section className="mx-auto max-w-7xl py-2">
						{/* <h1 className="mt-8 text-3xl font-bold text-neutral-900">Your Shopping Cart is empty</h1> */}
						<p className="my-4 text-sm text-neutral-500">
							Looks like you haven&apos;t added any items to the cart yet.
						</p>
						<LinkWithChannel
							href="/products"
							className="inline-block max-w-full rounded border border-transparent bg-[#8B3958] px-6 py-2 text-center font-medium text-[#FFFFFF] hover:bg-[#7A314F] aria-disabled:cursor-not-allowed aria-disabled:bg-[#C59CAE] sm:px-16"
						>
							Explore products
						</LinkWithChannel>
					</section>
				) : (
					<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>
				)
			) : (
				<form className="mt-2 flex w-full flex-1 flex-col-reverse gap-x-4 gap-y-4 md:flex-row ">
					<ul
						data-testid="CartProductList"
						role="list"
						className="flex flex-1 flex-col divide-y divide-neutral-200 border-neutral-200"
					>
						<p className="w-full py-2 pr-4 text-end font-medium">Price</p>
						{items.map(renderCartItem)}
						<div className="mt-2 flex flex-1 justify-end py-2">
							<p className="font-medium">
								{`Subtotal ( ${totalSubtotal} items ): `}
								{formatMoney(checkout.totalPrice.gross.amount, checkout.totalPrice.gross.currency)}
							</p>
						</div>
					</ul>

					<div className="h-full w-full rounded border bg-neutral-50 p-6   px-4 py-2  md:max-w-xs lg:sticky lg:top-40 ">
						<div className="">
							<div className="flex items-center justify-between gap-2 py-2">
								<div>
									<p className="font-semibold text-neutral-900">{`Subtotal ( ${totalSubtotal} items ): `}</p>
									{/* <p className="mt-1 text-sm text-neutral-500">
										Shipping will be calculated in the next step
									</p> */}
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
						<div className="mt-2 text-center">
							<CheckoutLink checkoutId={checkoutId} disabled={!checkout.lines.length} className="w-full" />
						</div>
					</div>
				</form>
			)}
		</Wrapper>
	);
}
