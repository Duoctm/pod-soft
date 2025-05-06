"use server";
import { type AddressInput, type CountryCode, LanguageCodeEnum } from "@/gql/graphql";
import { type Address, getUserServer } from "@/checkout/hooks/useUserServer";
import { updateShippingAddress } from "@/checkout/hooks/useShippingAddressUpdate";
import { updateBillingAddress } from "@/checkout/hooks/useBillingAddressUpdate";
import { getCheckoutServer } from "@/checkout/hooks/useCheckoutServer";

export type ErrorResponse = {
	error: boolean;
	message: string;
};

const convertUserAddressToAddressInput = (address: Address): AddressInput => {
	return {
		firstName: address.firstName,
		lastName: address.lastName,
		phone: address.phone || undefined,
		companyName: address.companyName,
		country: address.country.code as CountryCode,
		countryArea: address.countryArea,
		city: address.city,
		cityArea: address.cityArea,
		postalCode: address.postalCode,
		streetAddress1: address.streetAddress1,
		streetAddress2: address.streetAddress2,
	};
};

export async function checkout(checkoutId: string): Promise<ErrorResponse | void> {
	"use server";
	try {
		const user = await getUserServer();

		const { checkout } = await getCheckoutServer({ id: checkoutId, languageCode: LanguageCodeEnum.EnUs });

		if (!checkout) {
			throw new Error("Checkout not found");
		}

		if (!checkout.shippingAddress && user.defaultShippingAddress) {
			const shippingAddressInput = convertUserAddressToAddressInput(user.defaultShippingAddress);
			await updateShippingAddress({
				checkoutId: checkout.id,
				shippingAddress: shippingAddressInput,
			});
		}
		if (!checkout.billingAddress && user.defaultBillingAddress) {
			const billingAddressInput = convertUserAddressToAddressInput(user.defaultBillingAddress);
			await updateBillingAddress({
				checkoutId: checkout.id,
				billingAddress: billingAddressInput,
			});
		}
	} catch (error) {
		return { error: true, message: (error as Error).message };
	}
}
