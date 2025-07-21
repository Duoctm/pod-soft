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
import { formatMoney, formatNumber, getHrefForVariant } from "@/lib/utils";
import { PrintingTechnology, type CheckoutLine, type Checkout, type MetadataItem } from "@/gql/graphql";
import Wrapper from "@/ui/components/wrapper";
import { useDebounce } from "@/hooks/useDebounce";
import { getUser } from "@/actions/user";

export type CheckoutType = Pick<Checkout, "__typename" | "id" | "email" | "lines" | "totalPrice">;

type PrintDetail = {
	print_side: string;               // Ví dụ: "FRONT"
	face_code: string;                // Ví dụ: "FRONT"
	printing_technology: string;     // Ví dụ: "DTG"
};

export function getRandomRgba(): string {
	const r = Math.floor(Math.random() * 256); // 0 - 255
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);
	const a = 0.2; // Giới hạn alpha trong khoảng 0 - 1
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export interface PrintInfo {
	breakdown: Breakdown
	applied_at: string
	final_unit_price: string
	base_price: string
	printing_cost_per_unit: string
	services_cost_per_unit: string
}

interface Breakdown {
	sides: Side[]
	base_item: BaseItem
	line_services: LineService[]
}

interface Side {
	side: string
	rule_id: string
	technology: string
	cost_per_unit: string
	services_breakdown: any[]
	unit_printing_price: string
}

export interface LineService {
	service_id: number
	total_cost: string
	service_name: string
	cost_per_item: string
	pricing_method: string
}

interface ServiceData {
	color: string,
	mapPrice: string
}

export interface BaseItem {
	price: string
	source: string
	rule_id: string
}



