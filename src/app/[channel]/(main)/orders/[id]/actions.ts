"use server";

import { CurrentUserOrderListDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const getOrderUser = async () => {
	try {
		const { me: user } = await executeGraphQL(CurrentUserOrderListDocument, {
			cache: "no-cache",
		});

		if (!user) {
			return null;
		}
		return user;
	} catch (error) {
		throw error;
	}
};
