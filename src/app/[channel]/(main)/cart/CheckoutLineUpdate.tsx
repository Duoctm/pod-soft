"use server";

import { CheckoutLineUpdateDocument, CheckoutLineUpdateMutationVariables, CheckoutLineUpdateMutation } from '@/gql/graphql';
import { executeGraphQL } from "@/lib/graphql";


export const CheckoutLineUpdate = async ({
    id,
    lineId,
    quantity
}: CheckoutLineUpdateMutationVariables) => {
    "use server";
    const { checkoutLinesUpdate } = await executeGraphQL<
        CheckoutLineUpdateMutation,
        CheckoutLineUpdateMutationVariables
    >(CheckoutLineUpdateDocument, {
        cache: "no-cache",
        variables: { id, lineId, quantity },
    });
    return checkoutLinesUpdate;
};
