"use server";

import { FilterOptionsDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const filterOptions = async ({
	filterAttributes,
	channel,
	first,
	after
}: {
	filterAttributes: [] | any;
	channel: string;
	first: number;
	after: string | null | undefined;
}) => {
	const { products } = await executeGraphQL(FilterOptionsDocument, {
		variables: {
			channel,
			first: first,
			after:after,
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
