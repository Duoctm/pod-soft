"use server"

import { ProductListPaginatedDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function getProducts({
	ProductsPerPage,
	cursor,
    channel,
}: {
	ProductsPerPage: number;
	cursor: string | null;
	channel: string;    
}){
    const { products } = await executeGraphQL(ProductListPaginatedDocument, {
		variables: {
			first: ProductsPerPage,
			after: cursor,
			channel:channel,
		},
		revalidate: 60,
	});
    return products;

}