"use server";

import {
	PasswordChangeDocument,
	CustomUserDocument,
	type CustomUserQuery,
	AccountUpdateDocument,
	AccountAddressCreateDocument,
	AccountAddressUpdateDocument,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export type UpdatePassWordType = {
	oldPassword: string;
	newPassword: string;
};

export const currentUser = async () => {
	try {
		const { me: user }: CustomUserQuery = await executeGraphQL(CustomUserDocument, {
			cache: "no-cache",
		});
		if (!user) {
			return null;
		}
		return user;
	} catch (error) {
		console.error("Error fetching user data:", error);
		return null;
	}
};

export const updatePassword = async (payload: UpdatePassWordType) => {
	try {
		const { passwordChange } = await executeGraphQL(PasswordChangeDocument, {
			variables: {
				oldPassword: payload.oldPassword,
				newPassword: payload.newPassword,
			},
		});
		return passwordChange;
	} catch (error) {
		console.error("Error fetching user data:", error);
		return null;
	}
};

export const updateCurentAddress = async (
	address_id: string,
	payload: {
		city: string;
		companyName: string;
		firstName: string;
		lastName: string;
		streetAddress1: string;
		country: { country: string; code: string };
	},
) => {
	try { 
		const { accountAddressUpdate } = await executeGraphQL(AccountAddressUpdateDocument, {
			variables: {
				id: address_id,
				input: {
					firstName: payload.firstName,
					lastName: payload.lastName,
					city: payload.city,
					companyName: payload.companyName,
					streetAddress1: payload.streetAddress1,
					country: payload.country.code as unknown as any,
				},
			},
		});
		if (!accountAddressUpdate) {
			return null;
		}

		return accountAddressUpdate;
	} catch (error) {
		console.error("Error fetching user data:", error);
		return null;
	}
};





export const updateAddress = async (
	payload: {
		city: string;
		companyName: string;
		firstName: string;
		lastName: string;
		streetAddress1: string;
		country: { country: string; code: string };
	},
) => {
	try { 
		const { accountAddressCreate } = await executeGraphQL(AccountAddressCreateDocument, {
			variables: {
				input: {
					firstName: payload.firstName,
					lastName: payload.lastName,
					city: payload.city,
					companyName: payload.companyName,
					streetAddress1: payload.streetAddress1,
					country: payload.country.code as unknown as any,
				},
			},
		});
		console.log(accountAddressCreate)

		if (!accountAddressCreate) {
			return null;
		}
		return accountAddressCreate;
	} catch (error) {
		console.error("Error fetching user data:", error);
		return null;
	}
};

export const updateUser = async (payload: { firstName: string; lastName: string; email: string }) => {
	try {
		const { accountUpdate } = await executeGraphQL(AccountUpdateDocument, {
			variables: {
				input: {
					firstName: payload.firstName,
					lastName: payload.lastName,
				},
			},
		});
		if (!accountUpdate) {
			return null;
		}

		return accountUpdate;
	} catch (error) {
		console.error("Error fetching user data:", error);
		return null;
	}
};
