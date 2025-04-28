"use server";
import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
// import { redirect } from "next/navigation";
import { executeGraphQL } from "@/lib/graphql";
import { type AddressInput, CheckoutAddLineDocument, type CountryCode } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";
import { type Address, getUserServer } from "@/checkout/hooks/useUserServer";
import { updateShippingAddress } from "@/checkout/hooks/useShippingAddressUpdate";
import { updateBillingAddress } from "@/checkout/hooks/useBillingAddressUpdate";

export type AddItemResponse = {
	error: boolean;
	message: string;
};

export async function addItem(
	params: { slug: string; channel: string },
	selectedVariantID: string | null,
	quantity: number,
): Promise<AddItemResponse | void> {
	"use server";
	try {
		const user = await getUserServer();
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

		const checkout = await Checkout.findOrCreate({
			// eslint-disable-next-line @typescript-eslint/await-thenable
			checkoutId: await Checkout.getIdFromCookies(params.channel),
			channel: params.channel,
		});

		invariant(checkout, "This should never happen");

		// eslint-disable-next-line @typescript-eslint/await-thenable
		await Checkout.saveIdToCookie(params.channel, checkout.id);

		if (!selectedVariantID) {
			return;
		}

		// TODO: error handling
		await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkout.id,
				productVariantId: decodeURIComponent(selectedVariantID),
				quantity: quantity,
			},
			cache: "no-cache",
		});

		if (checkout?.id && user?.defaultShippingAddress) {
			const shippingAddressInput = convertUserAddressToAddressInput(user.defaultShippingAddress);
			await updateShippingAddress({ checkoutId: checkout.id, shippingAddress: shippingAddressInput });
		}
		if (checkout?.id && user?.defaultBillingAddress) {
			const billingAddressInput = convertUserAddressToAddressInput(user.defaultBillingAddress);
			await updateBillingAddress({
				checkoutId: checkout.id,
				billingAddress: billingAddressInput,
			});
		}

		revalidatePath("/cart");
	} catch (error) {
		return { error: true, message: (error as Error).message };
	}
}
