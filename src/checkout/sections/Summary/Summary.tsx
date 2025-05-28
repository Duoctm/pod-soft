import { type FC } from "react";
import { SummaryItem, type SummaryLine } from "./SummaryItem";
import { PromoCodeAdd } from "./PromoCodeAdd";
import { SummaryMoneyRow } from "./SummaryMoneyRow";
import { SummaryPromoCodeRow } from "./SummaryPromoCodeRow";
import { SummaryItemMoneyEditableSection } from "./SummaryItemMoneyEditableSection";
import { ChevronDownIcon } from "@/checkout/ui-kit/icons";
import { Divider, Money, Title } from "@/checkout/components";
import {
	type Money as MoneyType,
	type CheckoutLineFragment,
	type GiftCardFragment,
	type OrderLineFragment,
} from "@/checkout/graphql";
import { SummaryItemMoneySection } from "@/checkout/sections/Summary/SummaryItemMoneySection";
import { type GrossMoney, type GrossMoneyWithTax } from "@/checkout/lib/globalTypes";
import { Loader2 } from "lucide-react";

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

export const Summary: FC<SummaryProps> = ({
	id,
	editable = true,
	lines,
	totalPrice,
	subtotalPrice,
	giftCards = [],
	voucherCode,
	shippingPrice,
	discount,
	update,
	loading,
	onPlaceOrder,
	show
}) => {
	const hanlePriceBeforeAddVoucher = (priceGross: MoneyType, voucherDiscount: number) => {
		if (!voucherCode) return priceGross;
		return {
			...priceGross,
			amount: priceGross.amount + voucherDiscount,
		};
	};

	return (
		<div
			className="flex flex-col"
		>
			<details open className="group">
				<summary className="-mb-2 flex cursor-pointer flex-row items-center pt-4">
					<Title>Summary</Title>
					<ChevronDownIcon className="mb-2 group-open:rotate-180" />
				</summary>
				<ul className="py-2" data-testid="SummaryProductList">
					{lines.map((line) => {
						return (
							<SummaryItem line={line} key={line?.id}>
								{editable ? (
									<SummaryItemMoneyEditableSection
										line={line as CheckoutLineFragment}
										id={id}
										update={update}
									/>
								) : (
									<SummaryItemMoneySection line={line as OrderLineFragment} />
								)}
							</SummaryItem>
						);
					})}
				</ul>
			</details>
			{editable && (
				<>
					<PromoCodeAdd id={id} update={update} />
					<Divider className="mt-4" />
				</>
			)}
			<div className="mt-4 flex max-w-full flex-col">
				<SummaryMoneyRow
					label="Subtotal"
					money={hanlePriceBeforeAddVoucher(subtotalPrice?.gross as MoneyType, discount?.amount as number)}
					ariaLabel="subtotal price"
				/>
				{voucherCode && (
					<SummaryPromoCodeRow
						id={id}
						editable={editable}
						promoCode={voucherCode}
						ariaLabel="voucher"
						label={`Voucher code: ${voucherCode}`}
						money={discount}
						update={update}
						negative
					/>
				)}

				{giftCards.map(({ currentBalance, displayCode, id: grif_id }) => (
					<SummaryPromoCodeRow
						key={grif_id}
						id={id}
						editable={editable}
						promoCodeId={grif_id}
						ariaLabel="gift card"
						label={`Gift Card: •••• •••• ${displayCode}`}
						money={currentBalance}
						update={update}
						negative
					/>
				))}
				<SummaryMoneyRow label="Shipping cost" ariaLabel="shipping cost" money={shippingPrice?.gross} />
				<div className="flex flex-row items-baseline justify-between pb-4">
					<div className="flex flex-row items-baseline">
						<p>Tax</p>
					</div>
					<Money ariaLabel="total price" money={totalPrice?.tax} data-testid="totalOrderPrice" />
				</div>
				<Divider className="mb-2" />

				<div className="flex flex-row items-baseline justify-between pb-4">
					<div className="flex flex-row items-baseline">
						<p className="font-bold">Total price</p>
					</div>
					<Money
						className="font-bold text-[#8B3958]"
						ariaLabel="total price"
						money={totalPrice?.gross}
						data-testid="totalOrderPrice"
					/>
				</div>
			</div>
			{

				show ? (
					<button
					onClick={onPlaceOrder}
					type="submit"
					className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
						loading
						?  "cursor-not-allowed bg-gray-400 hover:bg-gray-500 focus:ring-gray-500 "
						:    "bg-[#8B3958] text-white hover:bg-[#7A314F] focus:ring-[#7A314F] "
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
		</div>
	);
};
