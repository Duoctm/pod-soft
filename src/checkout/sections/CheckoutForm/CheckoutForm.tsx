"use client";
import React, { useEffect } from "react";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { getCountryList } from "@/checkout/hooks/useCountryList";
import { type CountryCode } from "@/gql/graphql";
import { type FormValues, type CountryArea } from "@/checkout/lib/utils/type";
import { getAddressValidationRules } from "@/checkout/hooks/useAddressValidation";

// Filter function to filter unique country areas based on the raw value
function filterUniqueCountryAreas(countryAreas: CountryArea[]): CountryArea[] {
	const uniqueCountryAreas: CountryArea[] = [];
	const seenRawValues = new Set<string>();

	for (const countryArea of countryAreas) {
		if (!seenRawValues.has(countryArea.raw)) {
			if (countryArea.raw) {
				seenRawValues.add(countryArea.raw);
				uniqueCountryAreas.push(countryArea);
			}
		}
	}

	return uniqueCountryAreas;
}

// --- Reusable Input Field Component ---
interface InputFieldProps {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	as?: "input" | "select" | "textarea";
	children?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
	label,
	name,
	type = "text",
	placeholder,
	required,
	as = "input",
	children,
}) => (
	<div className="mb-4">
		<label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
			{label} {required && <span className="text-red-500">*</span>}
		</label>
		<Field
			as={as}
			id={name}
			name={name}
			type={type}
			placeholder={placeholder}
			className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
		>
			{children}
		</Field>
		<ErrorMessage name={name} component="div" className="mt-1 text-xs text-red-500" />
	</div>
);

type AddressCheckoutFormProps = {
	slug: string;
};

// --- Main Address Form Component ---
export const AddressCheckoutForm: React.FC<AddressCheckoutFormProps> = ({ slug }) => {
	const { values } = useFormikContext<FormValues>();
	const [countries, setCountries] = React.useState<{ code: string; country: string }[]>([]);
	// const { countryAreaChoices  } = useAddressFormUtils(values.shippingAddress.country as CountryCode);
	const [countryAreas, setCountryAreas] = React.useState<CountryArea[]>([]);

	// const countryAreas = useMemo(() => {

	// 	return filterUniqueCountryAreas(countryAreaChoices as CountryArea[]);
	// }, [countryAreaChoices]);

	useEffect(() => {
		let isMounted = true;
		if (slug) {
			const fetchCountries = async () => {
				try {
					const data = await getCountryList({ slug });
					if (isMounted) {
						setCountries(data.map(({ country, code }) => ({ code, country })));
					}
				} catch (error) {
					console.error("Failed to fetch countries:", error);
					if (isMounted) setCountries([]);
				}
			};

			const fetchAddressValidationRules = async () => {
				try {
					const { data } = await getAddressValidationRules(values.shippingAddress.country as CountryCode);

					const filteredCountryAreas = filterUniqueCountryAreas(data?.countryAreaChoices as CountryArea[]);
					setCountryAreas(filteredCountryAreas);
				} catch (error) {
					console.error("Failed to fetch address validation rules:", error);
				}
			};

			void fetchCountries();
			void fetchAddressValidationRules();
		}
		return () => {
			isMounted = false;
		};
	}, [slug]);

	return (
		<div className="mx-auto mt-4 max-w-2xl rounded-lg bg-white">
			<Form>
				{/* --- Shipping Address --- */}
				<section className="mb-6">
					<h2 className="mb-4 text-xl font-semibold text-gray-800">Shipping Address</h2>
					{/* In a real app, this would be a searchable dropdown */}
					<InputField label="Country" name="shippingAddress.country" required as="select">
						<option value="" disabled>
							Select a country
						</option>
						{countries.map((country) => (
							<option key={country.code} value={country.code}>
								{country.country}
							</option>
						))}
					</InputField>
					<InputField label="State" name="shippingAddress.countryArea" required as="select">
						<option value="" disabled>
							Select a state
						</option>
						{countryAreas.map((countryArea) => (
							<option key={countryArea.raw} value={countryArea.raw || ""}>
								{countryArea.verbose}
							</option>
						))}
					</InputField>
					<div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
						<InputField label="First name" name="shippingAddress.firstName" required />
						<InputField label="Last name" name="shippingAddress.lastName" required />
					</div>
					<InputField label="Company" name="shippingAddress.company" />
					<InputField label="Street address" name="shippingAddress.streetAddress1" required />
					<InputField label="Street address (continue)" name="shippingAddress.streetAddress2" />
					<div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
						<InputField label="City" name="shippingAddress.city" required />
						<InputField label="Zip code" name="shippingAddress.zipCode" required />
					</div>
					<InputField
						label="Phone number"
						name="shippingAddress.phoneNumber"
						type="tel"
						required
						placeholder="+1234567890"
					/>
				</section>

				{/* --- Use Shipping as Billing Checkbox --- */}
				<div className="mb-6">
					<label className="flex items-center text-sm text-gray-700">
						<Field
							type="checkbox"
							name="useShippingAsBilling"
							className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						Use shipping address as billing address
					</label>
					<ErrorMessage name="useShippingAsBilling" component="div" className="mt-1 text-xs text-red-500" />
				</div>

				{/* --- Billing Address (Conditional) --- */}
				{!values.useShippingAsBilling && (
					<section className="mb-6 border-t border-gray-200 pt-6">
						<h2 className="mb-4 text-xl font-semibold text-gray-800">Billing Address</h2>
						{/* In a real app, this would be a searchable dropdown */}
						<InputField label="Country" name="billingAddress.country" required as="select">
							<option value="" disabled>
								Select a country
							</option>
							{countries.map((country) => (
								<option key={country.code} value={country.code}>
									{country.country}
								</option>
							))}
						</InputField>
						<InputField label="State" name="billingAddress.countryArea" required as="select">
							<option value="" disabled>
								Select a state
							</option>
							{countryAreas.map((countryArea) => (
								<option key={countryArea.raw} value={countryArea.raw || ""}>
									{countryArea.verbose}
								</option>
							))}
						</InputField>
						<div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
							<InputField label="First name" name="billingAddress.firstName" required />
							<InputField label="Last name" name="billingAddress.lastName" required />
						</div>
						<InputField label="Company" name="billingAddress.company" />
						<InputField label="Street address" name="billingAddress.streetAddress1" required />
						<InputField label="Street address (continue)" name="billingAddress.streetAddress2" />
						<div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
							<InputField label="City" name="billingAddress.city" required />
							<InputField label="Zip code" name="billingAddress.zipCode" required />
						</div>
						<InputField
							label="Phone number"
							name="billingAddress.phoneNumber"
							type="tel"
							required
							placeholder="+1234567890"
						/>
					</section>
				)}
				<div className="my-2 flex justify-end">
					<button
						type="submit"
						className="flex w-fit justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Save Address
					</button>
				</div>
			</Form>
		</div>
	);
};
