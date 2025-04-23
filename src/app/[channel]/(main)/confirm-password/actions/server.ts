// server.ts
"use server";

import { GraphQLClient, gql } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

// Define types for the response
interface PasswordError {
	field: string;
	message: string;
}

interface User {
	id: string;
	email: string;
}

interface SetPasswordResponse {
	setPassword: {
		errors: PasswordError[];
		user: User | null;
	};
}

const SET_PASSWORD_MUTATION = gql`
	mutation SetPassword($email: String!, $token: String!, $password: String!) {
		setPassword(email: $email, token: $token, password: $password) {
			errors {
				field
				message
			}
			user {
				id
				email
			}
		}
	}
`;

export async function setPasswordOnServer(email: string, token: string, password: string) {
	const client = new GraphQLClient(SALEOR_API_URL);
	const result = await client.request<SetPasswordResponse>(SET_PASSWORD_MUTATION, {
		email,
		token,
		password,
	});
	return result.setPassword;
}
