import { Suspense } from "react";
import { AddressForm } from "./CustomUserShippingAddressSection";
import { BillingAddressForm } from "./CustomUserBillingAddressSection";
import { CustomDeliveryMethodsSection } from "./CustomDeliveryMethodsSection";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { Contact } from "@/checkout/sections/Contact";
import { ContactSkeleton } from "@/checkout/sections/Contact/ContactSkeleton";
import { DeliveryMethodsSkeleton } from "@/checkout/sections/DeliveryMethods/DeliveryMethodsSkeleton";
import { AddressSectionSkeleton } from "@/checkout/components/AddressSectionSkeleton";
import { Divider } from "@/checkout/components";
import { type User, type Country } from "@/checkout/hooks/useUserServer";
import { type AddressFormData } from "@/checkout/views/Checkout"; 

interface ShippingMethod {
	id: string;
	active: boolean;
	description: string | null;
	name: string;
	price: {
		amount: number;
		currency: string;
	};
}

interface CheckoutFormProps {
	user: User | null | undefined;
	countriesData: Country[] | null;
	useShippingAsBilling: boolean;
	availableShippingMethods: ShippingMethod[];
	selectedShippingMethodId: string | null;
	initialShippingValues?: AddressFormData | null;
	initialBillingValues?: AddressFormData | null;
	onShippingAddressChange: (values: AddressFormData | null, isValid: boolean) => void;
	onBillingAddressChange: (values: AddressFormData | null, isValid: boolean) => void;
	onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onShippingMethodSelect: (methodId: string) => void;
	shippingApiFieldErrors?: Record<string, string> | null;
	billingApiFieldErrors?: Record<string, string> | null;
	deliveryMethodApiError?: string | null; // Prop remains
}

export const CheckoutForm = ({
	user,
	countriesData,
	useShippingAsBilling,
	availableShippingMethods,
	selectedShippingMethodId,
	initialShippingValues,
	initialBillingValues,
	onShippingAddressChange,
	onBillingAddressChange,
	onCheckboxChange,
	onShippingMethodSelect,
	shippingApiFieldErrors,
	billingApiFieldErrors,
	deliveryMethodApiError, // Prop remains
}: CheckoutFormProps) => {
	const { checkout } = useCheckout();

	return (
		<div className="flex flex-col items-end">
			<div className="flex w-full flex-col rounded">
				<Divider />
				<Suspense fallback={<ContactSkeleton />}>
					<Contact user={user} />
				</Suspense>
				{checkout?.isShippingRequired && (
					<Suspense fallback={<AddressSectionSkeleton />}>
						<Divider />
						<div className="py-4" data-testid="shippingAddressSection">
							<AddressForm
								initialValues={initialShippingValues}
								onAddressChange={onShippingAddressChange}
								countriesData={countriesData}
								apiErrors={shippingApiFieldErrors}
							/>
						</div>
						<Divider />
						<div className="px-4 py-4 sm:px-0">
							<label className="flex cursor-pointer items-center space-x-2">
								<input
									type="checkbox"
									checked={useShippingAsBilling}
									onChange={onCheckboxChange}
									className="h-4 w-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:ring-offset-0"
								/>
								<span className="select-none text-sm text-gray-700">
									Use shipping address as billing address
								</span>
							</label>
						</div>
						<Divider />
						{!useShippingAsBilling && (
							<div className="py-4" data-testid="billingAddressSection">
								<BillingAddressForm
									initialValues={initialBillingValues}
									onBillingAddressChange={onBillingAddressChange}
									countriesData={countriesData}
									apiErrors={billingApiFieldErrors}
								/>
							</div>
						)}
					</Suspense>
				)}
				<Divider />
				<Suspense fallback={<DeliveryMethodsSkeleton />}>
					<CustomDeliveryMethodsSection
						shippingMethods={availableShippingMethods}
						selectedMethodId={selectedShippingMethodId}
						onMethodSelect={onShippingMethodSelect}
						apiError={deliveryMethodApiError} // Prop remains
					/>
				</Suspense>
			</div>
		</div>
	);
};

export const CheckoutFormSkeleton = () => (
	<div className="flex flex-col items-end">
		<div className="flex w-full flex-col rounded">
			<Divider />
			<Suspense fallback={<ContactSkeleton />}>
				<ContactSkeleton />
			</Suspense>
			<Suspense fallback={<AddressSectionSkeleton />}>
				<AddressSectionSkeleton />
			</Suspense>
			<Divider />
			<Suspense fallback={<DeliveryMethodsSkeleton />}>
				<DeliveryMethodsSkeleton />
			</Suspense>
		</div>
	</div>
);
