"use server";

import { FilterOptionsDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

interface FilterAttribute {
	slug: string;
	values: string[];
}

export const filterOptions = async ({
	filterAttributes,
	channel,
	first,
	after
}: {
	filterAttributes: FilterAttribute[];
	channel: string;
	first: number;
	after: string | null | undefined;
}) => {
	const { products } = await executeGraphQL(FilterOptionsDocument, {
		variables: {
			channel,
			first: first,
			after: after,
			filter: {
				attributes: filterAttributes.map(attr => ({
					slug: attr.slug,
					values: attr.values
				})),
			},
		},
		revalidate: 60,
	});

	if (!products) {
		throw new Error(`Failed to fetch products for search value`);
	}

	return products;
};
