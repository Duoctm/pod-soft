
"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";

import { CheckoutLink } from "./CheckoutLink";
import { DeleteLineButton } from "./DeleteLineButton";
import { ViewDesignButton } from "./ViewDesignButton";
import { DesignButton } from "./DesignButton";
import { CheckoutLineUpdate } from "./CheckoutLineUpdate";
import { getCheckoutList } from "./actions";
import { useCartPricing } from "./hooks/useCartPricing";
import { usePrintingTechnology } from "./hooks/usePrintingTechnology";
import { type PricingInfoUpdate, updatePricingInfo } from "./utils/updatePricingInfo";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { formatMoney, getHrefForVariant } from "@/lib/utils";
import { PrintingTechnology, type CheckoutLine, type Checkout, type MetadataItem } from "@/gql/graphql";
import Wrapper from "@/ui/components/wrapper";
import { useDebounce } from "@/hooks/useDebounce";
import { getUser } from "@/actions/user";

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
		if (Number(e.target.value) > 100000) {
			toast.warning("You’ve entered a quantity that exceeds our limit. Please contact our sales team for a better quote!")
			return;
		}
		setInputValue(e.target.value);
	};

	return (
		<input
			type="number"
			value={inputValue}
			onChange={handleChange}
			min="1"
			className="min-w-[3rem] w-16 px-2 py-1 text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#8B3958] focus:border-[#8B3958] text-sm font-medium bg-white"
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
	const { calculatePricingForQuantity } = useCartPricing(params.channel);

	const fetchCheckout = useCallback(async () => {
		//await checkTokenServerAction();
		setLoading(true);
		try {
			const checkoutData = await getCheckoutList(params.channel);
			if (checkoutData) {
				setCheckout(checkoutData.checkout as CheckoutType);
				setItems(checkoutData.checkout.lines as CheckoutLine[]);
				if (checkoutData?.checkout?.lines?.length > 0) {
					localStorage.setItem("cartUpdateDesign", JSON.stringify(checkoutData));
				}

				// Check and update DTG items to None
				const userData = await getUser();
				const updatedLines: CheckoutLine[] = [];

				for (const line of checkoutData.checkout.lines as CheckoutLine[]) {
					const printingMeta = line.metadata?.find((meta) => meta.key === "printing_info");
					let needsUpdate = false;
					let currentPrintingTech = PrintingTechnology.None;

					if (printingMeta) {
						try {
							const printingInfo = JSON.parse(printingMeta.value);
							if (Array.isArray(printingInfo) && printingInfo.length > 0) {
								const firstInfo = printingInfo[0] as { printing_technology?: string };
								if (firstInfo && typeof firstInfo === 'object' && firstInfo.printing_technology) {
									currentPrintingTech = firstInfo.printing_technology as PrintingTechnology;
									if (currentPrintingTech === PrintingTechnology.Dtg) {
										needsUpdate = true;
									}
								}
							}
						} catch (error) {
							console.error("Error parsing printing_info:", error);
						}
					}

					if (needsUpdate) {
						// Recalculate pricing with None technology
						const result = await calculatePricingForQuantity(
							line.variant.id,
							PrintingTechnology.None,
							line.quantity,
							Boolean(userData)
						);

						const dataUpdate: PricingInfoUpdate = {
							retailPrice: result?.retailPrice || 0,
							memberPrice: result?.memberPrice || 0,
							discountPercentage: result?.discountPercentage || 0,
						};

						// Update printing_info metadata to None
						const updatedMetadata = line.metadata?.map(meta => {
							if (meta.key === "printing_info") {
								try {
									const printingInfo = JSON.parse(meta.value);
									if (Array.isArray(printingInfo) && printingInfo.length > 0) {
										const firstInfo = printingInfo[0] as { printing_technology?: string };
										if (firstInfo && typeof firstInfo === 'object') {
											firstInfo.printing_technology = PrintingTechnology.None;
										}
									}
									return {
										...meta,
										value: JSON.stringify(printingInfo)
									};
								} catch {
									return meta;
								}
							}
							return meta;
						}) || [];

						const metadataUpdate = updatePricingInfo(updatedMetadata, dataUpdate);

						// Update the line in checkout
						await CheckoutLineUpdate({
							id: checkoutData.checkoutId,
							lineId: line.id,
							quantity: line.quantity,
							metadata: metadataUpdate
						});

						updatedLines.push({
							...line,
							metadata: metadataUpdate
						});
					} else {
						updatedLines.push(line);
					}
				}

				// If any updates were made, fetch checkout again to get the latest data
				if (updatedLines.some((line, index) => line.metadata !== (checkoutData.checkout.lines as CheckoutLine[])[index].metadata)) {
					const refreshedCheckoutData = await getCheckoutList(params.channel);
					if (refreshedCheckoutData) {
						setCheckout(refreshedCheckoutData.checkout as CheckoutType);
						setItems(refreshedCheckoutData.checkout.lines as CheckoutLine[]);
					}
				}
			}
			setCheckoutId(checkoutData?.checkoutId as string);
		} catch (error) {
			console.error("Failed to fetch checkout:", error);
		} finally {
			setLoading(false);
		}
	}, [params.channel, calculatePricingForQuantity]);

	useEffect(() => {
		void fetchCheckout();
	}, [fetchCheckout]);


	const handleQuantityChange = useCallback(
		async (lineId: string, newQuantity: number, variantId: string, printingTechnology?: PrintingTechnology, currentMetadata?: MetadataItem[]) => {
			if (newQuantity <= 0) return;

			const userData = await getUser();

			// For DTG, use None technology for pricing calculation
			const pricingTechnology = printingTechnology === PrintingTechnology.Dtg
				? PrintingTechnology.None
				: (printingTechnology || PrintingTechnology.None);

			const result = await calculatePricingForQuantity(
				variantId,
				pricingTechnology,
				newQuantity,
				Boolean(userData),
			)
			const dataUpdate: PricingInfoUpdate = {
				retailPrice: result?.retailPrice || 0,
				memberPrice: result?.memberPrice || 0,
				discountPercentage: result?.discountPercentage || 0,

			}

			const metadataUpdate = updatePricingInfo(currentMetadata as MetadataItem[], dataUpdate);


			setLoading(true);
			try {

				await CheckoutLineUpdate({ id: checkoutId, lineId, quantity: newQuantity, metadata: metadataUpdate });
				setItems((prev) =>
					prev.map((item) => (item.id === lineId ? { ...item, quantity: newQuantity, metadata: metadataUpdate } : item)),
				);
				await fetchCheckout();
			} catch (error) {
				console.error("Failed to update quantity:", error);
			} finally {
				setLoading(false);
			}
		},
		[checkoutId, fetchCheckout, calculatePricingForQuantity],
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
		console.log("🚀 CartPage.tsx:223 - item:", item);

		const pricingInfo = parsePricingInfoFromMetadata(item);
		console.log("🚀 CartPage.tsx:317 - pricingInfo:", pricingInfo);

		const serviceDetail = item.metadata?.find((meta) => meta.key === "service_detail");

		console.log(item, "item");

		let serviceDetailPrice = 0;



		if (serviceDetail && serviceDetail.value) {
			const parsedValue = JSON.parse(serviceDetail.value) as { price: number, name: string }[];
			if (Array.isArray(parsedValue)) {
				serviceDetailPrice = parsedValue.reduce((sum, item) => sum + item.price, 0);
			}
		} else {
			serviceDetailPrice = 0;
		}

		const unitPrice = (pricingInfo ? pricingInfo.member_price : item.totalPrice.gross.amount / item.quantity) + serviceDetailPrice;
		const totalPrice = (pricingInfo ? unitPrice * item.quantity : item.totalPrice.gross.amount);
		const currency = pricingInfo?.currency || item.totalPrice.gross.currency;

		// Calculate discount info for individual items
		const hasItemDiscount = pricingInfo?.has_discount && pricingInfo.retail_price > pricingInfo.member_price;
		const itemSavings = hasItemDiscount ? (pricingInfo.retail_price - pricingInfo.member_price) * item.quantity : 0;


		// eslint-disable-next-line react-hooks/rules-of-hooks
		const printingTechnology = usePrintingTechnology(item.metadata)
		const currentMetadata = item.metadata





		return (
			<div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 mb-4">
				{/* Mobile Layout */}
				<div className="block sm:hidden">
					{/* Mobile Header Row */}
					<div className="flex items-start gap-3 mb-3">
						{/* Product Image */}
						<div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
							{item.variant?.media && (
								<Image
									src={item.variant.media[0].url || ""}
									alt={item.variant.media[0].alt ?? ""}
									fill
									loading="lazy"
									className="object-contain object-center"
								/>
							)}
						</div>

						{/* Product Info */}
						<div className="flex-1 min-w-0">
							<LinkWithChannel
								href={getHrefForVariant({
									productSlug: item.variant.product.slug,
									variantId: item.variant.id,
								})}
								className="hover:text-[#8B3958] transition-colors"
							>
								<h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.variant?.product?.name}</h3>
							</LinkWithChannel>
							<div className="mt-1 space-y-0.5">
								{item.variant.name !== item.variant.id && Boolean(item.variant.name) && (
									<p className="text-xs text-gray-600">Size: {item.variant.name}</p>
								)}
								{item.variant?.product?.category?.name && (
									<p className="text-xs text-gray-600">Material: {item.variant.product.category.name}</p>
								)}
							</div>
						</div>

						{/* Delete Button - Top Right */}
						<DeleteLineButton
							checkoutId={checkoutId}
							lineId={item.id}
							onRemove={() => {
								void fetchCheckout()
								setItems((prev) => prev.filter((line) => line.id !== item.id))
							}}
						/>
					</div>


					{/* Mobile Price Row - Simplified */}
					<div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
						<div>
							<div className="text-xs text-gray-500 mb-1">Unit Price</div>
							<div className="text-sm font-medium text-gray-900">{formatMoney(unitPrice, currency)}</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-gray-500 mb-1">Quantity: {item.quantity}</div>
							<div className="text-sm font-medium text-gray-900">{formatMoney(totalPrice, currency)}</div>
						</div>
					</div>
					{/* Mobile Savings Badge */}
					{hasItemDiscount && itemSavings > 0 && (
						<div className="flex justify-center mb-3">
							<div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
								Save {formatMoney(itemSavings, currency)} ({Math.floor((itemSavings / totalPrice) * 100)}%)
							</div>
						</div>
					)}



					<div className="flex items-start justify-end space-x-2 mb-3 ">
						<div className="flex p-1 items-center justify-between bg-slate-100 rounded-md">
							<button
								type="button"
								onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.variant.id, printingTechnology as PrintingTechnology, currentMetadata)}
								className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
								disabled={item.quantity <= 1}
							>
								−
							</button>
							<div className="mx-2">
								<QuantityInput item={item} handleQuantityChange={(id, quantity) => handleQuantityChange(id, quantity, item.variant.id, printingTechnology as PrintingTechnology, currentMetadata)} />
							</div>
							<button
								type="button"
								onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.variant.id, printingTechnology as PrintingTechnology, currentMetadata)}
								className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-white hover:shadow-sm transition-all"
							>
								+
							</button>
						</div>
					</div>

					{/* Mobile Quantity Control */}
					<div className="space-y-3 flex flex-1 items-center justify-end">
						{/* Mobile Action Buttons */}
						{(Array.isArray(item.metadata) && item.metadata.length > 0) || (Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0) ? (
							<div className="flex items-center justify-center gap-2">

								{Array.isArray(item.metadata) && item.metadata.length > 0 && (
									<ViewDesignButton lineId={item.id} checkout={checkoutId} params={params} metadata={item.metadata} />
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
							</div>
						) : null}
					</div>
				</div>

				{/* Desktop Layout */}
				<div className="hidden sm:block">
					<div className="flex items-start gap-4">
						{/* Product Image */}
						<div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
							{item.variant?.media && (
								<Image
									src={item.variant.media[0].url || ""}
									alt={item.variant.media[0].alt ?? ""}
									fill
									loading="lazy"
									className="object-contain object-center"
								/>
							)}
						</div>

						{/* Product Info */}
						<div className="flex-1 min-w-0">
							<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
								{/* Left: Product Name and Details */}
								<div className="flex-1">
									<LinkWithChannel
										href={getHrefForVariant({
											productSlug: item.variant.product.slug,
											variantId: item.variant.id,
										})}
										className="hover:text-[#8B3958] transition-colors"
									>
										<h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.variant?.product?.name}</h3>
									</LinkWithChannel>
									<div className="mt-1 space-y-0.5">
										{item.variant.name !== item.variant.id && Boolean(item.variant.name) && (
											<p className="text-xs text-gray-600">Size: {item.variant.name}</p>
										)}
										{item.variant?.product?.category?.name && (
											<p className="text-xs text-gray-600">Material: {item.variant.product.category.name}</p>
										)}
									</div>
								</div>

								{/* Right: Price Info - With Discount Display */}
								<div className="text-right flex-shrink-0">
									<div className="text-xs text-gray-500 mb-1">Unit: {formatMoney(unitPrice, currency)}</div>
									<div className="text-lg font-bold text-black">{formatMoney(totalPrice, currency)}</div>
									{hasItemDiscount && itemSavings > 0 && (
										<div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
											Save {formatMoney(itemSavings, currency)} ({Math.floor((itemSavings / totalPrice) * 100)}%)
										</div>
									)}
								</div>
							</div>

							{/* Quantity Control Row */}
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-gray-100 gap-3">
								{/* Quantity Control */}
								<div className="flex items-center space-x-2">
									<button
										type="button"
										onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.variant.id, printingTechnology as PrintingTechnology, currentMetadata)}
										className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										disabled={item.quantity <= 1}
									>
										−
									</button>
									<QuantityInput item={item} handleQuantityChange={(id, quantity) => handleQuantityChange(id, quantity, item.variant.id, printingTechnology as PrintingTechnology, currentMetadata)} />
									<button
										type="button"
										onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.variant.id, printingTechnology as PrintingTechnology, currentMetadata)}
										className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
									>
										+
									</button>
									<span className="text-xs text-gray-500 ml-2">units</span>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2 flex-wrap">
									{Array.isArray(item.metadata) && item.metadata.length > 0 && (
										<ViewDesignButton lineId={item.id} checkout={checkoutId} params={params} metadata={item.metadata} />
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
										onRemove={() => {
											void fetchCheckout()
											setItems((prev) => prev.filter((line) => line.id !== item.id))
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const cartTotals = useMemo(() => {
		let totalRetail: number = 0;
		let totalMember: number = 0;
		let totalDiscount: number = 0;
		let totalQuantity: number = 0;
		let totalServicesPrice: number = 0;
		let currency: string = items[0]?.totalPrice.gross.currency || "USD";
		let hasAnyDiscount = false;

		items.forEach((line) => {
			const info = parsePricingInfoFromMetadata(line);

			console.log(line)
			// Calculate service price for this line
			const serviceDetail = line.metadata?.find((meta) => meta.key === "service_detail");
			let serviceDetailPrice = 0;
			if (serviceDetail && serviceDetail.value) {
				try {
					const parsedValue = JSON.parse(serviceDetail.value) as { price: number, name: string }[];
					serviceDetailPrice = parsedValue.reduce((sum, item) => sum + item.price, 0) * line.quantity;
				} catch {
					serviceDetailPrice = 0;
				}
			}

			if (info) {
				// Use pricing info when available
				const lineRetailPrice = info.retail_price * line.quantity;
				const lineMemberPrice = info.member_price * line.quantity;

				totalRetail += lineRetailPrice;
				totalMember += lineMemberPrice;
				totalDiscount += lineRetailPrice - lineMemberPrice;
				totalQuantity += line.quantity;
				currency = info.currency || currency;

				if (info.has_discount && info.retail_price > info.member_price) {
					hasAnyDiscount = true;
				}
			} else {
				// Fallback to line total price when no pricing info
				const linePrice = line.totalPrice.gross.amount;
				totalRetail += linePrice;
				totalMember += linePrice;
				totalQuantity += line.quantity;
				currency = line.totalPrice.gross.currency || currency;
			}

			// Add service price to totals
			totalServicesPrice += serviceDetailPrice;
		});

		// Add services price to both retail and member totals
		totalRetail += totalServicesPrice;
		totalMember += totalServicesPrice;

		return { totalRetail, totalMember, totalDiscount, totalQuantity, totalServicesPrice, currency, hasAnyDiscount };
	}, [items]);

	return (
		<Wrapper className="mx-auto min-h-screen py-2 sm:py-4 px-2 sm:px-4">
			<ToastContainer />
			{!checkout || !items || items.length < 1 ? (
				!loading ? (
					<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 text-center mx-2 sm:mx-0">
						<div className="max-w-md mx-auto">
							<div className="text-gray-400 mb-4">
								<svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8l1 5h10M9 19v1a1 1 0 001 1h1a1 1 0 001-1v-1" />
								</svg>
							</div>
							<h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
							<p className="text-sm sm:text-base text-gray-600 mb-6">
								Looks like you haven&apos;t added any items to the cart yet.
							</p>
							<LinkWithChannel
								href="/products"
								className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-[#8B3958] hover:bg-[#7A314F] transition-colors"
							>
								Explore products
							</LinkWithChannel>
						</div>
					</div>
				) : (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B3958]"></div>
					</div>
				)
			) : (
				<div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">

					{/* Left Side - Cart Items */}
					<div className="lg:col-span-2">
						{/* Mobile Header */}
						<div className="block sm:hidden mb-4">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
							<p className="text-sm text-gray-600">({cartTotals.totalQuantity}) Items</p>
						</div>

						{/* Desktop Header */}
						<div className="hidden sm:flex items-center justify-between mb-8">
							<h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
							<p className="text-base font-light text-gray-900">({cartTotals.totalQuantity}) Items</p>
						</div>

						<div className="space-y-3 sm:space-y-4">
							{items.map(renderCartItem)}
						</div>
					</div>

					{/* Right Side - Order Summary */}
					<div className="lg:col-span-1 order-first lg:order-last">
						{/* Mobile Order Summary - Fixed at top */}
						<div className="lg:sticky lg:top-8">
							{/* Order Summary */}
							<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 mb-6">
								<h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>

								<div className="space-y-2 sm:space-y-3">
									{/* Subtotal (Base Product Prices) */}
									<div className="flex justify-between text-sm sm:text-base text-gray-600">
										<span>Subtotal ({cartTotals.totalQuantity} items)</span>
										<span className="font-medium">{formatMoney(cartTotals.totalMember - cartTotals.totalServicesPrice + cartTotals.totalDiscount, cartTotals.currency)}</span>
									</div>

									{/* Additional Services */}
									{cartTotals.totalServicesPrice > 0 && (
										<div className="flex justify-between text-sm sm:text-base text-gray-600">
											<span>Additional Services</span>
											<span className="font-medium">{formatMoney(cartTotals.totalServicesPrice, cartTotals.currency)}</span>
										</div>
									)}

									{/* Member Discount - Show if user has discount */}
									{cartTotals.hasAnyDiscount && cartTotals.totalDiscount > 0 && (
										<div className="flex justify-between text-sm sm:text-base text-green-600 font-medium">
											<span>Member Discount</span>
											<span>-{formatMoney(cartTotals.totalDiscount, cartTotals.currency)}</span>
										</div>
									)}

									<hr className="my-3 sm:my-4" />
									{/* Total */}
									<div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
										<span>Total</span>
										<span className="text-[#B12704]">{formatMoney(cartTotals.totalMember, cartTotals.currency)}</span>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="mt-4 sm:mt-6 space-y-3">
									<CheckoutLink
										checkoutId={checkoutId}
										disabled={!checkout.lines.length}
										channel={params.channel}
										className="w-full py-2 sm:py-3 text-base sm:text-lg font-semibold"
										includePrintingTechnology={handleCheckOrderIncludeValue(items, PrintingTechnology.Silk)}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
			}

		</Wrapper >
	);
}
