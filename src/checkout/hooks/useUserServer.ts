"use server";
import { executeGraphQL } from "@/lib/graphql";
import { CustomUserDocument, CustomUserQuery, CustomUserQueryVariables } from "@/gql/graphql";

// export interface Country {
// 	__typename?: "Country";
// 	country: string;
// 	code: string;
// }

// export interface Address {
// 	__typename?: "Address";
// 	id: string;
// 	city: string;
// 	phone: string | null | undefined;
// 	postalCode: string;
// 	companyName: string | null;
// 	cityArea: string | null;
// 	streetAddress1: string;
// 	streetAddress2: string | null;
// 	countryArea: string | null;
// 	country: Country;
// 	firstName: string;
// 	lastName: string;
// }

// export interface User {
// 	__typename?: "User";
// 	id: string;
// 	email: string;
// 	firstName: string;
// 	lastName: string;
// 	addresses: Address[] | null;
// 	defaultBillingAddress: Address | null;
// 	defaultShippingAddress: Address | null;
// }

export type Country = {
	__typename?: 'CountryDisplay',
	country: string,
	code: string
}

export type Address = {
	__typename?: 'Address',
	id: string,
	city: string,
	phone?: string | null,
	postalCode: string,
	companyName: string,
	cityArea: string,
	streetAddress1: string,
	streetAddress2: string,
	countryArea: string,
	firstName: string,
	lastName: string,
	country: Country
}

export type User = {
	__typename?: 'User',
	id: string,
	email: string,
	firstName: string,
	lastName: string,
	addresses: Array<Address>,
	defaultBillingAddress?: Address | null,
	defaultShippingAddress?: Address | null
}



export const getUserServer = async () => {
	"use server";
	const { me: user }: CustomUserQuery = await executeGraphQL<CustomUserQuery, CustomUserQueryVariables>(CustomUserDocument, {
		cache: "no-cache",
	});
	if (!user) throw new Error("User not found");
	return user;
};
