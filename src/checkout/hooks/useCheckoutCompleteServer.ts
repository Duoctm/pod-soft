"use server";
import {
	CheckoutCompleteDocument,
	type CheckoutCompleteMutationVariables,
	type CheckoutCompleteMutation,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const checkoutCompleteServerFunc = async (variables: CheckoutCompleteMutationVariables) => {
	"use server";
	const data = await executeGraphQL<CheckoutCompleteMutation, CheckoutCompleteMutationVariables>(
		CheckoutCompleteDocument,
		{
			variables: variables,

		},
	);
	return data;
};
