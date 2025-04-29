import React from "react";
import { SummaryMoneyRow, type SummaryMoneyRowProps } from "./SummaryMoneyRow";
import { IconButton } from "@/checkout/components/IconButton";
import { RemoveIcon } from "@/checkout/ui-kit/icons";
// import { useCheckoutRemovePromoCodeMutation } from "@/checkout/graphql";
// import { useCheckout } from "@/checkout/hooks/useCheckout";
// import { isOrderConfirmationPage } from "@/checkout/lib/utils/url";
import { removePromodeCode } from "@/checkout/hooks/useRemovePromodeCode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



interface SummaryPromoCodeRowProps extends SummaryMoneyRowProps {
	promoCode?: string;
	promoCodeId?: string;
	editable: boolean;
	id: string;
}

export const SummaryPromoCodeRow: React.FC<SummaryPromoCodeRowProps> = ({
	promoCode,
	promoCodeId,
	editable,
	id,
	...rest
}) => {
	const onDelete = async () => {
		const res = await removePromodeCode(id, promoCode as string);
		if(res){
			toast.success("Remove PromodeCode successfullly")
		}
	};

	return (
		<SummaryMoneyRow {...rest}>
			<ToastContainer/>
			{editable && (
				<div>
					<IconButton onClick={onDelete} ariaLabel="remove promo code" icon={<RemoveIcon aria-hidden />} />
				</div>
			)}
		</SummaryMoneyRow>
	);
};
