"use server";

import { executeGraphQL } from "@/lib/graphql";
import { CheckoutValidateDocument } from "@/gql/graphql";

export async function checkoutValidate(checkoutId: string) {
    const variables = { checkoutId }; // biến truyền vào
    const result = await executeGraphQL(CheckoutValidateDocument, { variables });
    return result;
}
