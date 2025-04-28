"use server";
import { CheckoutShippingAddressUpdateDocument, type CheckoutShippingAddressUpdateMutation, type CheckoutShippingAddressUpdateMutationVariables } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const updateShippingAddress = async ({ checkoutId, shippingAddress }: CheckoutShippingAddressUpdateMutationVariables) => {
    "use server";
    const data = await executeGraphQL<CheckoutShippingAddressUpdateMutation, CheckoutShippingAddressUpdateMutationVariables>(CheckoutShippingAddressUpdateDocument, {
        cache: "no-cache",
        variables: { checkoutId, shippingAddress },
    });
    return data;
};