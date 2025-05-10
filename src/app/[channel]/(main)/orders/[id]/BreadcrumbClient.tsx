"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/ui/components/BreadcrumbProvider";
import { Breadcrumb } from "./Breadcrumb";

export function BreadcrumbClient({
    channel,
    id,
}: {
    channel: any;
    id: string | undefined;
}) {
    const { setBreadcrumb } = useBreadcrumb();

    useEffect(() => {
        if (channel && id) {
            setBreadcrumb(<Breadcrumb channel={channel} id={id} />);
        }
        return () => setBreadcrumb(null);
    }, [setBreadcrumb, channel, id]);

    return null; // Rất quan trọng: component React phải return JSX hoặc null
}
