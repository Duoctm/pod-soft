// server.ts
"use server";

import { GraphQLClient, gql } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

// Define types for the response
interface User {
	id: string;
	email: string;
	isActive: boolean;
}

interface AccountError {
	field: string;
	message: string;
	code: string;
}

interface ConfirmAccountResponse {
	confirmAccount: {
		user: User | null;
		errors: AccountError[];
	};
}

const ACCOUNT_CONFIRM_MUTATION = gql`
	mutation ConfirmAccount($email: String!, $token: String!) {
		confirmAccount(email: $email, token: $token) {
			user {
				id
				email
				isActive
			}
			errors {
				field
				message
				code
			}
		}
	}
`;

export async function confirmAccountOnServer(email: string, token: string) {
	const client = new GraphQLClient(SALEOR_API_URL);
	const result = await client.request<ConfirmAccountResponse>(ACCOUNT_CONFIRM_MUTATION, { email, token });
	return result.confirmAccount;
}
