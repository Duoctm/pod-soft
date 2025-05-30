import { ShoppingCart } from "lucide-react";
import clsx from "clsx";
import * as Checkout from "@/lib/checkout";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";

export const CartNavItem = async ({ channel }: { channel: string }) => {
	const checkoutId = Checkout.getIdFromCookies(channel);
	const checkout = checkoutId ? await Checkout.find(checkoutId) : null;

	const lineCount = checkout ? checkout.lines.length : 0;

	return (
		<LinkWithChannel href="/cart" className="relative flex items-center" data-testid="CartNavItem">
			<ShoppingCart className="h-6 w-6 shrink-0" aria-hidden="true" />
			{lineCount > 0 ? (
				<div
					className={clsx(
						"absolute bottom-0 right-0 -mb-2 -mr-2 h-4 min-w-[16px] px-1 rounded bg-neutral-900 text-xs font-medium text-white flex items-center justify-center transition-opacity",
						lineCount ? "opacity-100" : "opacity-0"
					)}
				>
					{lineCount > 99 ? "99+" : lineCount}
					<span className="sr-only">item{lineCount > 1 ? "s" : ""} in cart, view bag</span>
				</div>
			) : (
				null
			)}
		</LinkWithChannel>
	);
};
