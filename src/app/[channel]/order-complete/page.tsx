"use client";

import { Suspense } from "react";
import CheckoutCompleteClient from "./components/CheckoutCompleteClient";

const CheckoutCompletePage = ({
    params,
}: {
    params: {
        channel: string;
    };
}) => {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <CheckoutCompleteClient channel={params.channel} />
        </Suspense>
    );
};
export default CheckoutCompletePage;
