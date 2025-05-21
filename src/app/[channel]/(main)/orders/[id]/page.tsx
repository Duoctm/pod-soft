"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { CurrentUserOrderListQuery, type PaymentChargeStatusEnum } from "@/gql/graphql";

// import { LoginForm } from "@/ui/components/LoginForm";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { PaymentStatus } from "@/ui/components/PaymentStatus";
import { BreadcrumbClient } from "./BreadcrumbClient";
import { getOrderUser } from "./actions";
import { addCart } from "../../products/[slug]/actions/addCart";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import updateCheckoutLineMetadata from "@/hooks/useAddMetadata";

const OrderDetailPage = ({ params }: { params: { id: string; channel: string } }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState<CurrentUserOrderListQuery["me"] | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchUser = async () => {
			setIsLoading(true);
			try {
				const data = await getOrderUser();
				setUser(data as CurrentUserOrderListQuery["me"]);
			} catch (e) {
				console.error("Failed to fetch user", e);
			} finally {
				setIsLoading(false);
			}
		};
		fetchUser();
	}, []);

	if (!user || isLoading) {
		return (
			<div className="container mx-auto animate-pulse px-4 py-8">
				<div className="mb-6 h-8 w-48 rounded bg-gray-200"></div>
				<div className="flex flex-col gap-8 lg:flex-row">
					<div className="lg:w-[68%]">
						<div className="rounded-lg bg-white p-6 shadow-sm">
							<div className="mb-6 h-6 w-32 rounded bg-gray-200"></div>
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="flex items-start space-x-6 rounded-lg border border-gray-200 p-6">
										<div className="h-24 w-24 rounded-lg bg-gray-200"></div>
										<div className="flex-grow">
											<div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
											<div className="h-4 w-1/4 rounded bg-gray-200"></div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="lg:w-[32%]">
						<div className="rounded-lg bg-gray-100 p-6">
							<div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-4 w-full rounded bg-gray-200"></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const orders = user.orders?.edges || [];
	const orderDetail = orders.find((order) => order.node.id === params.id);
	const products = orderDetail?.node?.lines || [];

	// if (!user?.email &&  !user?.id) {
	//     return <LoginForm params={{ channel: params.channel }} />;
	// }

	const handleReorder = async () => {
		setIsLoading(true);
		try {
			const items = products.reduce(
				(acc, product) => {
					if (product.variant?.id) {
						acc.push({
							variantId: product.variant.id,
							quantity: product.quantity,
						});

						if (product.metadata?.length) {
							const designMetadata = product.metadata.find((item) => item.key === "design");
							if (designMetadata) {
								updateCheckoutLineMetadata(product.variant.id, product.metadata).catch(console.error);
							}
						}
					}
					return acc;
				},
				[] as { variantId: string; quantity: number }[],
			);

			const reorder = await addCart({ channel: params.channel, slug: "" }, items);

			if (reorder?.error?.error === 1) {
				router.push(`/${params.channel}/login`);
			} else if (reorder?.error?.error === 2) {
				reorder.error.messages.forEach(({ message }) => toast.error(message));
			} else {
				toast.success("Product added to cart");
				router.push(`/${params.channel}/cart`);
			}
		} catch (error) {
			toast.error("Failed to process reorder");
		} finally {
			setIsLoading(false);
			setIsDialogOpen(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<ToastContainer />
			<BreadcrumbClient channel={params.channel} id={orderDetail?.node.number} />
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
								const media = item.variant.media;

								return (
									<div
										key={product.id}
										className="flex items-start space-x-6 rounded-lg border border-neutral-200 p-6 transition-all hover:border-neutral-300 hover:shadow-md"
									>
										{media && (
											<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
												<Image
													src={media[0].url}
													alt={media[0].alt ?? ""}
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
					<div className="rounded-lg bg-neutral-50 p-6 lg:sticky lg:top-40">
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
								<PaymentStatus
									status={orderDetail?.node.paymentStatus as unknown as PaymentChargeStatusEnum}
								/>
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
						</div>
						<div className="flex flex-1 items-center justify-end">
							<button
								className=" flex1 mt-3 flex w-auto justify-end rounded-md bg-[#8C3859] px-4 py-2 text-white"
								onClick={() => setIsDialogOpen(true)}
							>
								Re-Order
							</button>
						</div>
					</div>
					{/* Confirmation Dialog */}
					<Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50">
						<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
						<div className="fixed inset-0 flex items-center justify-center p-4">
							<Dialog.Panel className="mx-auto w-full max-w-4xl rounded bg-white p-6 shadow-lg">
								<Dialog.Title className="text-lg font-semibold">Confirm Re-Order</Dialog.Title>
								<Dialog.Description className="mt-2 text-neutral-700">
									Are you sure you want to re-order these products?
								</Dialog.Description>
								<div className="mt-4 max-h-60 overflow-auto">
									{products.map((item) => {
										if (!item.variant) return null;
										const product = item.variant.product;
										const media = item.variant.media;
										return (
											<div
												key={product.id}
												className="mb-3 rounded-lg border-b p-3 pb-2 transition-all hover:bg-neutral-50"
											>
												<div className="flex items-center gap-4">
													{media && media[0] && (
														<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200">
															<Image
																src={media[0].url}
																alt={media[0].alt ?? product.name}
																width={64}
																height={64}
																className="h-full w-full object-contain transition-transform hover:scale-105"
															/>
														</div>
													)}
													<div className="flex-grow">
														<div className="flex items-center justify-between">
															<p className="line-clamp-1 font-medium text-neutral-900">{product.name}</p>
															<p className="text-sm font-medium text-neutral-600">x{item.quantity}</p>
														</div>
														<p className="mt-1 text-sm text-neutral-600">
															{item.variant.pricing?.price &&
																formatMoney(
																	item.variant.pricing.price.gross.amount,
																	item.variant.pricing.price.gross.currency,
																)}
														</p>
													</div>
												</div>
											</div>
										);
									})}
								</div>
								<div className="mt-6 flex justify-end gap-2">
									<button
										className="rounded bg-neutral-200 px-4 py-2 text-neutral-700 hover:bg-neutral-300"
										onClick={() => setIsDialogOpen(false)}
									>
										Cancel
									</button>
									<button
										className={cn(
											"rounded bg-[#8C3859] px-4 py-2 text-white",
											isLoading && "cursor-not-allowed opacity-50",
										)}
										onClick={handleReorder}
										disabled={isLoading}
									>
										{isLoading ? "Processing..." : "Confirm"}
									</button>
								</div>
							</Dialog.Panel>
						</div>
					</Dialog>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailPage;
