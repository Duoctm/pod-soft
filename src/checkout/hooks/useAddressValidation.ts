"use server";

import {
	AddressValidationRulesDocument,
	AddressValidationRulesQuery,
	AddressValidationRulesQueryVariables,
	CountryCode,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

import { AddressField } from "../components/AddressForm/types";

export const getAddressValidationRules = async (countryCode: CountryCode) => {
	try {
		const { addressValidationRules } = await executeGraphQL<
			AddressValidationRulesQuery,
			AddressValidationRulesQueryVariables
		>(AddressValidationRulesDocument, { variables: { countryCode } });

		if (!addressValidationRules) {
			return {
				success: false,
				errors: [{ message: "No validation rules found for this country." }],
			};
		}

		return {
			success: true,
			data: addressValidationRules,
			allowedFields: addressValidationRules?.allowedFields as AddressField[],
		};
	} catch (error) {
		console.error("Address validation rules fetch error:", error);
		return {
			success: false,
			errors: [{ message: "Failed to fetch address validation rules." }],
		};
	}
};
