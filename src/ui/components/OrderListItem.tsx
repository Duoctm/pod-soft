import Image from "next/image";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { formatDate, formatMoney, getHrefForVariant } from "@/lib/utils";
import { type OrderDetailsFragment } from "@/gql/graphql";
import { PaymentStatus } from "@/ui/components/PaymentStatus";

type Props = {
	order: OrderDetailsFragment;
};

export const OrderListItem = ({ order }: Props) => {
	return (
		<li className="rounded-lg bg-white shadow-sm">
			<div className="flex flex-col lg:flex-row">
				{/* Left Panel - Product List */}
				<div className="border-r p-6 lg:w-[68%]">
					<h2 className="mb-6 text-xl font-semibold">Order #{order.number}</h2>
					<div className="space-y-4">
						{order.lines.map((item) => {
							if (!item.variant) return null;
							const product = item.variant.product;

							return (
								<div
									key={product.id}
									className="flex items-start rounded-md border p-4 transition-colors hover:bg-neutral-50"
								>
									{product.thumbnail && (
										<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-neutral-50">
											<Image
												src={product.thumbnail.url}
												alt={product.thumbnail.alt ?? ""}
												width={100}
												height={100}
												className="h-full w-full object-contain"
											/>
										</div>
									)}
									<div className="ml-4 flex-grow">
										<LinkWithChannel
											href={getHrefForVariant({
												productSlug: product.slug,
												variantId: item.variant.id,
											})}
											className="text-base font-medium text-neutral-900 hover:text-neutral-700"
										>
											{product.name}
										</LinkWithChannel>
										<div className="mt-1 flex items-center justify-between">
											<div className="text-sm text-neutral-600">
												Qty: {item.quantity} ×{" "}
												{item.variant.pricing?.price &&
													formatMoney(
														item.variant.pricing.price.gross.amount,
														item.variant.pricing.price.gross.currency,
													)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Right Panel - Order Summary */}
				<div className="bg-neutral-50 p-6 lg:w-[32%]">
					<h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between py-1">
							<span className="text-neutral-600">Date</span>
							<time dateTime={order.created} className="text-sm font-medium">
								{formatDate(new Date(order.created))}
							</time>
						</div>
						<div className="flex items-center justify-between py-1">
							<span className="text-neutral-600">Status</span>
							<PaymentStatus status={order.paymentStatus} />
						</div>
						<div className="mt-3 border-t pt-3">
							<div className="flex items-center justify-between font-semibold">
								<span>Total</span>
								<span>{formatMoney(order.total.gross.amount, order.total.gross.currency)}</span>
							</div>
						</div>
						 <button className="w-full mt-3 rounded-md bg-slate-800 text-white  py-2">Confirm</button>
					</div>
				</div>
			</div>
		</li>
	);
};
