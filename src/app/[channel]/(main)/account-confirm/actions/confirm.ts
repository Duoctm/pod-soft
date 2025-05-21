"use server";
import {
	ConfirmAccountDocument,
	type ConfirmAccountMutation,
	type ConfirmAccountMutationVariables,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function confirmAccountOnServer(email: string, token: string) {
	"use server";
	try {
		const { confirmAccount } = await executeGraphQL<ConfirmAccountMutation, ConfirmAccountMutationVariables>(
			ConfirmAccountDocument,
			{
				variables: {
					email: email,
					token: token,
				},
			},
		);

		return confirmAccount;
	} catch (error) {
		throw error;
	}
}
