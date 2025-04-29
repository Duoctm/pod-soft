export interface Address {
	firstName: string;
	lastName: string;
	streetAddress1: string;
	streetAddress2: string | null;
	city: string;
	countryArea: string;
	zipCode: string;
	country: string;
	phoneNumber: string;
	company: string | null;
}

export interface FormValues {
	shippingAddress: Address;
	billingAddress: Address;
	useShippingAsBilling: boolean;
}

export interface CountryArea {
	raw?: string | null;
	verbose?: string | null;
	__typename: "ChoiceValue";
}
