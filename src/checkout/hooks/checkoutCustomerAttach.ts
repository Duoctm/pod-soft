"use server";
import {
	CheckoutCustomerAttachDocument,
	type CheckoutCustomerAttachMutationVariables,
	type CheckoutCustomerAttachMutation,
} from "@/gql/graphql";

import { executeGraphQL } from "@/lib/graphql";

export const checkoutCustomerAttachFunc = async (variables: CheckoutCustomerAttachMutationVariables) => {
	"use server";
	const data = await executeGraphQL<CheckoutCustomerAttachMutation, CheckoutCustomerAttachMutationVariables>(
		CheckoutCustomerAttachDocument,
		{
			variables: variables,
		},
	);
	return data.checkoutCustomerAttach;
};
