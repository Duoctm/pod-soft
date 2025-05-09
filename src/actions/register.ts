"use server";

import {  RegisterAccountDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

type RegisterData = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
};

type RegisterResult = {
	success: boolean;
	errors?: Array<{
		message: string;
		field?: string;
		code?: string;
	}>;
};

export async function registerAccount(data: RegisterData): Promise<RegisterResult> {
	try {
		const { accountRegister } = await executeGraphQL(RegisterAccountDocument, {
			variables: {
				email: data.email,
				password: data.password,
				firstName: data.firstName,
				lastName: data.lastName,
				redirectUrl: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/default-channel/account-confirm`,
				channel: "default-channel",
			},
		});
		console.log(accountRegister)
		// Check for errors from the GraphQL response
		if (accountRegister?.errors && accountRegister.errors.length > 0) {
			return {
				success: false,
				errors: accountRegister.errors.map((error) => ({
					message: error.message || "Registration error",
					field: error.field || undefined,
				})),
			};
		}

		// Registration successful
		return {
			success: true,
		};
	} catch (error) {
		console.error("❌ Register action failed:", error);

		// Return a generic error
		return {
			success: false,
			errors: [{ message: "Registration failed due to server error" }],
		};
	}
}
