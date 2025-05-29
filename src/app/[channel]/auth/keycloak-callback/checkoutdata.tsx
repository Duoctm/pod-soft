"use server";

import { CheckoutOfMeDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { saveIdToCookie } from "@/lib/checkout";

export const getCheckoutDetail = async (channel: string) => {
	const result = await executeGraphQL(CheckoutOfMeDocument, {});

	let checkoutId = null;

	if (result.me?.checkouts?.edges && result.me?.checkouts?.edges.length > 0) {
		checkoutId = result.me?.checkouts?.edges[0]?.node?.id;
	}

	if (checkoutId) {
		saveIdToCookie(channel, checkoutId);
	}
};
