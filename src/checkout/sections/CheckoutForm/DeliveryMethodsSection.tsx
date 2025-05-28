import { useState, useMemo } from "react";

import { toast } from "react-toastify";
import { Title } from "@/checkout/components/Title";
import { getFormattedMoney } from "@/checkout/lib/utils/money";
import { DeliveryMethodsSkeleton } from "@/checkout/sections/DeliveryMethods/DeliveryMethodsSkeleton";

import { updateDeliveryMethod } from "@/checkout/hooks/checkoutDeliveryMethodUpdate";

import { useUser } from "@/checkout/hooks/useUser";
import { type Checkout as CheckoutType } from "@/checkout/graphql";

interface DeliveryMethodsProps {
	checkout: CheckoutType
	update: () => void
}

export const DeliveryMethods = ({ checkout, update}: DeliveryMethodsProps) => {
	const { authenticated: user } = useUser();

	const shippingMethods = checkout?.shippingMethods || [];
	const shippingAddress = checkout?.shippingAddress || null;
	// const { values  } = useFormContext<FormValues>();
	// const [isRequireUpdateAddress, setIsRequireUpdateAddress] = useState(false);
	const [checkoutDeliveryMethodId, setCheckoutDeliveryMethodId] = useState<string>(() => {
		if (checkout?.deliveryMethod) {
			return checkout.deliveryMethod.id;
		}
		return "";
	});
 


	const deliveryMethod = useMemo(() => {
		return shippingMethods.find((method) => method.id === checkoutDeliveryMethodId);
	}, [checkoutDeliveryMethodId, shippingMethods]);


	const getSubtitle = ({ min, max }: { min?: number | null; max?: number | null }) => {
		if (!min || !max) {
			return undefined;
		}

		return `${min}-${max} business days`;
	};

	const handleChangeDeliveryMethod = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCheckoutDeliveryMethodId(e.target.value);
		// await handleSubmitAddress(values, { setSubmitting, setFieldError } as FormikHelpers<FormValues>, false);
		const updateDeliveryMethodUpdateResult = await updateDeliveryMethod({
			id: checkout?.id || "",
			deliveryMethodId: e.target.value,
		});
		if (updateDeliveryMethodUpdateResult?.checkoutDeliveryMethodUpdate?.errors.length) {
			const error = updateDeliveryMethodUpdateResult?.checkoutDeliveryMethodUpdate?.errors[0];
			toast.error(error.message);
		} else {
			toast.success("Delivery method updated successfully");
			update()
		}
	};

	if (!checkout?.isShippingRequired) {
		return null;
	}

	return (
		<div className="py-4" data-testid="deliveryMethods">
			<Title className="mb-2">Delivery methods</Title>
			{!user && !checkout && <DeliveryMethodsSkeleton />}
			{user && !shippingAddress ? (
				<p>Please fill in shipping address to see available shipping methods</p>
			) : (
				<>
					<select
						id="delivery-method-select"
						name="deliveryMethod"
						value={checkoutDeliveryMethodId}
						onChange={handleChangeDeliveryMethod}
						disabled={!shippingMethods.length}
						className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
					>
						<option value="" disabled>
							Select delivery method
						</option>
						{shippingMethods?.map((method) => (
							<option key={method.id} value={method.id}>
								{method.name} - {getFormattedMoney(method.price)}
							</option>
						))}
					</select>
					<p className="my-2 text-sm text-gray-900">
						<strong>Delivery time:</strong>{" "}
						{getSubtitle({
							min: deliveryMethod?.minimumDeliveryDays,
							max: deliveryMethod?.maximumDeliveryDays,
						})}
					</p>
				</>
			)}
		</div>
	);
};
