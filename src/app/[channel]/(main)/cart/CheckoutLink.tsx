"use client";
import { toast } from "react-toastify";
import { useState } from 'react';
import { checkoutValidate } from "../../../checkoutValidate";
import { ErrorDialogPlaceOrder } from "../../../ErrorDialogPlaceOrder"
import { checkout } from "./updateDefaultAddressServerFunc";
//import { callRefreshToken } from "../../../callRefreshToken"
//import { GetItemToServerCookie } from "../../../actions"
//import { checkTokenServerAction } from "../../../actions"

type Props = {
	disabled?: boolean;
	checkoutId?: string;
	className?: string;
	channel?: string;
};

export const CheckoutLink = ({ disabled, checkoutId, className = "", channel }: Props) => {
	const [errorDialogOpen, setErrorDialogOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	return (
		<>

			<a
				data-testid="CheckoutLink"
				aria-disabled={disabled}
				onClick={async (e) => {
					e.preventDefault();
					//const refreshTokenKey = `${process.env.NEXT_PUBLIC_SALEOR_API_URL}+saleor_auth_module_refresh_token`;
					//const refreshToken = await GetItemToServerCookie(refreshTokenKey);
					//await callRefreshToken(refreshTokenKey, refreshToken || "");

					const response = await checkoutValidate(checkoutId || "");

					const invalidError = Array.isArray(response.checkoutValidate?.errors)
						? response.checkoutValidate.errors.find((error) => error.code === "INVALID")
						: undefined;

					if (invalidError) {

						setErrorMessage(invalidError.message || "");
						setErrorDialogOpen(true);
					}


					//await checkTokenServerAction();
					else {
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
					}

				}}
				className={`inline-block max-w-full rounded border border-transparent bg-[#F58A71] px-6 py-2 text-center font-medium text-[#FFFFFF] hover:cursor-pointer hover:bg-[#F58A71] aria-disabled:cursor-not-allowed aria-disabled:bg-[#C59CAE] sm:px-16 ${className}`}
			>
				Checkout
			</a>
			<ErrorDialogPlaceOrder
				message={errorMessage}
				open={errorDialogOpen}
				channel={channel || ""}
				onClose={() => setErrorDialogOpen(false)}
				onConfirm={() => {
					setErrorDialogOpen(false);
				}}
			/>
		</>

	);
};
