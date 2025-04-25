import React from "react";

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

interface CustomDeliveryMethodsSectionProps {
	shippingMethods: ShippingMethod[];
	selectedMethodId: string | null;
	onMethodSelect: (methodId: string) => void;
	apiError?: string | null; // Prop remains
}

const formatPrice = (price: { amount: number; currency: string }) => {
	if (price.amount === 0) {
		return "Free";
	}
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: price.currency,
	}).format(price.amount);
};

export const CustomDeliveryMethodsSection: React.FC<CustomDeliveryMethodsSectionProps> = ({
	shippingMethods,
	selectedMethodId,
	onMethodSelect,
	apiError, // Prop remains
}) => {
	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		onMethodSelect(event.target.value);
	};

	const selectedMethod = shippingMethods?.find((method) => method.id === selectedMethodId);

	const isLoading = !shippingMethods;
	const isEmpty = !isLoading && shippingMethods.length === 0;

	return (
		<div className="px-4 py-4 sm:px-0">
			<label htmlFor="delivery-method-select" className="mb-1 block text-sm font-medium text-gray-700">
				Delivery Method *
			</label>
			<select
				id="delivery-method-select"
				name="deliveryMethod"
				value={selectedMethodId || ""}
				onChange={handleSelectChange}
				disabled={isLoading || isEmpty}
				className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
					isLoading || isEmpty ? "cursor-not-allowed bg-gray-100" : ""
				} ${apiError ? "border-red-500" : "border-gray-300"}`}
			>
				<option value="" disabled>
					{isLoading
						? "Loading methods..."
						: isEmpty
							? "No methods available"
							: "Select a delivery method..."}
				</option>
				{shippingMethods?.map((method) => (
					<option key={method.id} value={method.id}>
						{method.name}
					</option>
				))}
			</select>
			{apiError && <div className="mt-1 text-sm text-red-600">{apiError}</div>}

			{selectedMethod && !apiError && (
				<p className="text-md mt-2 text-gray-600">
					<strong className="pr-2 text-gray-950">Price:</strong>
					{formatPrice(selectedMethod.price)}
				</p>
			)}
		</div>
	);
};
