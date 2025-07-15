"use client";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { checkoutValidate } from "../../../checkoutValidate";
import { ErrorDialogPlaceOrder } from "../../../ErrorDialogPlaceOrder";
import { createSupport } from "../support/actions/create-support";
import { checkout } from "./updateDefaultAddressServerFunc";
import { cn } from "@/lib/utils";
import { CheckoutErrorCode, SupportTypeEnum } from "@/gql/graphql";
import { DialogWarningOrder } from "@/ui/components/DialogWarringOrder";
import { getUser } from "@/actions/user";

type Props = {
	disabled?: boolean;
	checkoutId?: string;
	className?: string;
	channel?: string;
	includePrintingTechnology?: boolean;
};

export type InfoSupport = {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	company: string;
	address: string;
	details: string;
	metadata: { key: string; value: string }[] | null;
	supportType: SupportTypeEnum;
};


export const CheckoutLink = ({
	disabled,
	checkoutId,
	className = "",
	channel,
	includePrintingTechnology,
}: Props) => {


	const [errorDialogOpen, setErrorDialogOpen] = useState(false);
	const [openDialogWarningOrder, setOpenDialogWarningOrder] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingWarning, setLoadingWarning] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [infoSupport, setInfoSupport] = useState<InfoSupport>({
		firstName: "",
		lastName: "",
		email: "",
		phoneNumber: "",
		company: "",
		address: "",
		details: "",
		metadata: null,
		supportType: SupportTypeEnum.OrderIssue,
	});
	useEffect(() => {
		const initialSupportInfo = async () => {
			const user = await getUser();

			const metadata = {
				key: "checkout_id",
				value: checkoutId || "",
			}

			setInfoSupport({
				firstName: user?.firstName || "",
				lastName: user?.lastName || "",
				email: user?.email || "",
				phoneNumber: "",
				company: "",
				address: "",
				details: errorMessage,
				metadata: [metadata],
				supportType: SupportTypeEnum.OrderIssue,
			});

		}
		void initialSupportInfo();

	}, [checkoutId, errorMessage]);



	const handleClick = async () => {
		if (disabled || loading) return;

		setLoading(true);

		if (includePrintingTechnology) {
			setErrorMessage(
				"Your order contains a request for SILK printing technology. Our team will evaluate it and respond with a tailored quote as soon as possible."
			);
			setOpenDialogWarningOrder(true);
			setLoading(false);
			return;
		}
		try {

			const validationRes = await checkoutValidate(checkoutId || "");
			const invalidError = validationRes.checkoutValidate?.errors?.find(
				(error) => error.code === CheckoutErrorCode.Invalid
			);

			if (invalidError) {
				setErrorMessage(invalidError.message || "Invalid checkout");
				setErrorDialogOpen(true);
				return;
			}

			if (!checkoutId) {
				toast.error("Checkout not found");
				return;
			}

			const checkoutRes = await checkout(checkoutId);
			if (checkoutRes?.error) {
				toast.error(checkoutRes.message || "Checkout failed");
			} else {
				window.location.href = `/checkout?checkout=${checkoutId}`;
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
			console.error("Checkout error:", error);
		} finally {
			setLoading(false);
		}
	}


	const handleOnConfirm = async () => {
		setLoadingWarning(true);
		setErrorDialogOpen(false);

		const res = await createSupport(infoSupport);
		console.log(res, "🚀 CheckoutLink.tsx:66 - res:");
		if (res?.success) {
			toast.success("Your order has been submitted. Our team will contact you soon with a tailored quote.");
		} else {
			toast.warn("Your order is currently processing, please wait.");
		}

		setOpenDialogWarningOrder(false);
		setLoadingWarning(false);
		setInfoSupport({
			firstName: "",
			lastName: "",
			email: "",
			phoneNumber: "",
			company: "",
			address: "",
			details: "",
			metadata: null,
			supportType: SupportTypeEnum.OrderIssue,
		});
		setErrorMessage("");
		setErrorDialogOpen(false);
	}

	return (
		<>
			<button
				type="button"
				data-testid="CheckoutLink"
				// aria-disabled={disabled}
				onClick={handleClick}
				className={cn(
					"flex items-center justify-center max-w-full rounded border border-transparent bg-[#F58A71] px-6 py-2 text-center font-medium text-[#FFFFFF] hover:cursor-pointer hover:bg-[#F58A71]/60 aria-disabled:cursor-not-allowed aria-disabled:bg-[#C59CAE] sm:px-16",
					className,
					{
						"opacity-50 cursor-not-allowed": disabled || loading,
						"hover:bg-[#F58A71]/60": !disabled && !loading,
					}
				)}
			>
				{loading ? <Loader2 className="animate-spin" /> : "Place Order"}
			</button>


			<ErrorDialogPlaceOrder
				message={errorMessage}
				open={errorDialogOpen}
				channel={channel || ""}
				onClose={() => setErrorDialogOpen(false)}
				onConfirm={() => setErrorDialogOpen(false)}
			/>

			<DialogWarningOrder
				infoSupport={infoSupport}
				setInfoSupport={setInfoSupport}
				loading={loadingWarning}
				message={errorMessage}
				open={openDialogWarningOrder}
				channel={channel || ""}
				onClose={() => setOpenDialogWarningOrder(false)}
				onConfirm={handleOnConfirm}
			/>
		</>
	);
};
