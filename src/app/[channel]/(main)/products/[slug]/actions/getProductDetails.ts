"use server";
import { executeGraphQL } from "@/lib/graphql";
import { GetProductDetailsDocument } from "@/gql/graphql";

export const getProductDetails = async (slug: string, channel: string) => {
	"user server";
	const data = await executeGraphQL(GetProductDetailsDocument, {
		variables: {
			channel: channel,
			slug: slug,
		},
	});
	return data;
};
