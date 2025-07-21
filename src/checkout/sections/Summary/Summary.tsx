import { type FC } from "react";
import { Loader2, Tag, ChevronDown, ShoppingCart, Calculator } from "lucide-react";
import { SummaryItem } from "./SummaryItem";
import { PromoCodeAdd } from "./PromoCodeAdd";

import { SummaryItemMoneyEditableSection } from "./SummaryItemMoneyEditableSection";
import { Money, } from "@/checkout/components";
import {
	type GiftCardFragment,
	type CheckoutLine,
	type Money as MoneyType,
} from "@/checkout/graphql";
import { SummaryItemMoneySection } from "@/checkout/sections/Summary/SummaryItemMoneySection";
import { type GrossMoney, type GrossMoneyWithTax } from "@/checkout/lib/globalTypes";
import { type PrintInfo } from "@/app/[channel]/(main)/cart/CartPage";

interface SummaryProps {
	id: string;
	editable?: boolean;
	lines: CheckoutLine[];
	totalPrice?: GrossMoneyWithTax;
	subtotalPrice?: GrossMoney;
	giftCards?: GiftCardFragment[];
	voucherCode?: string | null;
	discount?: MoneyType | null;
	shippingPrice: GrossMoney;
	update: () => void;
	onPlaceOrder: () => void;
	show?: boolean;
	loading?: boolean;
}

// Parse pricing_info from metadata safely
// function parsePricingInfo(metadata: { key: string; value: string }[]): PricingInfo | null {
// 	const item = metadata.find((m) => m.key === "pricing_info");
// 	if (!item) return null;
// 	try {
// 		const value = item.value.replace(/'/g, '"');
// 		const parsed = JSON.parse(value) as Record<string, unknown>;
// 		if (
// 			typeof parsed.member_price === "number" &&
// 			typeof parsed.retail_price === "number" &&
// 			typeof parsed.discount_percentage === "number" &&
// 			typeof parsed.currency === "string" &&
// 			typeof parsed.has_discount === "boolean" &&
// 			typeof parsed.quantity === "number"
// 		) {
// 			return parsed as unknown as PricingInfo;
// 		}
// 		return null;
// 	} catch {
// 		return null;
// 	}
// }

