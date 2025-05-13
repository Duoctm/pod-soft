"use server";

import { ProductListPaginatedDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const getProductList = async ({
	first,
	after,
	channel,
}: {
	first: number;
	after: string | null | undefined;
	channel: string;
}) => {
	try {
		const { products } = await executeGraphQL(ProductListPaginatedDocument, {
			variables: {
				first: first,
				after: after,
				channel: channel,
			},
			revalidate: 60,
		});

		if (!products) {
			return null;
		}


		return products;
	} catch (error) {
		throw error;
	}
};
