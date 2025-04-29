"use server";

import { RemovePromoCodeFromCheckoutDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const removePromodeCode = async (id: string, promodeCode: string) => {
	try {
		const { checkoutRemovePromoCode } = await executeGraphQL(RemovePromoCodeFromCheckoutDocument, {
			variables: {
				checkoutId: id,
				promoCode: promodeCode,
			},
		});
        console.log(checkoutRemovePromoCode)
		if (checkoutRemovePromoCode?.errors) {
			return checkoutRemovePromoCode?.errors;
		}
		return checkoutRemovePromoCode;
	} catch (error) {
		console.log(error);
		return error;
	}
};
