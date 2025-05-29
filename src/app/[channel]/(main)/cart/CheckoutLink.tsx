"use client";
import { toast } from "react-toastify";
import { checkout } from "./updateDefaultAddressServerFunc";
import { callRefreshToken } from "../../../callRefreshToken"
import { GetItemToServerCookie } from "../../../actions"

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
				const refreshTokenKey = `${process.env.NEXT_PUBLIC_SALEOR_API_URL}+saleor_auth_module_refresh_token`;
				const refreshToken = await GetItemToServerCookie(refreshTokenKey);
				await callRefreshToken(refreshTokenKey, refreshToken || "");
				//await checkTokenServerAction();
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
