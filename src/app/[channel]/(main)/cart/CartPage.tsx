"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import { CheckoutLink } from "./CheckoutLink";
import { DeleteLineButton } from "./DeleteLineButton";
import { ViewDesignButton } from "./ViewDesignButton";
import { DesignButton } from "./DesignButton";
import { CheckoutLineUpdate } from "./CheckoutLineUpdate";
import { getCheckoutList } from "./actions";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { formatMoney, getHrefForVariant } from "@/lib/utils";
import { PrintingTechnology, type CheckoutLine, type Checkout } from "@/gql/graphql";
import Wrapper from "@/ui/components/wrapper";
import { useDebounce } from "@/hooks/useDebounce";

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

const QuantityInput = ({
	item,
	handleQuantityChange,
}: {
	item: CheckoutLine;
	handleQuantityChange: (id: string, value: number) => void;
}) => {
	const [inputValue, setInputValue] = useState(item.quantity.toString());
	const debouncedValue = useDebounce(inputValue, 1000);

	// Cập nhật khi quantity thay đổi từ props (ví dụ khi fetch lại cart)
	useEffect(() => {
		setInputValue(item.quantity.toString());
	}, [item.quantity]);

	useEffect(() => {
		const num = Number(debouncedValue);
		if (
			debouncedValue !== "" &&
			!isNaN(num) &&
			num > 0 &&
			num !== item.quantity
		) {
			handleQuantityChange(item.id, num);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	return (
		<input
			type="number"
			value={inputValue}
			onChange={handleChange}
			min="1"
			className="w-16 rounded-md border border-gray-300 p-0 text-center"
			max={item.variant.quantityAvailable || 9999} // Giới hạn tối đa theo stock
		/>
	);
};

// Helper type and function to parse pricing_info from metadata
interface PricingInfo {
	member_price: number;
	retail_price: number;
	discount_percentage: number;
	currency: string;
	has_discount: boolean;
	color?: string;
	quantity: number;
}

function isPricingInfo(obj: unknown): obj is PricingInfo {
	if (!obj || typeof obj !== "object") return false;
	const o = obj as Record<string, unknown>;
	return (
		typeof o.member_price === "number" &&
		typeof o.retail_price === "number" &&
		typeof o.discount_percentage === "number" &&
		typeof o.currency === "string" &&
		typeof o.has_discount === "boolean" &&
		typeof o.quantity === "number"
	);
}

function parsePricingInfoFromMetadata(line: CheckoutLine): PricingInfo | null {
	const meta = line.metadata?.find((m) => m.key === "pricing_info");
	if (!meta) return null;
	try {
		const info = JSON.parse(meta.value);
		if (isPricingInfo(info)) {
			return info;
		}
		return null;
	} catch {
		return null;
	}
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
			console.log(checkoutData?.checkout.lines)
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

	// const totalSubtotal = useMemo(
	// 	() => checkout.lines.reduce((total, item) => total + item.quantity, 0),
	// 	[checkout.lines],
	// );


	const handleCheckOrderIncludeValue = (items: CheckoutLine[], value: PrintingTechnology) => {
		return items.some((item) => {
			const printingMeta = item.metadata?.find((meta) => meta.key === "printing_info");
			if (!printingMeta) return false;
			try {
				const arr = JSON.parse(printingMeta.value);
				// arr có thể là mảng các object
				return Array.isArray(arr) && arr.some(
					(info) => typeof info === "object" && info !== null && "printing_technology" in info && (info as { printing_technology?: string }).printing_technology === value
				);
			} catch {
				return false;
			}
		});
	}



	const renderCartItem = (item: CheckoutLine) => {
		const pricingInfo = parsePricingInfoFromMetadata(item);
		const hasDiscount = pricingInfo?.has_discount && pricingInfo.retail_price > pricingInfo.member_price;
		return (
			<div key={item.id} className="flex flex-1 flex-col py-4">
				<li className="flex gap-x-2">
					<div className="relative aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-neutral-50 sm:h-32 sm:w-32">
						{item.variant?.media && (
							<Image
								src={item.variant.media[0].url || ""}
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
							<div className="text-left font-semibold text-neutral-900 md:text-right flex flex-col items-end">
								{pricingInfo ? (
									<>
										<div className="flex items-center gap-2">
											<span className="text-lg font-bold text-[#B12704]">
												{formatMoney(pricingInfo.member_price, pricingInfo.currency)}
											</span>
											{hasDiscount && (
												<span className="text-sm text-neutral-400 line-through">
													{formatMoney(pricingInfo.retail_price, pricingInfo.currency)}
												</span>
											)}
											{hasDiscount && (
												<span className="ml-2 rounded bg-[#FFD814] px-2 py-0.5 text-xs font-bold text-[#B12704]">
													-{pricingInfo.discount_percentage}%
												</span>
											)}
										</div>
										<div className="text-xs text-neutral-500">per unit</div>
									</>
								) : (
									<span>{formatMoney(item.totalPrice.gross.amount / item.quantity, item.totalPrice.gross.currency)} / per unit</span>
								)}
							</div>
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
								<QuantityInput item={item} handleQuantityChange={handleQuantityChange} />
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
										variantId={item.variant.id}
										productId={item.variant.product.id}
										params={params}
										quantity={1}
										lineId={item.id}
										checkout={checkoutId}
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
										variantId={item.variant.id}
										productId={item.variant.product.id}
										params={params}
										quantity={1}
										lineId={item.id}
										checkout={checkoutId}
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
						<div className="flex flex-row justify-end mt-2">
							{pricingInfo ? (
								<div className="flex flex-col items-end">
									<span className="text-sm text-neutral-900 font-semibold">
										Subtotal: {formatMoney(pricingInfo.member_price * item.quantity, pricingInfo.currency)}
									</span>
									{hasDiscount && (
										<span className="text-md text-neutral-400 line-through">
											{formatMoney(pricingInfo.retail_price * item.quantity, pricingInfo.currency)}
										</span>
									)}
									{hasDiscount && (
										<span className="text-md text-green-600 font-medium">
											You save {formatMoney((pricingInfo.retail_price - pricingInfo.member_price) * item.quantity, pricingInfo.currency)}
										</span>
									)}
								</div>
							) : (
								<span className="text-md text-neutral-900 font-semibold">
									Subtotal: {formatMoney(item.totalPrice.gross.amount, item.totalPrice.gross.currency)}
								</span>
							)}
						</div>
					</div>
				</li>
			</div>
		);
	};

	const cartTotals = useMemo(() => {
		let totalRetail: number = 0;
		let totalMember: number = 0;
		let totalDiscount: number = 0;
		let totalQuantity: number = 0;
		let currency: string = items[0]?.totalPrice.gross.currency || "USD";
		let hasAnyDiscount = false;
		items.forEach((line) => {
			const info = parsePricingInfoFromMetadata(line);
			if (info) {
				totalRetail += info.retail_price * line.quantity;
				totalMember += info.member_price * line.quantity;
				totalDiscount += (info.retail_price - info.member_price) * line.quantity;
				totalQuantity += line.quantity;
				currency = info.currency || currency;
				if (info.has_discount && info.retail_price > info.member_price) {
					hasAnyDiscount = true;
				}
			} else {
				// fallback: use old price
				totalRetail += line.totalPrice.gross.amount;
				totalMember += line.totalPrice.gross.amount;
				totalQuantity += line.quantity;
				currency = line.totalPrice.gross.currency || currency;
			}
		});
		return { totalRetail, totalMember, totalDiscount, totalQuantity, currency, hasAnyDiscount };
	}, [items]);

	return (
		<Wrapper className="mx-auto min-h-screen">
			<ToastContainer />
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
					</ul>

					<div className="h-full w-full rounded border bg-neutral-50 p-6   px-4 py-2  md:max-w-xs lg:sticky lg:top-40 ">
						<div className="">
							<div className="flex items-center justify-between gap-2 py-2">
								<div>
									<p className="font-semibold text-neutral-900">{`Subtotal ( ${cartTotals.totalQuantity} items ) : `}</p>
								</div>
								<div className="font-medium text-neutral-900 flex flex-col items-end">
									{cartTotals.hasAnyDiscount && cartTotals.totalMember !== cartTotals.totalRetail && (
										<span className="text-neutral-400 line-through text-sm">
											{formatMoney(cartTotals.totalRetail, cartTotals.currency)}
										</span>
									)}
									<span className="text-lg font-bold text-[#B12704]">
										{formatMoney(cartTotals.totalMember, cartTotals.currency)}
									</span>
									{cartTotals.hasAnyDiscount && cartTotals.totalDiscount > 0 && (
										<span className="text-xs text-green-600 font-medium">
											You save {formatMoney(cartTotals.totalDiscount, cartTotals.currency)}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="mt-2 text-center">
							<CheckoutLink checkoutId={checkoutId} disabled={!checkout.lines.length} channel={params.channel} className="w-full" includePrintingTechnology={handleCheckOrderIncludeValue(items, PrintingTechnology.Silk)} />
						</div>
					</div>
				</form>
			)}
		</Wrapper>
	);
}
