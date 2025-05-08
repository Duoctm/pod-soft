// server.ts
"use server";

import { ConfirmAccountDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

// import { GraphQLClient, gql } from "graphql-request";

// const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

// // Define types for the response
// interface User {
// 	id: string;
// 	email: string;
// 	isActive: boolean;
// }

// interface AccountError {
// 	field: string;
// 	message: string;
// 	code: string;
// }

// interface ConfirmAccountResponse {
// 	confirmAccount: {
// 		user: User | null;
// 		errors: AccountError[];
// 	};
// }

// const ACCOUNT_CONFIRM_MUTATION = gql`
// 	mutation ConfirmAccount($email: String!, $token: String!) {
// 		confirmAccount(email: $email, token: $token) {
// 			user {
// 				id
// 				email
// 				isActive
// 			}
// 			errors {
// 				field
// 				message
// 				code
// 			}
// 		}
// 	}
// `;

export async function confirmAccountOnServer(email: string, token: string) {
	try {
		const {confirmAccount} = await executeGraphQL(ConfirmAccountDocument, {
			variables: {
				email: email,
				token: token
			}
		})
	 return confirmAccount


	} catch (error) {
		throw error
	}
}