export const mapService = (items: LineService[], currency: string): ServiceData[] => {
	return items.map((i: LineService) => {
		const randomColorRgba = getRandomRgba()
		const formatPrice = formatMoney(Number(i.cost_per_item), currency)

		return {
			color: randomColorRgba,
			mapPrice: `${i.service_name}  ${formatPrice}`
		}
	})


}






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
	printTechnology
}: {
	item: CheckoutLine;
	printTechnology: string | undefined
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
		if (debouncedValue !== "" && !isNaN(num) && num > 0 && num !== item.quantity) {
			handleQuantityChange(item.id, num);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if (printTechnology && printTechnology === PrintingTechnology.Silk) {
			if (Number(e.target.value) < 288) {

				toast.warning(
					"Minimum quantity for Silk is 228, Please try again",
				);
				return
			}
		}


		if (Number(e.target.value) > 100000) {
			toast.warning(
				"You’ve entered a quantity that exceeds our limit. Please contact our sales team for a better quote!",
			);
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
			className="w-16 min-w-[3rem] rounded border border-gray-200 bg-white px-2 py-1 text-center text-sm font-medium focus:border-[#8B3958] focus:outline-none focus:ring-1 focus:ring-[#8B3958]"
			max={item.variant.quantityAvailable || 9999} // Giới hạn tối đa theo stock
		/>
	);
};



export function CartPage({ params }: CartPageProps) {
	const [checkout, setCheckout] = useState<CheckoutType>(INITIAL_CHECKOUT_VALUE);
	const [items, setItems] = useState<CheckoutLine[]>([]);
	const [checkoutId, setCheckoutId] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const { calculatePricingForQuantity } = useCartPricing(params.channel);
	useEffect(() => {
		localStorage.setItem("backtrack", `/cart/`);
	}, []);

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
		async (
			lineId: string,
			newQuantity: number,
			variantId: string,
			printingTechnology?: PrintingTechnology,
			currentMetadata?: MetadataItem[],
			printTech?: string
		) => {
			if (newQuantity <= 0) return;

			console.log(printTech)

			if (printTech === "SILK" && newQuantity < 288) {
				toast.warning(
					"Minimum quantity for Silk is 228, Please try again",
				);
				return
			}

			const userData = await getUser();

			// For DTG, use None technology for pricing calculation
			const pricingTechnology =
				printingTechnology === PrintingTechnology.Dtg
					? PrintingTechnology.None
					: printingTechnology || PrintingTechnology.None;

			const result = await calculatePricingForQuantity(
				variantId,
				pricingTechnology,
				newQuantity,
				Boolean(userData),
			);
			const dataUpdate: PricingInfoUpdate = {
				retailPrice: result?.retailPrice || 0,
				memberPrice: result?.memberPrice || 0,
				discountPercentage: result?.discountPercentage || 0,
			};

			const metadataUpdate = updatePricingInfo(currentMetadata as MetadataItem[], dataUpdate);

			setLoading(true);
			try {
				await CheckoutLineUpdate({ id: checkoutId, lineId, quantity: newQuantity, metadata: metadataUpdate });
				setItems((prev) =>
					prev.map((item) =>
						item.id === lineId ? { ...item, quantity: newQuantity, metadata: metadataUpdate } : item,
					),
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
				return (
					Array.isArray(arr) &&
					arr.some(
						(info) =>
							typeof info === "object" &&
							info !== null &&
							"printing_technology" in info &&
							(info as { printing_technology?: string }).printing_technology === value,
					)
				);
			} catch {
				return false;
			}
		});
	};

	const renderCartItem = (item: CheckoutLine) => {
		console.log("🚀 CartPage.tsx:305 - item:", item);


		const currency = item.totalPrice.gross.currency || "USD";
		const { metadata } = item

		const printingTech = metadata?.find((meta) => meta.key === "print_technology")?.value.replace(/^"|"$/g, '');




		const printing = metadata?.find((meta) => meta.key === "printing");
		const validJson = printing?.value.replace(/'/g, '"') as string;
		const parsePrinting: PrintInfo | null = printing ? (JSON.parse(validJson) as PrintInfo) : null;

		const { breakdown: { line_services: lineServices, sides }, base_price, services_cost_per_unit, printing_cost_per_unit } = parsePrinting!


		const printTech = sides?.find((item) => item.technology)
		const serviceDataMapping = mapService(lineServices, currency)
		console.log("🚀 CartPage.tsx:325 - printTechnology:", printTech?.technology);

		// const sumPricePerService = lineServices.reduce((total, service) => {
		// 	const cost = parseFloat(service.cost_per_item) || 0;
		// 	return total + cost;
		// }, 0);

		const totalSumService = services_cost_per_unit



		// eslint-disable-next-line react-hooks/rules-of-hooks
		const printingTechnology = usePrintingTechnology(item.metadata);
		const currentMetadata = item.metadata;

		// giá trị từng item trước giảm
		const priceBeforeDiscount = item.undiscountedUnitPrice.amount;

		// giá sau khi tính toán 
		// const priceAfterDiscount = (item.totalPrice.gross.amount / item.quantity) - sumPricePerService;
		const priceAfterDiscount = Number(base_price)

		// before printing = 


		// tổng giá trị của item trước giảm
		// const totalPriceWithoutDiscount = (priceBeforeDiscount * item.quantity);

		// tổng giá trị của item sau giảm
		const totalPriceWithDiscount = item.totalPrice.gross.amount;
		const printingPrice = Number(printing_cost_per_unit)

		let totalSavings = 0;

		if (item.undiscountedUnitPrice.amount > item.unitPrice.gross.amount / item.quantity) {
			totalSavings += ((item.undiscountedUnitPrice.amount - item.unitPrice.gross.amount) * item.quantity);
		}
		// discount percent = (priceBeforeDiscount - priceAfterDiscount) / priceBeforeDiscount * 100
		const discountPercent = priceBeforeDiscount > 0 ? ((priceBeforeDiscount - priceAfterDiscount) / priceBeforeDiscount) * 100 : 0;


		return (
			<div key={item.id} className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">

				{/* Mobile Layout */}
				<div className="block sm:hidden">
					{/* Mobile Header Row */}
					<div className="mb-3 flex items-start gap-3">
						{/* Product Image */}
						<div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
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
						<div className="min-w-0 flex-1">
							<LinkWithChannel
								href={getHrefForVariant({
									productSlug: item.variant.product.slug,
									variantId: item.variant.id,
								})}
								className="transition-colors hover:text-[#8B3958]"
							>
								<h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900">
									{item.variant?.product?.name}
								</h3>
							</LinkWithChannel>
							<div className="mt-1 space-y-0.5">
								{item.variant.name !== item.variant.id && Boolean(item.variant.name) && (
									<p className="text-xs text-gray-600">Size: {item.variant.name}</p>
								)}
								{item.variant?.product?.category?.name && (
									<p className="text-xs text-gray-600">Material: {item.variant.product.category.name}</p>
								)}
							</div>
							<div>
								{
									printingTech ? <span className="text-xs text-gray-600">
										Print Technology: {printTech?.technology}
									</span> : printTech?.technology && (
										<p className="text-xs text-gray-600">
											Print Technology: {printTech.technology}
										</p>
									)
								}

							</div>
							<div>
								<div className="mb-1 text-xs text-gray-500">Unit Price</div>
								<div className="mb-1 text-sm text-gray-500">
									{priceBeforeDiscount > priceAfterDiscount ? <span className="line-through"> {formatMoney(priceBeforeDiscount, currency)} / </span> : null}
									{" "}
									<span className="font-bold text-[#F58A71]">{formatMoney(priceAfterDiscount, currency)}</span>
								</div>
							</div>
						</div>

						{/* Delete Button - Top Right */}
						<DeleteLineButton
							checkoutId={checkoutId}
							lineId={item.id}
							onRemove={() => {
								void fetchCheckout();
								setItems((prev) => prev.filter((line) => line.id !== item.id));
							}}
						/>
					</div>


					<p className="text-xs text-gray-600 flex text-balance items-start gap-2 flex-1">Services: <span className="font-semibold flex gap-2 flex-1 flex-wrap">
						{
							serviceDataMapping.map((i, idx) => {
								return <div key={idx}
									className="px-2 py-1 rounded-full"
									style={{
										backgroundColor: i.color
									}}
								>
									{i.mapPrice}
								</div>
							})
						}
					</span></p>
					{/* Mobile Price Row - Simplified */}
					<div className="mb-3 flex items-center justify-start border-b border-gray-100 pb-3">
						<div className="text-right ">
							<div className="py-2 text-xl font-semibold text-black flex justify-start relative flex-col flex-1 items-start">
								<div className="text-gray-500 text-sm flex flex-col items-start justify-end">
									{
										printingPrice > 0 ? <div>Printing Price {formatMoney(printingPrice, currency)}  / per unit</div> : null
									}
									Services: {formatMoney(Number(totalSumService), currency)} / per unit

									{/* {!printTechnology ? "Printing Price" : "Price "}: {formatMoney(totalPriceWithDiscount, currency)}  &nbsp;&nbsp;|&nbsp;&nbsp; Services: {formatMoney(Number(totalSumService), currency)} / per unit */}
								</div>
								<div className="mt-5 text-2xl">

									{formatMoney(Number(totalPriceWithDiscount), currency)}
								</div>
							</div>
							{
								totalSavings > 0 && (
									<div className="inline-flex items-center  text-xs font-semibold text-green-800">
										Savings (${Math.floor(totalSavings)}%)
									</div>
								)
							}
						</div>
					</div>

					<div className="mb-3 flex items-start justify-end space-x-2 ">
						<div className="flex items-center justify-between rounded-md bg-slate-100 p-1">
							<button
								type="button"
								onClick={() =>
									handleQuantityChange(
										item.id,
										item.quantity - 1,
										item.variant.id,
										printingTechnology as PrintingTechnology,
										currentMetadata,
										printingTech
									)
								}
								className="flex h-8 w-8 items-center justify-center rounded text-gray-600 transition-all hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
								disabled={item.quantity <= 1}
							>
								−
							</button>
							<div className="mx-2">
								<QuantityInput
									printTechnology={printingTech}
									item={item}
									handleQuantityChange={(id, quantity) =>
										handleQuantityChange(
											id,
											quantity,
											item.variant.id,
											printingTechnology as PrintingTechnology,
											currentMetadata,

										)
									}
								/>
							</div>
							<button
								type="button"
								onClick={() =>
									handleQuantityChange(
										item.id,
										item.quantity + 1,
										item.variant.id,
										printingTechnology as PrintingTechnology,
										currentMetadata,
										printingTech

									)
								}
								className="flex h-8 w-8 items-center justify-center rounded text-gray-600 transition-all hover:bg-white hover:shadow-sm"
							>
								+
							</button>
						</div>
						{/* Mobile Quantity Control */}
						<div className="flex flex-1 items-center justify-end space-y-3">
							{/* Mobile Action Buttons */}
							{(Array.isArray(item.metadata) && item.metadata.length > 0) ||
								(Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0) ? (
								<div className="flex items-center justify-center gap-2">
									{Array.isArray(item.metadata) &&
										item.metadata.length > 0 &&
										item.metadata?.find((item: MetadataItem) => item.key === "design")?.value != "null" && (
											<ViewDesignButton
												lineId={item.id}
												checkout={checkoutId}
												params={params}
												metadata={item.metadata}
											/>
										)}
									{Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0 && (
										<DesignButton
											variantId={item.variant.id}
											productId={item.variant.product.id}
											params={params}
											quantity={item.quantity}
											lineId={item.id}
											checkout={checkoutId}
											selectedVariantId={item.variant.id}
										/>
									)}
								</div>
							) : null}
						</div>
					</div>

				</div>

				{/* Desktop Layout */}
				<div className="hidden sm:block">
					<div className="flex items-start gap-4">
						{/* Product Image */}
						<div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
							{item.variant?.media && (
								<Image
									src={item.variant.media[0].url || ""}
									alt={item.variant.media[0].alt ?? ""}
									fill
									loading="lazy"
									className="object-contain bg-cover"
								/>
							)}
						</div>

						{/* Product Info */}
						<div className="min-w-0 flex-1">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								{/* Left: Product Name and Details */}
								<div className="flex-1">
									<LinkWithChannel
										href={getHrefForVariant({
											productSlug: item.variant.product.slug,
											variantId: item.variant.id,
										})}
										className="transition-colors hover:text-[#8B3958]"
									>
										<h3 className="text-sm font-semibold leading-tight text-gray-900">
											{item.variant?.product?.name}
										</h3>
									</LinkWithChannel>
									<div className="mt-1 space-y-0.5">
										{item.variant.name !== item.variant.id && Boolean(item.variant.name) && (
											<p className="text-xs text-gray-600">Size: <span className="font-semibold">{item.variant.name}</span></p>
										)}
										{item.variant?.product?.category?.name && (
											<p className="text-xs text-gray-600">Material:  <span className="font-semibold">{item.variant.product.category.name}</span> </p>
										)}
									</div>
									<div>
										{
											printingTech ? <span className="text-xs text-gray-600">
												Print Technology: <span className="font-semibold">{printTech?.technology}</span>
											</span> : printTech?.technology && (
												<p className="text-xs text-gray-600">
													Print Technology:  <span className="font-semibold">{printTech.technology}</span>
												</p>
											)
										}
									</div>
									<div>
										<p className="text-xs text-gray-600 flex text-balance items-start gap-2 flex-1">Services:<span className="font-semibold flex gap-2 flex-1 flex-wrap">
											{
												serviceDataMapping.map((i, idx) => {
													return <div key={idx}
														className="px-2 py-1 rounded-full"
														style={{
															backgroundColor: i.color
														}}
													>
														{i.mapPrice}
													</div>
												})
											}
										</span></p>
									</div>
								</div>

								{/* Right: Price Info - With Discount Display */}
								<div className="flex-shrink-0 text-right">
									<div className="mb-1 text-sm text-gray-500">
										{priceBeforeDiscount > priceAfterDiscount ? <span className="line-through"> {formatMoney(priceBeforeDiscount, currency)} / </span> : null}
										{" "}
										<span className="font-bold text-[#F58A71]">{formatMoney(priceAfterDiscount, currency)}</span>
									</div>
									<div className="py-2 text-2xl font-semibold text-black flex items-end relative flex-col">
										<div className="text-gray-500 text-sm flex flex-col items-end justify-end">
											{
												printingPrice > 0 ? <div>Printing Price {formatMoney(printingPrice, currency)}  / per unit</div> : null
											}
											Services: {formatMoney(Number(totalSumService), currency)} / per unit

											{/* {!printTechnology ? "Printing Price" : "Price "}: {formatMoney(totalPriceWithDiscount, currency)}  &nbsp;&nbsp;|&nbsp;&nbsp; Services: {formatMoney(Number(totalSumService), currency)} / per unit */}
										</div>
										{formatMoney(Number(totalPriceWithDiscount), currency)}
									</div>

									{
										totalSavings > 0 && (
											<div className="inline-flex items-center text-xs font-semibold text-green-800 pr-2 bg-green-100 rounded-full px-2 py-1">
												Saving (${discountPercent.toFixed(2)}%)
											</div>
										)
									}
								</div>
							</div>

							{/* Quantity Control Row */}
							<div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
								{/* Quantity Control */}
								<div className="flex items-center space-x-2">
									<button
										type="button"
										onClick={() =>
											handleQuantityChange(
												item.id,
												item.quantity - 1,
												item.variant.id,
												printingTechnology as PrintingTechnology,
												currentMetadata,
												printingTech
											)
										}
										className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={item.quantity <= 1}
									>
										−
									</button>
									<QuantityInput
										printTechnology={printingTech}
										item={item}
										handleQuantityChange={(id, quantity) =>
											handleQuantityChange(
												id,
												quantity,
												item.variant.id,
												printingTechnology as PrintingTechnology,
												currentMetadata,
											)
										}
									/>
									<button
										type="button"
										onClick={() =>
											handleQuantityChange(
												item.id,
												item.quantity + 1,
												item.variant.id,
												printingTechnology as PrintingTechnology,
												currentMetadata,
											)
										}
										className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
									>
										+
									</button>
									<span className="ml-2 text-xs text-gray-500">units</span>
								</div>

								{/* Actions */}
								<div className="flex flex-wrap items-center gap-2">
									{Array.isArray(item.metadata) &&
										item.metadata.length > 0 &&
										item.metadata?.find((item: MetadataItem) => item.key === "design")?.value != "null" && (
											<ViewDesignButton
												lineId={item.id}
												checkout={checkoutId}
												params={params}
												metadata={item.metadata}
											/>
										)}
									{Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0 && (
										<DesignButton
											variantId={item.variant.id}
											productId={item.variant.product.id}
											params={params}
											quantity={item.quantity}
											lineId={item.id}
											checkout={checkoutId}
											selectedVariantId={item.variant.id}
										/>
									)}
									<DeleteLineButton
										checkoutId={checkoutId}
										lineId={item.id}
										onRemove={() => {
											void fetchCheckout();
											setItems((prev) => prev.filter((line) => line.id !== item.id));
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
		const totalServicesPrice: number = 0;
		const currency: string = items[0]?.totalPrice.gross.currency || "USD";
		let hasAnyDiscount = false;
		let printingTechnology: string = ""
		let totalServices = 0;

		console.log("🚀 CartPage.tsx:744 - items:", items);
		items.map((line) => {


			const printing = line.metadata?.find((meta) => meta.key === "printing");
			const validJson = printing?.value.replace(/'/g, '"') as string;
			const parsePrinting: PrintInfo | null = printing ? (JSON.parse(validJson) as PrintInfo) : null;
			const { final_unit_price, services_cost_per_unit, } = parsePrinting!



			totalServices = Number(services_cost_per_unit) * line.quantity






			totalRetail += Number(final_unit_price) * line.quantity;

			if (line.undiscountedUnitPrice.amount > line.unitPrice.gross.amount / line.quantity) {
				totalDiscount += ((line.undiscountedUnitPrice.amount - line.unitPrice.gross.amount) * line.quantity);
			}
			hasAnyDiscount = totalDiscount > 0;
			totalMember += line.totalPrice.gross.amount;
			totalQuantity += line.quantity;

			const { metadata } = line
			const printingMeta = metadata?.find((meta) => meta.key === "printing_info");
			const parsePricingInfo: PrintDetail[] | null = printingMeta ? (JSON.parse(printingMeta.value) as PrintDetail[]) : null;

			printingTechnology = parsePricingInfo?.map((item) => item.printing_technology)[0] as string
		});





		// Add services price to both retail and member totals
		totalMember += totalServicesPrice;


		return {
			totalRetail,
			totalMember,
			totalDiscount,
			totalQuantity,
			totalServicesPrice,
			currency,
			hasAnyDiscount,
			printingTechnology,
			totalServices
		};
	}, [items]);

	return (
		<Wrapper className="mx-auto min-h-screen px-2 py-2 sm:px-4 sm:py-4">
			<ToastContainer />
			{!checkout || !items || items.length < 1 ? (
				!loading ? (
					<div className="mx-2 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm sm:mx-0 sm:p-8">
						<div className="mx-auto max-w-md">
							<div className="mb-4 text-gray-400">
								<svg
									className="mx-auto h-12 w-12 sm:h-16 sm:w-16"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8l1 5h10M9 19v1a1 1 0 001 1h1a1 1 0 001-1v-1"
									/>
								</svg>
							</div>
							<h2 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">Your cart is empty</h2>
							<p className="mb-6 text-sm text-gray-600 sm:text-base">
								Looks like you haven&apos;t added any items to the cart yet.
							</p>
							<LinkWithChannel
								href="/products"
								className="inline-flex items-center rounded-md border border-transparent bg-[#8B3958] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7A314F] sm:px-6 sm:py-3 sm:text-base"
							>
								Explore products
							</LinkWithChannel>
						</div>
					</div>
				) : (
					<div className="flex h-64 items-center justify-center">
						<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#8B3958]"></div>
					</div>
				)
			) : (
				<div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
					{/* Left Side - Cart Items */}
					<div className="lg:col-span-2">
						{/* Mobile Header */}
						<div className="mb-4 block sm:hidden">
							<h1 className="mb-2 text-2xl font-bold text-gray-900">Shopping Cart</h1>
							<p className="text-sm text-gray-600">({formatNumber(cartTotals.totalQuantity)}) Items</p>
						</div>

						{/* Desktop Header */}
						<div className="mb-8 hidden items-center justify-between sm:flex">
							<h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
							<p className="text-base font-light text-gray-900">
								({formatNumber(cartTotals.totalQuantity)}) Items
							</p>
						</div>

						<div className="space-y-3 sm:space-y-4">{items.map(renderCartItem)}</div>
					</div>

					{/* Right Side - Order Summary */}
					<div className="order-first lg:order-last lg:col-span-1">
						{/* Mobile Order Summary - Fixed at top */}
						<div className="lg:sticky lg:top-8">
							{/* Order Summary */}
							<div className="mb-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
								<h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">Order Summary</h2>

								<div className="space-y-2 sm:space-y-3">
									{/* Subtotal (Base Product Prices) */}
									<div className="flex justify-between text-sm text-gray-600 sm:text-base">
										<span>Subtotal ({formatNumber(cartTotals.totalQuantity)} items)</span>
										<span className="font-semibold">
											{formatMoney(cartTotals.totalRetail, cartTotals.currency)}
										</span>
									</div>

									{/* Additional Services */}
									{cartTotals.totalServicesPrice > 0 && (
										<div className="flex justify-between text-sm text-gray-600 sm:text-base">
											<span>Additional Services</span>
											<span className="font-medium">
												{formatMoney(cartTotals.totalServicesPrice, cartTotals.currency)}
											</span>
										</div>
									)}
									{cartTotals.hasAnyDiscount && cartTotals.totalDiscount > 0 && (
										<div className="flex justify-between text-sm font-medium  sm:text-base">
											<span>Total Service</span>
											<span>{formatMoney(cartTotals.totalServices, cartTotals.currency)}</span>
										</div>
									)}
									{/* Member Discount - Show if user has discount
									{cartTotals.hasAnyDiscount && cartTotals.totalDiscount > 0 && (
										<div className="flex justify-between text-sm font-medium text-green-600 sm:text-base">
											<span>Member Discount</span>
											<span>-{formatMoney(cartTotals.totalDiscount, cartTotals.currency)}</span>
										</div>
									)} */}


									<hr className="my-3 sm:my-4" />
									{/* Total */}
									<div className="flex justify-between text-lg font-bold text-gray-900 sm:text-xl">
										<span>Total</span>
										<span className="text-[#B12704]">
											{formatMoney(cartTotals.totalMember, cartTotals.currency)}
										</span>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="mt-4 space-y-3 sm:mt-6">
									<CheckoutLink
										checkoutId={checkoutId}
										disabled={!checkout.lines.length}
										channel={params.channel}
										className="w-full py-2 text-base font-semibold sm:py-3 sm:text-lg"
										includePrintingTechnology={handleCheckOrderIncludeValue(items, PrintingTechnology.Silk)}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</Wrapper>
	);
}
