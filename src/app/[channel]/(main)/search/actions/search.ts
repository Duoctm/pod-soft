"use server";
import { OrderDirection, ProductOrderField, SearchProductsDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

type SearchProductsType = {
	first: number;
	search: string;
	after: string;
	sortBy: ProductOrderField;
	sortDirection: OrderDirection;
	channel: string;
};

export const searchProduct = async ({
	first,
	search,
	after,
	sortBy,
	sortDirection,
	channel,
}: SearchProductsType) => {
	try {
		const { products } = await executeGraphQL(SearchProductsDocument, {
			variables: {
				first: first,
				search: search,
				after: after,
				sortBy: sortBy,
				sortDirection: sortDirection,
				channel: channel,
			},
			revalidate: 60,
		});

		if (!products) {
			return null;
		}

		return products;
	} catch (error) {
		throw error; // Rethrow the error to be handled at a higher level if needed
	}
};
