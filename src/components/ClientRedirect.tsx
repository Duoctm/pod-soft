"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ClientRedirect = ({ channel }: { channel: string }) => {
    const searchParams = useSearchParams();
    const queryValue = searchParams.get("query");
    const router = useRouter();

    useEffect(() => {
        if (queryValue) {
            router.push(`/${channel}/service#${queryValue}`);
        }
    }, [queryValue]);

    return null; // This component only handles redirect
};

export default ClientRedirect;
