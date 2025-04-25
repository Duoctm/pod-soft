"use server";
import {
	CreateDummyPaymentDocument,
	type CreateDummyPaymentMutationVariables,
	type CreateDummyPaymentMutation,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const createDummyPaymentServerFunc = async (variables: CreateDummyPaymentMutationVariables) => {
	"use server";
	const data = await executeGraphQL<CreateDummyPaymentMutation, CreateDummyPaymentMutationVariables>(
		CreateDummyPaymentDocument,
		{
			variables,
		},
	);
	return data;
};
