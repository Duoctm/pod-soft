import { type FC } from "react";
import { Loader2, Receipt, Tag, Truck } from "lucide-react";
import { SummaryItem, type SummaryLine } from "./SummaryItem";
import { PromoCodeAdd } from "./PromoCodeAdd";
import { SummaryPromoCodeRow } from "./SummaryPromoCodeRow";
import { SummaryItemMoneyEditableSection } from "./SummaryItemMoneyEditableSection";
import { ChevronDownIcon } from "@/checkout/ui-kit/icons";
import { Divider, Money, Title } from "@/checkout/components";
import {
	type Money as MoneyType,
	type CheckoutLineFragment,
	type GiftCardFragment,
} from "@/checkout/graphql";
import { SummaryItemMoneySection } from "@/checkout/sections/Summary/SummaryItemMoneySection";
import { type GrossMoney, type GrossMoneyWithTax } from "@/checkout/lib/globalTypes";


interface SummaryProps {
	id: string;
	editable?: boolean;
	lines: SummaryLine[];
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
function parsePricingInfo(metadata: { key: string; value: string }[]): PricingInfo | null {
	const item = metadata.find((m) => m.key === "pricing_info");
	if (!item) return null;
	try {
		// Some APIs may use single quotes, so replace with double quotes for JSON.parse
		const value = item.value.replace(/'/g, '"');
		const parsed = JSON.parse(value) as Record<string, unknown>;
		// Type guard
		if (
			typeof parsed.member_price === "number" &&
			typeof parsed.retail_price === "number" &&
			typeof parsed.discount_percentage === "number" &&
			typeof parsed.currency === "string" &&
			typeof parsed.has_discount === "boolean" &&
			typeof parsed.quantity === "number"
		) {
			return parsed as unknown as PricingInfo;
		}
		return null;
	} catch {
		return null;
	}
}

// Aggregate pricing info from all lines
function aggregatePricing(lines: SummaryLine[]) {

	let totalRetail = 0; // giá gốc
	let totalMember = 0;
	let totalSavings = 0;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let totalQuantity = 0;
	let discountPercent = 0;
	let currency = "";
	let hasDiscount = false;

	lines.forEach((line) => {


		totalRetail = line.totalPrice.gross.amount
		totalMember += line.unitPrice.gross.amount * line.quantity;
		totalSavings += ((line.undiscountedUnitPrice.amount - line.unitPrice.gross.amount) * line.quantity);
		totalQuantity += line.quantity;


		// Use type assertion to access metadata if it exists
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		const metadata = (line as any).metadata;
		if (!line || !Array.isArray(metadata)) return;


		const info = parsePricingInfo(metadata as { key: string; value: string }[]);

		if (info) {
			// totalRetail += info.retail_price * info.quantity;

			// totalSavings += (info.retail_price - info.member_price) * info.quantity;

			discountPercent = info.discount_percentage; // Use last, or could average if needed
			currency = info.currency;
			if (info.has_discount) hasDiscount = true;
		}
	});
	return { totalRetail, totalMember, totalSavings, discountPercent, currency, hasDiscount };
}




interface PricingInfo {
	member_price: number;
	retail_price: number;
	discount_percentage: number;
	currency: string;
	has_discount: boolean;
	color?: string;
	quantity: number;
}

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




	const { totalRetail, totalSavings, currency } = aggregatePricing(lines);
	const saleDiscount = totalSavings;
	const voucherDiscount = discount?.amount || 0;


	const totalSavingsAmount = saleDiscount + voucherDiscount + (shippingPrice?.gross?.amount || 0);



	// const hanlePriceBeforeAddVoucher = (priceGross: MoneyType, voucherDiscount: number) => {
	// 	if (!voucherCode) return priceGross;
	// 	return {
	// 		...priceGross,
	// 		amount: priceGross.amount + voucherDiscount,
	// 	};
	// };


	return (
		<div className="flex flex-col">
			<details open className="group">
				<summary className="-mb-2 flex cursor-pointer flex-row items-center pt-4">
					<Title>Summary</Title>
					<ChevronDownIcon className="mb-2 group-open:rotate-180" />
				</summary>
				<ul className="py-2" data-testid="SummaryProductList">
					{lines.map((line: CheckoutLineFragment) => (
						<SummaryItem line={line} key={line?.id}>
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
					))}
				</ul>
			</details>
			{editable && (
				<>
					<PromoCodeAdd id={id} update={update} />
					<Divider className="mt-4" />
				</>
			)}
			<div className="mt-4 flex max-w-full flex-col gap-2">
				{/* 1. Original Price */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Receipt className="w-4 h-4 text-gray-500" />
						<span className="text-sm text-gray-700">Original Price</span>
					</div>
					<span className="text-base font-medium text-gray-900">
						<Money money={{ amount: totalRetail + (discount?.amount ?? 0), currency }} ariaLabel="original price" />
					</span>
				</div>


				{/* 2. Discount */}
				{saleDiscount > 0 && (
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Tag className="w-4 h-4 text-gray-500" />
							<span className="text-sm text-gray-700">Discount</span>
						</div>
						<span className="text-base font-semibold text-red-600 flex items-center">
							-<Money money={{ amount: saleDiscount, currency }} ariaLabel="discount" />
						</span>
					</div>
				)}

				{/* 3. Voucher */}
				{voucherCode && (
					<SummaryPromoCodeRow
						id={id}
						className="font-semibold text-[#8B3958]"
						editable={editable}
						promoCode={voucherCode}
						ariaLabel="voucher"
						label={`Voucher: ${voucherCode}`}
						money={discount}
						update={update}
						negative
					/>
				)}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Truck className="w-4 h-4 text-gray-500" />
						<span className="text-sm text-gray-700">Shipping Cost</span>
					</div>
					<span className="text-base text-gray-900">
						<Money money={shippingPrice?.gross} ariaLabel="shipping cost" />
					</span>
				</div>
				{/* 5. Tax */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Receipt className="w-4 h-4 text-gray-500" />
						<span className="text-sm text-gray-700">Tax</span>
					</div>
					<span className="text-base text-gray-900">
						<Money ariaLabel="tax" money={totalPrice?.tax} data-testid="totalOrderPrice" />
					</span>
				</div>
				<Divider className="mb-2" />
				{totalSavingsAmount > 0 && (
					<div className="flex items-center justify-between">
						<span className="text-sm">Total Savings</span>
						<span className="text-lg font-bold  flex items-baseline">
							<span className="mr-1">-</span><Money money={{ amount: totalSavingsAmount, currency }} ariaLabel="total savings" />
						</span>
					</div>

				)}


				{/* 7. Subtotal */}
				<div className="flex flex-row items-baseline justify-between pb-4">
					<div className="flex flex-row items-baseline">
						<p className="text-sm">Total</p>
					</div>
					<Money
						className="font-bold text-[#8B3958] text-2xl"
						ariaLabel="subtotal"
						money={totalPrice?.gross || subtotalPrice?.gross}
						data-testid="totalOrderPrice"
					/>
				</div>
			</div>
			{
				show ? (
					<button
						onClick={onPlaceOrder}
						type="submit"
						className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading
							? "cursor-not-allowed bg-gray-400 hover:bg-gray-500 focus:ring-gray-500 "
							: "bg-[#F58A71] text-white hover:bg-[#F58A71]/60 focus:ring-[#F58A71] "
							}`}
						disabled={loading}
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading...
							</>
						) : (
							"Place Order"
						)}
					</button>
				) : null
			}
		</div >
	);
};

