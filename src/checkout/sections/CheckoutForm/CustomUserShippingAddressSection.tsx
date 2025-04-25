import React, { useEffect, useRef } from "react"; // Import useRef
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { type Country } from "@/checkout/hooks/useUserServer"; // Remove Address import

// Suggestion: Move this interface to a shared types file
interface AddressFormData {
	firstName: string;
	lastName: string;
	streetAddress1: string;
	city: string;
	zipCode: string;
	country: string;
	phoneNumber: string | null;
	company: string | null;
	streetAddress2: string | null;
}

const UserShippingAddressFormValidationSchema = Yup.object().shape({
	firstName: Yup.string()
		.required("First name is required")
		.max(256, "First name cannot exceed 256 characters"),
	lastName: Yup.string().required("Last name is required").max(256, "Last name cannot exceed 256 characters"),
	streetAddress1: Yup.string()
		.required("Street address is required")
		.max(256, "Street address cannot exceed 256 characters"),
	city: Yup.string().required("City is required").max(256, "City cannot exceed 256 characters"),
	zipCode: Yup.string().required("Zip code is required").max(20, "Zip code cannot exceed 20 characters"),
	country: Yup.string().required("Country is required").length(2, "Country code must be 2 characters"),
	phoneNumber: Yup.string().nullable().max(128, "Phone number cannot exceed 128 characters"),
	company: Yup.string().nullable().max(256, "Company name cannot exceed 256 characters"),
	streetAddress2: Yup.string().nullable().max(256, "Street address (continue) cannot exceed 256 characters"),
});

const FormikStateSyncer: React.FC<{
	onAddressChange: (values: AddressFormData | null, isValid: boolean) => void; // Allow null values
}> = ({ onAddressChange }) => {
	// Use Formik context to get values and validity status
	const { values, isValid } = useFormikContext<AddressFormData>();
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

	useEffect(() => {
		// Clear any existing timeout
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}

		// Setup a new timeout
		debounceTimeoutRef.current = setTimeout(() => {
			// Call the original callback after a delay (e.g., 500ms)
			onAddressChange(values, isValid);
		}, 3000); // Increased delay to 500ms

		// Cleanup function to clear the timeout if the component unmounts or dependencies change
		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
		// Keep dependencies that should trigger the debounce logic
		// Removed 'dirty' as 'values' changing implies dirtiness relevant here
	}, [values, isValid, onAddressChange]);

	return null;
};

interface AddressFormProps {
	// Update prop type to AddressFormData
	initialValues?: AddressFormData | null;
	// Update callback signature to accept null
	onAddressChange: (values: AddressFormData | null, isValid: boolean) => void;
	countriesData: Country[] | null;
	// Update prop name and type
	apiErrors?: Record<string, string> | null;
}

// Helper to get default empty form data structure (copied from Checkout.tsx)
const getDefaultAddressFormData = (countriesData: Country[] | null): AddressFormData => {
	const defaultCountryCode = countriesData && countriesData.length > 0 ? countriesData[0].code : "";
	return {
		country: defaultCountryCode,
		firstName: "",
		lastName: "",
		company: "",
		streetAddress1: "",
		streetAddress2: "",
		city: "",
		zipCode: "",
		phoneNumber: "",
	};
};

