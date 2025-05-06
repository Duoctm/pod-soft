"use server";

import { ProductListByCategoryDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const getCategory = async ({ slug, channel }: { slug: string, channel: string }) => {
    try {
        const { category } = await executeGraphQL(ProductListByCategoryDocument, {
            variables: { slug, channel },
            revalidate: 60,
        });
        if (!category) {
            throw new Error(`Failed to fetch collection products for slug ${category}`);
        }
        return category;
    } catch (error) {
        throw new Error(`Failed to fetch collection products for slug ${error}`);
    }
};
