import React, { useTransition } from "react";
import { toast, ToastContainer } from "react-toastify";
import { SummaryMoneyRow, type SummaryMoneyRowProps } from "./SummaryMoneyRow";
import { IconButton } from "@/checkout/components/IconButton";
import { RemoveIcon } from "@/checkout/ui-kit/icons";
import "react-toastify/dist/ReactToastify.css";
import { removePromodeCode } from "@/checkout/hooks/useRemovePromodeCode";

interface SummaryPromoCodeRowProps extends SummaryMoneyRowProps {
	promoCode?: string;
	promoCodeId?: string;
	editable: boolean;
	id: string;
	update: () => void;	
}

export const SummaryPromoCodeRow: React.FC<SummaryPromoCodeRowProps> = ({
	promoCode,
	update,
	promoCodeId,
	editable,
	id,
	...rest
}) => {

	const [isPending, startTransition] = useTransition();

	const handleDelete =  () => {
		if (isPending) return;
		startTransition(() => {
			removePromodeCode(id, promoCode as string);
		});
		toast.success("Promo code removed successfully");
		update();	
	};

	return (
		<SummaryMoneyRow {...rest}>
			<ToastContainer />
			{editable && (
				<div>
					<IconButton
						onClick={handleDelete}
						ariaLabel="remove promo code"
						icon={<RemoveIcon aria-hidden />}
					/>
				</div>
			)}
		</SummaryMoneyRow>
	);
};
