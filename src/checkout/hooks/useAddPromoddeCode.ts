"use server";

import { AddPromoCodeToCheckoutDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
 
interface PromoCodeResponse {
    success: boolean;
    data: any;
}

export const addPromodeCode = async (promoCode: string, id: string, ): Promise<PromoCodeResponse | undefined> => {
    try {
        const { checkoutAddPromoCode } = await executeGraphQL(AddPromoCodeToCheckoutDocument, {
            variables: {
                checkoutId: id,
                promoCode: promoCode,
            },
        });

        console.log(checkoutAddPromoCode)

        if (!checkoutAddPromoCode?.checkout && (checkoutAddPromoCode?.errors as unknown as []).length > 0  ) {
            return { success: false, data: checkoutAddPromoCode?.errors};
        }
 


        return { success: true, data: checkoutAddPromoCode };
    } catch (error) {
        console.error("Error adding promo code:", error);
        throw error;
    }
};
