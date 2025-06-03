"use server";
import { CurrentUserFullDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
export const getUser = async () => {
    "use server"
    try {
        const { me: user } = await executeGraphQL(CurrentUserFullDocument, {
            cache: "no-cache",
        });
        return user;
    } catch (error) {
        console.error(error);
        return;
    }
};
