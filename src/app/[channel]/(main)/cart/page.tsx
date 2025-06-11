
import { CartPage } from "./CartPage";
import { type Checkout as CheckoutType } from "@/gql/graphql";

export const metadata = {
	title: "Shopping Cart - ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export type checkoutType = Pick<CheckoutType, "__typename" | "id" | "email" | "lines" | "totalPrice">;

export default async function Page({ params }: { params: { channel: string } }) {
	return <CartPage params={params} />

};