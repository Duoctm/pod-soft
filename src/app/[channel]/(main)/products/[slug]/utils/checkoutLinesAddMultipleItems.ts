"use server";
import {
	CheckoutLinesAddMultipleItemsDocument,
	type CheckoutLinesAddMultipleItemsMutation,
	type CheckoutLinesAddMultipleItemsMutationVariables,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const checkoutLinesAddMultipleItems = async ({
	id,
	lines,
}: CheckoutLinesAddMultipleItemsMutationVariables) => {
	"use server";
	const { checkoutLinesAdd } = await executeGraphQL<
		CheckoutLinesAddMultipleItemsMutation,
		CheckoutLinesAddMultipleItemsMutationVariables
	>(CheckoutLinesAddMultipleItemsDocument, {
		cache: "no-cache",
		variables: { id, lines },
	});
	return checkoutLinesAdd;
};
