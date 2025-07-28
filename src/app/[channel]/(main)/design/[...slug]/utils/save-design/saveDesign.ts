"use server";
import {
    CustomerDesignFavoriteCreateDocument
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const saveDesign = async (name: string, designJson: object) => {
    "use server";
    const data = await executeGraphQL(CustomerDesignFavoriteCreateDocument, {
        cache: "no-cache",
        variables: {
            input: {
                designJson: designJson,
                images: [],
                note: name
            }
        },
    });
    return data;
};
