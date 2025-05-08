import Link from "next/link";
import { CurrentUserOrderListDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { LoginForm } from "@/ui/components/LoginForm";
import { formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/ui/components/OrderStatusBadge";

export default async function OrderPage() {
	const { me: user } = await executeGraphQL(CurrentUserOrderListDocument, {
		cache: "no-cache",
	});

	if (!user) {
		return <LoginForm />;
	}

	const orders = user.orders?.edges || [];

	if (orders.length === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
				<div className="mx-auto max-w-7xl px-8 py-12">
					<h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
						{user.firstName ? user.firstName : user.email}&rsquo;s Orders
					</h1>
					<div className="mt-10">
						<div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
							<div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
								<svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
								<p className="text-lg font-medium">No orders found</p>
								<p className="text-sm">Start shopping to create your first order</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<div className="mx-auto max-w-7xl px-8 py-12">
				<h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
					{user.firstName ? user.firstName : user.email}&rsquo;s Orders
				</h1>

				{/* Desktop View */}
				<div className="hidden md:block mt-10">
					<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Order ID</th>
									<th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Date</th>
									<th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
									<th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total Products</th>
									<th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{orders.map(({ node: order }) => (
									<tr key={order.id} className="hover:bg-gray-50 transition-colors">
										<td className="px-6 py-4 text-sm font-medium text-gray-900 text-center">#{order.number}</td>
										<td className="px-6 py-4 text-sm text-gray-500 text-center">
											{formatDate(new Date(order.created))}
										</td>
										<td className="px-6 py-4 text-center">
											<OrderStatusBadge status={order.paymentStatus} />
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 text-right">
											{order.lines.length}
										</td>
										<td className="px-6 py-4 text-right">
											<Link
												href={`orders/${order.id}`}
												className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
											>
												View Details
												<svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
												</svg>
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Mobile View */}
				<div className="md:hidden space-y-4 mt-8">
					{orders.map(({ node: order }) => (
						<div
							key={order.id}
							className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
						>
							<div className="flex justify-between items-start mb-4">
								<div className="flex flex-col">
									<span className="text-lg font-semibold text-gray-900">#{order.number}</span>
									<span className="text-sm text-gray-500">{formatDate(new Date(order.created))}</span>
								</div>
								<OrderStatusBadge status={order.paymentStatus} />
							</div>
							<div className="flex justify-between items-center text-sm text-gray-500 mb-4">
								<span>Total Products:</span>
								<span className="font-medium">{order.lines.length}</span>
							</div>
							<Link
								href={`orders/${order.id}`}
								className="block w-full text-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
							>
								View Order Details
							</Link>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
