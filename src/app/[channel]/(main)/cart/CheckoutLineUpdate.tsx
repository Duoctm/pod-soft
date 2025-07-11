"use server";

import { CheckoutLineUpdateDocument, type CheckoutLineUpdateMutationVariables, type CheckoutLineUpdateMutation } from '@/gql/graphql';
import { executeGraphQL } from "@/lib/graphql";


export const CheckoutLineUpdate = async ({
    id,
    lineId,
    quantity,
    metadata,
}: CheckoutLineUpdateMutationVariables) => {
    "use server";
    const { checkoutLinesUpdate } = await executeGraphQL<
        CheckoutLineUpdateMutation,
        CheckoutLineUpdateMutationVariables
    >(CheckoutLineUpdateDocument, {
        cache: "no-cache",
        variables: { id, lineId, quantity, metadata },
    });
    return checkoutLinesUpdate;
};
