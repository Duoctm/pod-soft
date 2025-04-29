"use server";

import { AddPromoCodeToCheckoutDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

interface PromoCodeResponse {
    success: boolean;
    data: any; // Consider creating a proper type for this
}

export const addPromodeCode = async (promoCode: string, id: string): Promise<PromoCodeResponse | undefined> => {
    try {
        const { checkoutAddPromoCode } = await executeGraphQL(AddPromoCodeToCheckoutDocument, {
            variables: {
                checkoutId: id,
                promoCode: promoCode,
            },
        });
        console.log(checkoutAddPromoCode?.checkout?.lines)

        if (checkoutAddPromoCode?.errors) {
            return {
                success: false,
                data: checkoutAddPromoCode.errors,
            };
        }
        return {
            success: true,
            data: checkoutAddPromoCode?.checkout,
        };
    } catch (error) {
        console.error("Error adding promo code:", error);
        return {
            success: false,
            data: "Failed to add promo code",
        };
    }
};
