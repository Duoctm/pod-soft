"use server";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutDocument, type CheckoutQuery, type CheckoutQueryVariables } from "@/gql/graphql";

export const getCheckoutServer = async (variables: CheckoutQueryVariables) => {
	"use server";
	const data = await executeGraphQL<CheckoutQuery, CheckoutQueryVariables>(CheckoutDocument, {
		cache: "no-cache",
		variables,
	});
	return data;
};
