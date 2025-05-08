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
        if (!checkoutAddPromoCode) {
            return { success: false, data: null };
        }
 


        return { success: true, data: checkoutAddPromoCode };
    } catch (error) {
        console.error("Error adding promo code:", error);
        throw error;
    }
};
