import { type CheckoutLineFragment } from "@/checkout/graphql";
import { SummaryItemMoneyInfo } from "@/checkout/sections/Summary/SummaryItemMoneyInfo";
import { type Money } from "@/gql/graphql";

interface LineItemQuantitySelectorProps {
	line: CheckoutLineFragment;
}

export const SummaryItemMoneySection: React.FC<LineItemQuantitySelectorProps> = ({ line }) => {
	return (
		<div className="flex flex-col items-end">
			<p>Qty: {line.quantity}</p>
			<SummaryItemMoneyInfo {...line} undiscountedUnitPrice={line.undiscountedUnitPrice as Money} />
		</div>
	);
};
