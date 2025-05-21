"use client";
import { toast } from "react-toastify";
import { checkout } from "./updateDefaultAddressServerFunc";

type Props = {
	disabled?: boolean;
	checkoutId?: string;
	className?: string;
};

export const CheckoutLink = ({ disabled, checkoutId, className = "" }: Props) => {
	return (
		<a
			data-testid="CheckoutLink"
			aria-disabled={disabled}
			onClick={async (e) => {
				e.preventDefault();
				if (!disabled) {
					if (!checkoutId) {
						toast.error("Checkout not found");
					} else {
						const response = await checkout(checkoutId);
						if (response?.error) {
							toast.error(response?.message);
						} else {
							window.location.href = `/checkout?checkout=${checkoutId}`;
						}
					}
				}
			}}
			className={`inline-block max-w-full rounded border border-transparent bg-[#8B3958] px-6 py-2 text-center font-medium text-[#FFFFFF] hover:cursor-pointer hover:bg-[#7A314F] aria-disabled:cursor-not-allowed aria-disabled:bg-[#C59CAE] sm:px-16 ${className}`}
		>
			Checkout
		</a>
	);
};
