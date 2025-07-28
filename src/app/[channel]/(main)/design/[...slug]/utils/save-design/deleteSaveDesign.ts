"use server";
import {
    CustomerDesignFavoriteDeleteDocument
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const deleteDesign = async (id: string) => {
    "use server";
    const data = await executeGraphQL(CustomerDesignFavoriteDeleteDocument, {
        cache: "no-cache",
        variables: {
            input: {
                id: id
            }
        },
    });
    return data;
};
