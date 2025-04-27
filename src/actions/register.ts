"use server";

import { headers } from "next/headers";
import { RegisterAccountDocument } from "@/gql/graphql";
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
		const headersList = headers();
		const protocol = headersList.get("x-forwarded-proto") || "http"; // Xác định http/https
		const host = headersList.get("host"); // Lấy host ví dụ localhost:3000 hoặc mysite.com

		const redirectUrl = `${protocol}://${host}/default-channel/account-confirm`; // 👈 Tự build URL từ request

		const { accountRegister } = await executeGraphQL(RegisterAccountDocument, {
			variables: {
				email: data.email,
				password: data.password,
				firstName: data.firstName,
				lastName: data.lastName,
				redirectUrl,
				channel: "default-channel",
			},
		});

		if (accountRegister?.errors && accountRegister.errors.length > 0) {
			return {
				success: false,
				errors: accountRegister.errors.map((error) => ({
					message: error.message || "Registration error",
					field: error.field || undefined,
				})),
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("❌ Register action failed:", error);

		return {
			success: false,
			errors: [{ message: "Registration failed due to server error" }],
		};
	}
}
