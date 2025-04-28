"use server";
import { CheckoutDeliveryMethodUpdateDocument, type CheckoutDeliveryMethodUpdateMutation, type CheckoutDeliveryMethodUpdateMutationVariables } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const updateDeliveryMethod = async ({ id, deliveryMethodId }: CheckoutDeliveryMethodUpdateMutationVariables) => {
    "use server";
    const data = await executeGraphQL<CheckoutDeliveryMethodUpdateMutation, CheckoutDeliveryMethodUpdateMutationVariables>(CheckoutDeliveryMethodUpdateDocument, {
        cache: "no-cache",
        variables: { id, deliveryMethodId },
    });
    return data;
};