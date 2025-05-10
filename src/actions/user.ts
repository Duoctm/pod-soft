"use server";
import { CurrentUserDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
export const getUser = async () => {
    "use server"
	try {
		const { me: user } = await executeGraphQL(CurrentUserDocument, {
			cache: "no-cache",
		});
		return user;
	} catch (error) {
		console.error(error);
		return;
	}
};