export const AddressForm: React.FC<AddressFormProps> = ({
	initialValues,
	onAddressChange,
	countriesData,
	apiErrors, // Destructure the updated prop
}) => {
	// Use initialValues directly, providing a default if null/undefined
	const formInitialValues = initialValues ?? getDefaultAddressFormData(countriesData);

	// Add a key based on initialValues to force re-render when they change significantly
	// This helps reset Formik's state when switching between addresses
	const formKey = JSON.stringify(formInitialValues);

	return (
		<Formik<AddressFormData>
			key={formKey} // Add key here
			initialValues={formInitialValues}
			validationSchema={UserShippingAddressFormValidationSchema}
			onSubmit={() => {}} // No submit needed here, handled by parent
			enableReinitialize // Keep this to allow updates if initialValues prop changes
			validateOnMount // Validate on initial load
		>
			{({ errors, touched }) => (
				<Form className="space-y-4 rounded-lg bg-white font-sans">
					{/* FormikStateSyncer remains the same */}
					<FormikStateSyncer onAddressChange={onAddressChange} />

					<h2 className="mb-6 text-xl font-semibold text-gray-800">Shipping Address</h2>

					{/* Country Field */}
					<div>
						<label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">
							Country *
						</label>
						<Field
							as="select"
							id="country"
							name="country"
							className={`w-full border px-3 py-2 ${
								(errors.country && touched.country) || apiErrors?.country // Check both Formik and API errors
									? "border-red-500"
									: "border-gray-300"
							} rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
						>
							<option value="" disabled>
								Select a country...
							</option>
							{countriesData?.map((country) => (
								<option key={country.code} value={country.code}>
									{country.country}
								</option>
							))}
						</Field>
						{/* Display Formik error OR API error */}
						<ErrorMessage name="country">
							{(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
						</ErrorMessage>
						{!errors.country &&
							apiErrors?.country && ( // Show API error only if no Formik error
								<div className="mt-1 text-sm text-red-600">{apiErrors.country}</div>
							)}
					</div>

					{/* First Name Field */}
					<div>
						<label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
							First name *
						</label>
						<Field
							type="text"
							id="firstName"
							name="firstName"
							className={`w-full border px-3 py-2 ${
								(errors.firstName && touched.firstName) || apiErrors?.firstName
									? "border-red-500"
									: "border-gray-300"
							} rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
						/>
						<ErrorMessage name="firstName">
							{(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
						</ErrorMessage>
						{!errors.firstName && apiErrors?.firstName && (
							<div className="mt-1 text-sm text-red-600">{apiErrors.firstName}</div>
						)}
					</div>

					{/* Last Name Field */}
					<div>
						<label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
							Last name *
						</label>
						<Field
							type="text"
							id="lastName"
							name="lastName"
							className={`w-full border px-3 py-2 ${
								(errors.lastName && touched.lastName) || apiErrors?.lastName
									? "border-red-500"
									: "border-gray-300"
							} rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
						/>
						<ErrorMessage name="lastName">
							{(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
						</ErrorMessage>
						{!errors.lastName && apiErrors?.lastName && (
							<div className="mt-1 text-sm text-red-600">{apiErrors.lastName}</div>
						)}
					</div>

					{/* Company Field */}
					<div>
						<label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
							Company
						</label>
						<Field
							type="text"
							id="company"
							name="company"
							className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
								apiErrors?.company ? "border-red-500" : "border-gray-300" // Only API error check needed for optional field
							}`}
						/>
						{/* No Formik error for optional field unless specific validation added */}
						{apiErrors?.company && <div className="mt-1 text-sm text-red-600">{apiErrors.company}</div>}
					</div>

					{/* Street Address 1 Field */}
					<div>
						<label htmlFor="streetAddress1" className="mb-1 block text-sm font-medium text-gray-700">
							Street address *
						</label>
						<Field
							type="text"
							id="streetAddress1"
							name="streetAddress1"
							className={`w-full border px-3 py-2 ${
								(errors.streetAddress1 && touched.streetAddress1) || apiErrors?.streetAddress1
									? "border-red-500"
									: "border-gray-300"
							} rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
						/>
						<ErrorMessage name="streetAddress1">
							{(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
						</ErrorMessage>
						{!errors.streetAddress1 && apiErrors?.streetAddress1 && (
							<div className="mt-1 text-sm text-red-600">{apiErrors.streetAddress1}</div>
						)}
					</div>

					{/* Street Address 2 Field */}
					<div>
						<label htmlFor="streetAddress2" className="mb-1 block text-sm font-medium text-gray-700">
							Street address (continue)
						</label>
						<Field
							type="text"
							id="streetAddress2"
							name="streetAddress2"
							className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
								apiErrors?.streetAddress2 ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{apiErrors?.streetAddress2 && (
							<div className="mt-1 text-sm text-red-600">{apiErrors.streetAddress2}</div>
						)}
					</div>

					{/* City Field */}
					<div>
						<label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
							City *
						</label>
						<Field
							type="text"
							id="city"
							name="city"
							className={`w-full border px-3 py-2 ${
								(errors.city && touched.city) || apiErrors?.city ? "border-red-500" : "border-gray-300"
							} rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
						/>
						<ErrorMessage name="city">
							{(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
						</ErrorMessage>
						{!errors.city && apiErrors?.city && (
							<div className="mt-1 text-sm text-red-600">{apiErrors.city}</div>
						)}
					</div>

					{/* Zip Code Field */}
					<div>
						<label htmlFor="zipCode" className="mb-1 block text-sm font-medium text-gray-700">
							Zip code *
						</label>
						<Field
							type="text"
							id="zipCode"
							name="zipCode"
							className={`w-full border px-3 py-2 ${
								(errors.zipCode && touched.zipCode) || apiErrors?.zipCode
									? "border-red-500"
									: "border-gray-300"
							} rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
						/>
						<ErrorMessage name="zipCode">
							{(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
						</ErrorMessage>
						{!errors.zipCode && apiErrors?.zipCode && (
							<div className="mt-1 text-sm text-red-600">{apiErrors.zipCode}</div>
						)}
					</div>

					{/* Phone Number Field */}
					<div>
						<label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
							Phone number
						</label>
						<Field
							type="tel"
							id="phoneNumber"
							name="phoneNumber"
							className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
								apiErrors?.phoneNumber ? "border-red-500" : "border-gray-300" // Use correct field name
							}`}
						/>
						{/* Formik error for phone if validation added */}
						<ErrorMessage name="phoneNumber">
							{(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
						</ErrorMessage>
						{/* API error might come as 'phone' or 'phoneNumber', check both if needed, or standardize */}
						{apiErrors?.phoneNumber &&
							!errors.phoneNumber && ( // Prefer Formik error if both exist
								<div className="mt-1 text-sm text-red-600">{apiErrors.phoneNumber}</div>
							)}
						{/* Optional: Check for 'phone' if API uses that */}
						{/* {apiErrors?.phone && !errors.phoneNumber && !apiErrors.phoneNumber && (
							<div className="mt-1 text-sm text-red-600">{apiErrors.phone}</div>
						)} */}
					</div>
				</Form>
			)}
		</Formik>
	);
};
