"use server";

import {
	AddPromoCodeToCheckoutDocument,
	type CheckoutErrorCode,
	type AddPromoCodeToCheckoutMutation,
	type AddPromoCodeToCheckoutMutationVariables,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

interface PromoCodeResponse {
	success: boolean;
	data: AddPromoCodeToCheckoutMutation["checkoutAddPromoCode"];
}

export const addPromodeCode = async (
	promoCode: string,
	id: string,
): Promise<PromoCodeResponse | undefined> => {
	try {
		const { checkoutAddPromoCode } = await executeGraphQL<
			AddPromoCodeToCheckoutMutation,
			AddPromoCodeToCheckoutMutationVariables
		>(AddPromoCodeToCheckoutDocument, {
			variables: {
				checkoutId: id,
				promoCode: promoCode,
			},
		});

		if (!checkoutAddPromoCode?.checkout && (checkoutAddPromoCode?.errors as unknown as []).length > 0) {
			return { success: false, data: checkoutAddPromoCode };
		}

		return { success: true, data: checkoutAddPromoCode };
	} catch (error) {
		return {
			success: false,
			data: {
				checkout: null,
				errors: [
					{
						__typename: "CheckoutError",
						message: "An error occurred while adding the promo code.",
						code: "INTERNAL_SERVER_ERROR" as CheckoutErrorCode,
						field: null,
					},
				],
			},
		};
	}
};
