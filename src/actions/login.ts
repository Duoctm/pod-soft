"use server";

import { getServerAuthClient } from "@/app/config";

type SignInResult = {
	success: boolean;
	errors?: Array<{
		message: string;
		field?: string;
		code?: string;
	}>;
};

export async function signInAction({
	email,
	password,
}: {
	email: string;
	password: string;
}): Promise<SignInResult> {
	try {
		const { data } = await getServerAuthClient().signIn({ email, password }, { cache: "no-store" });
		// Kiểm tra lỗi từ API
		if (data.tokenCreate.errors && data.tokenCreate.errors.length > 0) {
			return {
				success: false,
				errors: data.tokenCreate.errors.map((error) => ({
					message: error.message || "Invalid credentials",
				})),
			};
		}
		console.log(data.tokenCreate.errors)

		// Đăng nhập thành công
		return {
			success: true,
		};
	} catch (error) {
		console.error("Login server action error:", error);
		return {
			success: false,
			errors: [{ message: "Authentication failed. Please try again." }],
		};
	}
}
