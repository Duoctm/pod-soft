/* eslint-disable import/no-default-export */
'use client';

import { useEffect, useState } from "react";
import confetti from "canvas-confetti"; // Make sure this import is present
import { useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import { type CurrentUserOrderListQuery } from "@/gql/graphql";
import { getOrderUser } from "@/app/[channel]/(main)/orders/[id]/actions";
import { formatDate, formatMoney } from "@/lib/utils";

export default function CheckoutCompleteClient({ channel }: { channel: string }) {
    const [user, setUser] = useState<CurrentUserOrderListQuery["me"] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const param = useSearchParams();
    const orderId = param.get("orderId");

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const data = await getOrderUser();
                if (data) {
                    setUser(data as CurrentUserOrderListQuery["me"]);
                    (confetti as (options: any) => void)({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            } catch (e) {
                console.error("Failed to fetch user", e);
            } finally {
                setIsLoading(false);
            }
        };
        void fetchUser();
    }, []);

    if (isLoading || !user) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const orderDetail = user?.orders?.edges.find((order) => order.node.id === orderId)?.node;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full flex flex-col items-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                    Thank you for your order!
                </h1>
                <p className="text-gray-600 text-center mb-4">
                    Your order <span className="font-semibold text-gray-800">#{orderDetail?.number}</span> has been placed successfully.
                </p>
                <div className="w-full bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-800">{user.firstName + " " + user.lastName}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-800">{user.email}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Order Number:</span>
                        <span className="text-gray-800">{orderDetail?.number}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Order Date:</span>
                        <span className="text-gray-800">
                            {orderDetail?.created ? formatDate(new Date(orderDetail.created)) : ""}
                        </span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700">Total:</span>
                        <span className="text-gray-800  font-bold">
                            {
                                formatMoney(orderDetail?.total.gross.amount as number, orderDetail?.total.gross.currency as string)
                            }
                        </span>
                    </div>
                </div>
                <div className="w-full mb-4">
                    <h2 className="font-semibold text-gray-700 mb-2">Order Details</h2>
                    <div className="flex items-center bg-gray-50 rounded-lg p-3 flex-col gap-2 h-52 overflow-auto">
                        {
                            orderDetail?.lines.map((order) => {
                                return <div key={order.variant?.id} className="flex flex-1 w-full">
                                    <Image
                                        width={64}
                                        height={64}
                                        src={order.variant?.media?.[0]?.url || ""}
                                        alt={order.variant?.media?.[0]?.alt || ""}
                                        className="w-16 h-16 object-cover rounded mr-4 border"
                                    />
                                    <div className="flex flex-1 flex-col">
                                        <div className="text-gray-600 text-sm">{order.variant?.product.name}</div>
                                        <div className="font-medium text-gray-800">{order.variant?.name}</div>
                                        <div className="text-gray-800 text-sm font-semibold flex items-center justify-between">
                                            <div className="text-gray-600 text-sm">Qty: {order.quantity}</div>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
                <a
                    href="/"
                    className="w-full bg-[#8C3859] hover:bg-[#8C3859]/80 text-white font-semibold py-2 rounded-lg text-center transition mb-2"
                >
                    Go to Homepage
                </a>
                <a
                    href={`/${channel}/products`}
                    className="w-full text-[#8C3859] hover:underline text-center text-sm"
                >
                    Continue Shopping
                </a>
            </div>
        </div>
    );
}
