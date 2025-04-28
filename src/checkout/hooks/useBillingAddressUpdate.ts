"use server";
import { CheckoutBillingAddressUpdateDocument, type CheckoutBillingAddressUpdateMutation, type CheckoutBillingAddressUpdateMutationVariables } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const updateBillingAddress = async ({ checkoutId, billingAddress }: CheckoutBillingAddressUpdateMutationVariables) => {
    "use server";
    const data = await executeGraphQL<CheckoutBillingAddressUpdateMutation, CheckoutBillingAddressUpdateMutationVariables>(CheckoutBillingAddressUpdateDocument, {
        cache: "no-cache",
        variables: { checkoutId, billingAddress },
    });
    return data;
};