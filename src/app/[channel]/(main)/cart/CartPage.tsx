"use client";
import Image from "next/image";
import { CheckoutLink } from "./CheckoutLink";
import { DeleteLineButton } from "./DeleteLineButton";
import { ViewDesignButton } from "./ViewDesignButton";
import { DesignButton } from "./DesignButton";
import { formatMoney, getHrefForVariant } from "@/lib/utils";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { CheckoutLineUpdate } from "./CheckoutLineUpdate";
import { useEffect, useState } from "react";
import { checkoutType } from "./page";

const formarCurrentMoney = (amount: number, currency: string) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(amount);
};

export default function CartPage({
	params,
	checkout,
	checkoutId,
}: {
	params: { channel: string };
	checkout: checkoutType;
	checkoutId: string;
}) {
	const [currentQuantity, setCurrentQuantity] = useState(1);
	const [priceGross, setPriceGross] = useState<number>(1);

	useEffect(() => {
		if (checkout.lines.length > 0) {
			const firstPrice = checkout.lines[0]?.variant?.pricing?.price?.gross?.amount;
			setPriceGross(firstPrice ?? 1);
		}
	}, [checkout.lines]);

	const [items, setItems] = useState(checkout.lines);

	const handleQuantityChange = (lineId: string, newQuantity: number) => {
		if (newQuantity > 0) {
			setCurrentQuantity(newQuantity);
			CheckoutLineUpdate({ id: checkoutId, lineId: lineId, quantity: newQuantity });
		}
		setItems((prev: any[]) =>
			prev.map((item) => (item.id === lineId ? { ...item, quantity: newQuantity } : item)),
		);
	};

	return (
		<section className="mx-auto max-w-7xl p-8">
			<h1 className="mt-8 text-3xl font-bold text-neutral-900">Your Shopping Cart</h1>
			<form className="mt-12">
				<ul
					data-testid="CartProductList"
					role="list"
					className="divide-y divide-neutral-200 border-b border-t border-neutral-200"
				>
					{items.map((item) => (
						<li key={item.id} className="flex py-4">
							<div className="aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-neutral-50 sm:h-32 sm:w-32">
								{item.variant?.media && (
									<Image
										src={item.variant.media[0].url}
										alt={item.variant.media[0].alt ?? ""}
										width={200}
										height={200}
										loading="lazy"
										className="h-full w-full object-contain object-center"
									/>
								)}
							</div>
							<div className="relative flex flex-1 flex-col justify-between p-4 py-2">
								<div className="flex justify-between justify-items-start gap-4">
									<div>
										<LinkWithChannel
											href={getHrefForVariant({
												productSlug: item.variant.product.slug,
												variantId: item.variant.id,
											})}
										>
											<h2 className="font-medium text-neutral-700">{item.variant?.product?.name}</h2>
										</LinkWithChannel>
										<p className="mt-1 text-sm text-neutral-500">{item.variant?.product?.category?.name}</p>
										{item.variant.name !== item.variant.id && Boolean(item.variant.name) && (
											<p className="mt-1 text-sm text-neutral-500">Variant: {item.variant.name}</p>
										)}
									</div>
									<p className="text-right font-semibold text-neutral-900">
										{item.quantity === currentQuantity
											? formarCurrentMoney(
													currentQuantity *
														parseInt(item.variant.pricing?.price?.gross.amount as unknown as string),
													item.totalPrice.gross.currency,
												)
											: formatMoney(item.totalPrice.gross.amount, item.totalPrice.gross.currency)}
									</p>
								</div>

								<div className="flex items-center justify-between">
									<div className="text-sm font-bold">
										<div className="text-sm font-bold">
											Qty:
											<input
												type="number"
												value={item.quantity}
												onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
												min="1"
												className="ml-2 max-w-[120px] rounded-md border border-gray-300 p-1 text-center"
											/>
										</div>
									</div>

									<div className="flex space-x-2">
										{Array.isArray(item.metadata) && item.metadata.length > 0 && (
											<ViewDesignButton lineId={item.id} checkout={checkoutId} params={params} />
										)}
										{Array.isArray(item.variant.metadata) && item.variant.metadata.length > 0 && (
											<DesignButton
												colorId={item.variant.attributes[0].values[0].id}
												productId={item.variant.product.id}
												params={params}
												quantity={1}
												selectedVariantId={item.variant.id}
											/>
										)}
									</div>

									<DeleteLineButton
										checkoutId={checkoutId}
										lineId={item.id}
										onRemove={() => {
											setItems((prev) => prev.filter((line) => line.id !== item.id));
										}}
									/>
								</div>
							</div>
						</li>
					))}
				</ul>

				<div className="mt-12">
					<div className="rounded border bg-neutral-50 px-4 py-2">
						<div className="flex items-center justify-between gap-2 py-2">
							<div>
								<p className="font-semibold text-neutral-900">Your Total</p>
								<p className="mt-1 text-sm text-neutral-500">Shipping will be calculated in the next step</p>
							</div>
							<div className="font-medium text-neutral-900">
								{currentQuantity === 1
									? formatMoney(checkout.totalPrice.gross.amount, checkout.totalPrice.gross.currency)
									: formarCurrentMoney(priceGross * currentQuantity, checkout.totalPrice.gross.currency)}
							</div>
						</div>
					</div>
					<div className="mt-10 text-center">
						<CheckoutLink
							checkoutId={checkoutId}
							disabled={!checkout.lines.length}
							className="w-full sm:w-1/3"
						/>
					</div>
				</div>
			</form>
		</section>
	);
}
