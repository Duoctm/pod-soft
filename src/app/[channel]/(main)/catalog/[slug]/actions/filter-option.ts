"use server";

import { FilterOptionsDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const filterOptions = async ({
	filterAttributes,
	channel,
}: {
	filterAttributes: [] | any;
	channel: string;
}) => {
	const { products } = await executeGraphQL(FilterOptionsDocument, {
		variables: {
			channel,
			filter: {
				attributes: filterAttributes,
			},
		},
		revalidate: 60,
	});

	if (!products) {
		throw new Error(`Failed to fetch products for search value `);
	}

	return products;
};
