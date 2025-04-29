"use server";
import {
    CheckoutLineUpdateDocument,
    type CheckoutLineUpdateMutation,
    type CheckoutLineUpdateMutationVariables,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const checkoutLineUpdateServer = async ({ id, lineId, quantity }: CheckoutLineUpdateMutationVariables) => {
    "use server";
    const data = await executeGraphQL<CheckoutLineUpdateMutation, CheckoutLineUpdateMutationVariables>(
        CheckoutLineUpdateDocument,
        {
            variables: {
                id,
                lineId,
                quantity,
            },
        },
    );
    return data;
};
