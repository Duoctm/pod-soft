"use server";

import { executeGraphQL } from "@/lib/graphql";
import { CheckoutFindDocument } from "@/gql/graphql";

export async function getCheckout(checkoutId: string, lineId: string) {
    const result = await executeGraphQL(CheckoutFindDocument, {
        variables: {
            id: checkoutId
        }
    });
    const resultResponse: {
        quantity: number | null;
        design_metadata: any; // hoặc định nghĩa rõ kiểu nếu có
        printing_info_metadata: any; // hoặc định nghĩa rõ kiểu nếu có
        line_additional_services: any
    } = {
        quantity: null,
        design_metadata: null,
        printing_info_metadata: null,
        line_additional_services: null
    };
    if (result.checkout?.lines) {
        for (const line of result.checkout?.lines) {
            if (line.id == lineId) {

                resultResponse.quantity = line.quantity != null ? line.quantity : null;
                resultResponse.design_metadata = line.metadata.find(item => item.key === "design");//printing_info
                resultResponse.printing_info_metadata = line.metadata.find(item => item.key === "printing_info");
                resultResponse.line_additional_services = line.metadata.find(item => item.key === "line_additional_services");
                break;
            }
        }
    }
    return resultResponse;
}