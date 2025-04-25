"use server"
import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument, CurrentUserDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";
import { redirect } from "next/navigation";



export async function addItem(params: { slug: string; channel: string }, selectedVariantID: string | null, quantity: number) {
    "use server";

    const { me: user } = await executeGraphQL(CurrentUserDocument, {
        cache: "no-cache",
    });
    if (!user) {
        redirect(`/${params.channel}/login?redirect=/${params.channel}/products/${params.slug}`);
    }
    
    const checkout = await Checkout.findOrCreate({
        checkoutId: await Checkout.getIdFromCookies(params.channel),
        channel: params.channel,
    });

    invariant(checkout, "This should never happen");

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

    revalidatePath("/cart");
}
