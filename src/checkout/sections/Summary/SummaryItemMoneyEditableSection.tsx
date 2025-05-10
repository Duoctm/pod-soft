import * as yup from "yup";
import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
import { type CheckoutLineFragment } from "@/checkout/graphql";
// import { checkoutLineUpdateServer } from "@/checkout/hooks/useCheckoutLineUpdateServer";
// import { type CheckoutLineUpdateMutationVariables } from "@/gql/graphql";

interface SummaryItemMoneyEditableSectionProps {
	id?: string;
	line: CheckoutLineFragment;
	update?: () => void;
}

const validationSchema = yup.object().shape({
	quantity: yup
		.number()
		.required("Please enter the quantity")
		.integer("Quantity must be an integer")
		.min(0, "The quantity must be at least 0")
		.typeError("Quantity must be a number"),
});

export const SummaryItemMoneyEditableSection: React.FC<SummaryItemMoneyEditableSectionProps> = ({ line }) => {
	const [quantity, _setQuantity] = useState(() => `${line.quantity}`);
	const [_error, setError] = useState<string | null>(null);

	useEffect(() => {
		validationSchema
			.validate({ quantity: quantity })
			.then(() => setError(null))
			.catch((err) => {
				if (err instanceof yup.ValidationError) setError(err.message);
			});
	}, [quantity]);

	// const handleBlur = async () => {
	// 	if (!id || !line) return null;
	// 	const updateLine = await checkoutLineUpdateServer({
	// 		id: id,
	// 		lineId: line.id,
	// 		quantity: parseInt(quantity, 10),
	// 	} as CheckoutLineUpdateMutationVariables);
	// 	const checkout = updateLine?.checkoutLinesUpdate?.checkout;
	// 	if (checkout && checkout?.lines && checkout?.lines?.length === 0) {
	// 		toast.error("The cart is empty. Please add items to the cart.");
	// 		setTimeout(function () {
	// 			window.location.href = `/`;
	// 		}, 2000);
	// 	} else {
	// 		update();
	// 	}
	// };

	return (
		<div className="flex flex-col items-start gap-1 font-sans">
			{/* Hộp hiển thị quantity */}
			<div className="w-16 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-800 shadow-sm">
				{quantity}
			</div>
		</div>
	);
};
