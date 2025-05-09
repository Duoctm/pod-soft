"use server";
import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import { checkoutLinesAddMultipleItems } from "./utils/checkoutLinesAddMultipleItems";
import * as Checkout from "@/lib/checkout";
import { getUserServer } from "@/checkout/hooks/useUserServer";
import { type CheckoutLineInput } from "@/gql/graphql";

export type ErrorResponse = {
	error: number;
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
		const check = await getUserServer();
		if (check.status == false) {
			return { error: 1, type: "User", messages: [{ field: "user", message: "" }] };
		}


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
				error: 2,
				type: "Checkout",
				messages: updatedCheckout.errors.map((error) => ({
					field: error.field || "",
					message: error.message ?? "",
				})),
			};
		}

		revalidatePath("/cart");
	} catch (error) {
		//console.log('111111111111111111111', error);
		return { error: 3, type: "User", messages: [{ field: "user", message: (error as Error).message }] };
	}
}
