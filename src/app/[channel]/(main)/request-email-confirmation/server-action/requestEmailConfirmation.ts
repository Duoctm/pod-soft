"use server";
import {
	RequestEmailConfirmationDocument,
	type RequestEmailConfirmationMutation,
	type RequestEmailConfirmationMutationVariables,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const requestEmailConfirmation = async ({
	email,
	redirectUrl,
	channel,
}: RequestEmailConfirmationMutationVariables) => {
	"use server";
	const variables: RequestEmailConfirmationMutationVariables = {
		email,
		redirectUrl,
		channel,
	};

	const data = await executeGraphQL<
		RequestEmailConfirmationMutation,
		RequestEmailConfirmationMutationVariables
	>(RequestEmailConfirmationDocument, {
		cache: "no-cache",
		variables,
	});

	return data;
};
