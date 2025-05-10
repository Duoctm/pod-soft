"use server";


import { CheckoutOfMeDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { saveIdToCookie } from '@/lib/checkout'

export const getCheckoutDetail = async (channel: string) => {
    const result = await executeGraphQL(CheckoutOfMeDocument, {});

    const checkoutId = result.me?.checkouts?.edges[0].node.id
    if (checkoutId != undefined) {
        saveIdToCookie(channel, checkoutId);
    }
};