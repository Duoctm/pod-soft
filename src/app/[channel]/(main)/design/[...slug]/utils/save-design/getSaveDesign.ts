"use server";
import {
    CustomerDesignFavoritesDocument,
    CustomerDesignFavoriteStatusEnum,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const getSaveDesign = async () => {
    "use server";
    const data = await executeGraphQL(CustomerDesignFavoritesDocument, {
        cache: "no-cache",
        variables: {
            filter: {
                status: CustomerDesignFavoriteStatusEnum.Active,
            },
            first: 1000
        },
    });
    return data;
};
