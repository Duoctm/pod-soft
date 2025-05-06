"use server";

import {  GetProductAttributesDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const getAttributes = async () => {
	try {
		const { attributes } = await executeGraphQL(GetProductAttributesDocument, {});
		if (!attributes) {
			throw new Error(`Failed to fetch collection products for slug ${attributes}`);
		}
		return attributes;
	} catch (error) {
		throw new Error(`Failed to fetch collection products for slug ${error}`);
	}
};
