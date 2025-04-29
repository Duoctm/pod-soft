import * as yup from "yup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { type CheckoutLineFragment } from "@/checkout/graphql";
import { checkoutLineUpdateServer } from "@/checkout/hooks/useCheckoutLineUpdateServer";
import { type CheckoutLineUpdateMutationVariables } from "@/gql/graphql";

interface SummaryItemMoneyEditableSectionProps {
	id: string;
	line: CheckoutLineFragment;
	update: () => void;
}

const validationSchema = yup.object().shape({
	quantity: yup
		.number()
		.required("Please enter the quantity")
		.integer("Quantity must be an integer")
		.min(0, "The quantity must be at least 0")
		.typeError("Quantity must be a number"),
});

export const SummaryItemMoneyEditableSection: React.FC<SummaryItemMoneyEditableSectionProps> = ({ id, line, update }) => {
	const [quantity, setQuantity] = useState(() => `${line.quantity}`);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		validationSchema
			.validate({ quantity: quantity })
			.then(() => setError(null))
			.catch((err) => {
				if (err instanceof yup.ValidationError) setError(err.message);
			});
	}, [quantity]);

	const handleBlur = async () => {
		if (!id || !line) return null;
		const updateLine = await checkoutLineUpdateServer({
			id: id,
			lineId: line.id,
			quantity: parseInt(quantity, 10),
		} as CheckoutLineUpdateMutationVariables);
		const checkout = updateLine?.checkoutLinesUpdate?.checkout;
		if (checkout && checkout?.lines && checkout?.lines?.length === 0) {
			toast.error("The cart is empty. Please add items to the cart.");
			setTimeout(function () {
				window.location.href = `/`;
			}, 2000);
		} else {
			update();
		}
	};

	return (
		<div className="flex flex-col items-end gap-2">
			<div className={`flex flex-col space-y-2 font-sans`}>
				<div className="flex items-center space-x-2">
					<input
						id="quantity-input"
						type="number"
						value={quantity}
						onChange={(e) => setQuantity(e.target.value)}
						onBlur={handleBlur}
						className={`w-24 border px-3 py-1.5 ${
							error ? "border-red-500" : "border-gray-300"
						} rounded-md text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100`}
						min="0"
						step="1"
					/>
				</div>
				{error && (
					<p id="quantity-error" className="mt-1 w-24 text-xs text-red-600">
						{error}
					</p>
				)}
			</div>
		</div>
	);
};
