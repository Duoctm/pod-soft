"use server";

import { revalidatePath } from "next/cache";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutDeleteLinesDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";

type deleteLineFromCheckoutArgs = {
	lineId: string;
	checkoutId: string;
};

export const deleteLineFromCheckout = async ({ lineId, checkoutId }: deleteLineFromCheckoutArgs) => {
	await executeGraphQL(CheckoutDeleteLinesDocument, {
		variables: {
			checkoutId,
			lineIds: [lineId],
		},
		cache: "no-cache",
	});

	revalidatePath("/cart");
};

export const getCheckoutList = async (channel: string) => {
	try {
		const checkoutId = Checkout.getIdFromCookies(channel);
		const checkout = await Checkout.find(checkoutId);
		if (!checkout) {
			return null;
		}
		return {
			success: true,
			checkout,
			checkoutId
		};
	} catch (error) {
		throw error;
	}
};
