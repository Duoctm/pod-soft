// server.ts
"use server";

import { GraphQLClient, gql } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

// Define types for the response
interface PasswordResetError {
	field: string;
	message: string;
}

interface RequestPasswordResetResponse {
	requestPasswordReset: {
		errors: PasswordResetError[];
	};
}

const REQUEST_PASSWORD_RESET_MUTATION = gql`
	mutation requestPasswordReset($email: String!, $channel: String!, $redirectUrl: String!) {
		requestPasswordReset(email: $email, channel: $channel, redirectUrl: $redirectUrl) {
			errors {
				field
				message
			}
		}
	}
`;

export async function requestPasswordResetOnServer(email: string, channel: string, redirectUrl: string) {
	const client = new GraphQLClient(SALEOR_API_URL);
	const result = await client.request<RequestPasswordResetResponse>(REQUEST_PASSWORD_RESET_MUTATION, {
		email,
		channel,
		redirectUrl,
	});
	return result.requestPasswordReset;
}
