import * as Yup from "yup";

// Regex for validation messages
const noUnsafeCharsMessage = "Input contains invalid characters (< or >)";
const phoneRegex = /^[\d +().-]{10,20}$/;
const invalidPhoneMessage = "Invalid phone number format";
const zipCodeRegex = /^[a-zA-Z0-9 -]{1,20}$/;
const invalidZipCodeMessage = "Invalid zip code format";

// Validation schema for address fields
export const AddressSchema = Yup.object().shape({
	firstName: Yup.string()
		.trim()
		.required("First name is required")
		.max(100, "First name cannot exceed 100 characters")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),

	lastName: Yup.string()
		.trim()
		.required("Last name is required")
		.max(100, "Last name cannot exceed 100 characters")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),

	streetAddress1: Yup.string()
		.trim()
		.required("Street address is required")
		.max(256, "Street address cannot exceed 256 characters")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),

	streetAddress2: Yup.string()
		.trim()
		.nullable()
		.max(256, "Street address (continue) cannot exceed 256 characters")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),

	city: Yup.string()
		.trim()
		.required("City is required")
		.max(100, "City cannot exceed 100 characters")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),

	zipCode: Yup.string()
		.trim()
		.required("Zip code is required")
		.max(20, "Zip code cannot exceed 20 characters")
		.matches(zipCodeRegex, invalidZipCodeMessage),

	countryArea: Yup.string()
		.trim()
		.required("State is required")
		.max(100, "State cannot exceed 100 characters")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),

	country: Yup.string()
		.trim()
		.required("Country is required")
		.min(2, "Country is required")
		.max(100, "Country name too long")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),

	phoneNumber: Yup.string()
		.trim()
		.required("Phone number is required")
		.min(10, "Phone number must be at least 10 characters")
		.max(20, "Phone number cannot exceed 20 characters")
		.matches(phoneRegex, invalidPhoneMessage),

	company: Yup.string()
		.trim()
		.nullable()
		.max(150, "Company name cannot exceed 150 characters")
		.matches(/^[^<>]*$/, noUnsafeCharsMessage),
});
