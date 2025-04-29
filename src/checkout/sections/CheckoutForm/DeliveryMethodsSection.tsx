import { useEffect, useState, useMemo } from "react";
import { type FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { Title } from "@/checkout/components/Title";
import { getFormattedMoney } from "@/checkout/lib/utils/money";
import { DeliveryMethodsSkeleton } from "@/checkout/sections/DeliveryMethods/DeliveryMethodsSkeleton";
import { type User } from "@/checkout/hooks/useUserServer";
import { type Checkout } from "@/checkout/graphql";
import { useFormContext } from "@/checkout/hooks/useForm";
import { updateDeliveryMethod } from "@/checkout/hooks/checkoutDeliveryMethodUpdate";
import { type FormValues } from "@/checkout/lib/utils/type";

type DeliveryMethodsProps = {
	user: User | null;
	checkout: Checkout | null;
	handleSubmitAddress: (
		values: FormValues,
		{ setSubmitting, setFieldError }: FormikHelpers<FormValues>,
		inAddressForm: boolean,
	) => Promise<void>;
};

export const DeliveryMethods = ({ user, checkout, handleSubmitAddress }: DeliveryMethodsProps) => {
	const shippingMethods = checkout?.shippingMethods || [];
	const shippingAddress = checkout?.shippingAddress || null;
	const { values, setSubmitting, setFieldError } = useFormContext<FormValues>();
	const [isRequireUpdateAddress, setIsRequireUpdateAddress] = useState(false);
	const [checkoutDeliveryMethodId, setCheckoutDeliveryMethodId] = useState<string>(() => {
		if (checkout?.deliveryMethod) {
			return checkout.deliveryMethod.id;
		}
		return "";
	});

	const deliveryMethod = useMemo(() => {
		return shippingMethods.find((method) => method.id === checkoutDeliveryMethodId);
	}, [checkoutDeliveryMethodId, shippingMethods]);

	useEffect(() => {
		if (values.shippingAddress.country !== shippingAddress?.country.code) {
			setIsRequireUpdateAddress(true);
		} else {
			setIsRequireUpdateAddress(false);
		}
	}, [values.shippingAddress.country, shippingAddress?.country.code]);

	const getSubtitle = ({ min, max }: { min?: number | null; max?: number | null }) => {
		if (!min || !max) {
			return undefined;
		}

		return `${min}-${max} business days`;
	};

	const handleChangeDeliveryMethod = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCheckoutDeliveryMethodId(e.target.value);
		await handleSubmitAddress(values, { setSubmitting, setFieldError } as FormikHelpers<FormValues>, false);
		const updateDeliveryMethodUpdateResult = await updateDeliveryMethod({
			id: checkout?.id || "",
			deliveryMethodId: e.target.value,
		});
		if (updateDeliveryMethodUpdateResult?.checkoutDeliveryMethodUpdate?.errors.length) {
			const error = updateDeliveryMethodUpdateResult?.checkoutDeliveryMethodUpdate?.errors[0];
			toast.error(error.message);
		} else {
			toast.success("Delivery method updated successfully");
		}
	};

	if (!checkout?.isShippingRequired) {
		return null;
	}

	return (
		<div className="py-4" data-testid="deliveryMethods">
			<Title className="mb-2">Delivery methods</Title>
			{!user && !checkout && <DeliveryMethodsSkeleton />}
			{(user && !shippingAddress) || isRequireUpdateAddress ? (
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
