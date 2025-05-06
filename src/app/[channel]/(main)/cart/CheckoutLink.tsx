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
			className={`inline-block max-w-full rounded border border-transparent bg-neutral-900 px-6 py-3 text-center font-medium text-neutral-50 hover:cursor-pointer hover:bg-neutral-800 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-500 sm:px-16 ${className}`}
		>
			Checkout
		</a>
	);
};
