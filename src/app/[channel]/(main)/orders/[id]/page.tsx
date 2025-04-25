import Image from "next/image";
import Link from "next/link";
import { CurrentUserOrderListDocument, PaymentChargeStatusEnum } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { LoginForm } from "@/ui/components/LoginForm";
import { formatDate, formatMoney } from "@/lib/utils";
import { PaymentStatus } from "@/ui/components/PaymentStatus";
import React from "react";

const OrderDetailPage = async ({ params }: { params: { id: string; channel: string } }) => {
	const { me: user } = await executeGraphQL(CurrentUserOrderListDocument, {
		cache: "no-cache",
	});

	if (!user) {
		return <LoginForm />;
	}

	const orders = user.orders?.edges || [];
	const orderDetail = orders.find((order) => order.node.id === params.id);
	const products = orderDetail?.node?.lines || [];

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<Link
					href={`/${params.channel}/orders`}
					className="inline-flex items-center rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
				>
					← Back to Orders
				</Link>
			</div>
			<div className="flex flex-col gap-8 lg:flex-row">
				{/* Left Panel - Products List */}
				<div className="lg:w-[68%]">
					<div className="rounded-lg bg-white p-6 shadow-sm">
						<h2 className="mb-6 text-xl font-semibold">Order #{orderDetail?.node.number}</h2>
						<div className="space-y-4">
							{products.map((item) => {
								if (!item.variant) return null;
								const product = item.variant.product;

								return (
									<div
										key={product.id}
										className="flex items-start space-x-6 rounded-lg border border-neutral-200 p-6 transition-all hover:border-neutral-300 hover:shadow-md"
									>
										{product.thumbnail && (
											<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
												<Image
													src={product.thumbnail.url}
													alt={product.thumbnail.alt ?? ""}
													width={200}
													height={200}
													className="h-full w-full object-contain transition-transform hover:scale-105"
												/>
											</div>
										)}
										<div className="flex flex-grow flex-col justify-between">
											<div>
												<h3 className="font-medium text-neutral-900">{product.name}</h3>
											</div>
											<div className="mt-4 flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<span className="text-sm font-medium text-neutral-700">Quantity:</span>
													<span className="text-sm text-neutral-600">{item.quantity}</span>
												</div>
												<div className="text-right">
													<div className="text-sm font-medium text-neutral-900">
														{item.variant.pricing?.price &&
															formatMoney(
																item.variant.pricing.price.gross.amount,
																item.variant.pricing.price.gross.currency,
															)}
													</div>
													<div className="mt-1 text-sm text-neutral-500">per unit</div>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Right Panel - Order Summary */}
				<div className="lg:w-[32%]">
					<div className="rounded-lg bg-neutral-50 p-6 lg:sticky lg:top-4">
						<h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
						<div className="space-y-3">
							<div>
								<p className="text-neutral-600">Customer</p>
								<p className="font-medium">
									{user.firstName} {user.lastName}
								</p>
								<p className="text-sm text-neutral-500">{user.email}</p>
							</div>
							<div className="flex items-center justify-between py-1">
								<span className="text-neutral-600">Date</span>
								<time dateTime={orderDetail?.node.created} className="text-sm font-medium">
									{orderDetail?.node.created && formatDate(new Date(orderDetail.node.created))}
								</time>
							</div>
							<div className="flex items-center justify-between py-1">
								<span className="text-neutral-600">Status</span>
								<PaymentStatus status={orderDetail?.node.paymentStatus as unknown as PaymentChargeStatusEnum} />
							</div>
							<div className="mt-3 border-t pt-3">
								<div className="flex items-center justify-between font-semibold">
									<span>Total</span>
									<span>
										{formatMoney(
											orderDetail?.node.total.gross.amount || 0,
											orderDetail?.node.total.gross.currency || "",
										)}
									</span>
								</div>
							</div>
							<button className="mt-3 w-full rounded-md bg-slate-800 py-2 text-white">Confirm</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailPage;
