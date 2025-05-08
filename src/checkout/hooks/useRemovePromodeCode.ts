// app/actions/removePromodeCode.ts
"use server";

import { RemovePromoCodeFromCheckoutDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const removePromodeCode = async (id: string, promoCode: string) => {
	try {
		const { checkoutRemovePromoCode } = await executeGraphQL(RemovePromoCodeFromCheckoutDocument, {
			variables: { checkoutId: id, promoCode },
		});

		if (checkoutRemovePromoCode?.errors) {
			return { success: false, message: "Server returned errors." };
		}

		return { success: true };
	} catch (error) {
		return { success: false, message: "Server exception occurred." };
	}
};
