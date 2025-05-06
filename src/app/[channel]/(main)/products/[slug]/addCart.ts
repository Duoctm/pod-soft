"use server";
import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import { checkoutLinesAddMultipleItems } from "./utils/checkoutLinesAddMultipleItems";
import * as Checkout from "@/lib/checkout";
import { getUserServer } from "@/checkout/hooks/useUserServer";
import { type CheckoutLineInput } from "@/gql/graphql";

export type ErrorResponse = {
	error: boolean;
	type: string;
	messages: {
		field: string;
		message: string;
	}[];
};

export async function addCart(
	params: { slug: string; channel: string },
	lines: CheckoutLineInput[],
): Promise<ErrorResponse | void> {
	"use server";
	try {
		await getUserServer();

		const checkout = await Checkout.findOrCreate({
			// eslint-disable-next-line @typescript-eslint/await-thenable
			checkoutId: await Checkout.getIdFromCookies(params.channel),
			channel: params.channel,
		});

		invariant(checkout, "This should never happen");

		// eslint-disable-next-line @typescript-eslint/await-thenable
		await Checkout.saveIdToCookie(params.channel, checkout.id);

		const updatedCheckout = await checkoutLinesAddMultipleItems({
			id: checkout.id,
			lines,
		});

		if (updatedCheckout?.errors?.length) {
			return {
				error: true,
				type: "Checkout",
				messages: updatedCheckout.errors.map((error) => ({
					field: error.field || "",
					message: error.message ?? "",
				})),
			};
		}

		revalidatePath("/cart");
	} catch (error) {
		return { error: true, type: "User", messages: [{ field: "user", message: (error as Error).message }] };
	}
}
