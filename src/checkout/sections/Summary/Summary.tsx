import { type FC } from "react";
import clsx from "clsx";
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
			className={clsx(
				"z-0 flex h-fit w-full flex-col",
				"before:fixed before:bottom-0 before:left-1/2 before:top-0 before:-z-10 before:w-1/2 before:border-l before:border-neutral-200 before:bg-neutral-50 before:content-none before:lg:content-['']",
			)}
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
		</div>
	);
};