// Aggregate pricing info from all lines
function aggregatePricing(lines: CheckoutLine[]) {
	let totalRetail = 0;
	let totalMember = 0;
	let totalSavings = 0;
	// let totalQuantity = 0;
	const discountPercent = 0;
	let currency = "";
	const hasDiscount = false;
	let printingPrice = 0;
	let totalService = 0;
	let basePrice = 0;

	lines.forEach((line) => {
		const printing = line.metadata?.find((meta) => meta.key === "printing");
		const validJson = printing?.value.replace(/'/g, '"') as string;
		const parsePrinting: PrintInfo | null = printing ? (JSON.parse(validJson) as PrintInfo) : null;
		const { breakdown: { line_services: lineServices }, final_unit_price, base_price } = parsePrinting!;

		const servicePRice = lineServices.reduce((total, service) => {
			const cost = parseFloat(service.total_cost) || 0;
			return total + cost;
		}, 0);

		totalService += servicePRice;
		basePrice += Number(base_price) * line.quantity;


		currency = line.unitPrice.gross.currency;
		printingPrice += (Number(final_unit_price) * line.quantity) - servicePRice;

		totalRetail += line.undiscountedUnitPrice.amount * line.quantity;
		totalMember += line.unitPrice.gross.amount * line.quantity;
		console.log(line.undiscountedUnitPrice.amount - line.unitPrice.gross.amount);
		if (line.undiscountedUnitPrice.amount > line.unitPrice.gross.amount / line.quantity) {
			totalSavings += ((line.undiscountedUnitPrice.amount - line.unitPrice.gross.amount) * line.quantity);
		}
		// totalQuantity += line.quantity;

		// const metadata = (line as any).metadata;
		// if (!line || !Array.isArray(metadata)) return;

		// const info = parsePricingInfo(metadata as { key: string; value: string }[]);

		// if (info) {
		// 	discountPercent = info.discount_percentage;
		// 	if (info.has_discount) hasDiscount = true;
		// }
	});
	return { totalRetail, totalMember, totalSavings, discountPercent, currency, hasDiscount, printingPrice, totalService, basePrice };
}

// interface PricingInfo {
// 	member_price: number;
// 	retail_price: number;
// 	discount_percentage: number;
// 	currency: string;
// 	has_discount: boolean;
// 	color?: string;
// 	quantity: number;
// }

export const Summary: FC<SummaryProps> = ({
	id,
	editable = true,
	lines,
	totalPrice,
	subtotalPrice,
	voucherCode,
	shippingPrice,
	discount,
	update,
	loading,
	onPlaceOrder,
	show
}) => {
	const { currency, printingPrice, totalService, basePrice } = aggregatePricing(lines);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r bg-[#F58A71]/40 px-6 py-4 border-b border-gray-100">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
						<Calculator className="w-4 h-4 text-[#F58A71]" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
				</div>
			</div>

			<div className="p-4">
				{/* Items List */}
				<details open className="group mb-2">
					<summary className="flex cursor-pointer items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
						<div className="flex items-center gap-2">
							<ShoppingCart className="w-4 h-4 text-gray-600" />
							<span className="font-medium text-gray-800">Items ({lines.length})</span>
						</div>
						<ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" />
					</summary>

					<div className="mt-2 space-y-3">
						{lines.map((line) => (
							<div key={line?.id} className="bg-gray-50 rounded-lg px-4 py-2">
								<SummaryItem line={line}>
									{editable ? (
										<SummaryItemMoneyEditableSection
											line={line}
											id={id}
											update={update}
										/>
									) : (
										<SummaryItemMoneySection line={line} />
									)}
								</SummaryItem>
							</div>
						))}
					</div>
				</details>

				{/* Promo Code Section */}
				{editable && (
					<div className="mb-6">
						<PromoCodeAdd id={id} update={update} />
					</div>
				)}

				{/* Price Breakdown */}
				<div className="space-y-4 mb-6">
					<div className="bg-gray-50 rounded-lg p-4 space-y-3">
						{/* Base Price */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-blue-400 rounded-full"></div>
								<span className="text-sm text-gray-600">Base Price</span>
							</div>
							<span className="font-medium">
								<Money money={{ amount: Number(basePrice), currency }} ariaLabel="base price" />
							</span>
						</div>

						{/* Printing Price */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-400 rounded-full"></div>
								<span className="text-sm text-gray-600">Printing Price</span>
							</div>
							<span className="font-medium">
								<Money money={{ amount: Number(printingPrice) + (discount?.amount ?? 0), currency }} ariaLabel="printing price" />
							</span>
						</div>

						{/* Service Fee */}
						{totalService > 0 && (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-purple-400 rounded-full"></div>
									<span className="text-sm text-gray-600">Total Service</span>
								</div>
								<span className="font-medium">
									<Money money={{ amount: totalService, currency }} ariaLabel="service fee" />
								</span>
							</div>
						)}

						{/* Voucher */}
						{voucherCode && (
							<div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100">
								<div className="flex items-center gap-2">
									<Tag className="w-4 h-4 text-red-500" />
									<span className="text-sm text-red-700 font-medium">Voucher: {voucherCode}</span>
								</div>
								<span className="font-semibold text-red-600 flex">
									-<Money money={discount} ariaLabel="voucher discount" />
								</span>
							</div>
						)}

						{/* Shipping */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-orange-400 rounded-full"></div>
								<span className="text-sm text-gray-600">Shipping</span>
							</div>
							<span className="font-medium">
								<Money money={shippingPrice?.gross} ariaLabel="shipping cost" />
							</span>
						</div>

						{/* Tax */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
								<span className="text-sm text-gray-600">Tax</span>
							</div>
							<span className="font-medium">
								<Money money={totalPrice?.tax} ariaLabel="tax" />
							</span>
						</div>
					</div>
				</div>

				{/* Total */}
				<div className="bg-gradient-to-r bg-[#F58A71]/40 rounded-lg p-4 border border-blue-100">
					<div className="flex items-center justify-between">
						<span className="text-lg font-semibold text-gray-800">Total Amount</span>
						<Money
							className="text-2xl font-bold text-black"
							money={totalPrice?.gross || subtotalPrice?.gross}
							ariaLabel="total amount"
						/>
					</div>
				</div>

				{/* Place Order Button */}
				{show && (
					<button
						onClick={onPlaceOrder}
						type="submit"
						className={`w-full mt-6 flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-semibold shadow-lg transition-all duration-200 ${loading
							? "cursor-not-allowed bg-gray-300 text-gray-500"
							: "bg-gradient-to-r bg-[#F58A71] text-white  hover:bg-[#ee795f] hover:shadow-xl transform hover:-translate-y-0.5"
							}`}
						disabled={loading}
					>
						{loading ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								Processing Order...
							</>
						) : (
							<>
								<ShoppingCart className="w-5 h-5" />
								Purchase
							</>
						)}
					</button>
				)}
			</div>
		</div>
	);
};