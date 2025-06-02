'use client';

import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { getUserServer } from '../checkout/hooks/useUserServer';
import { getCheckoutDetail } from './[channel]/auth/keycloak-callback/checkoutdata';

async function getCheckout(channel: any) {
    const user = await getUserServer();
    if (user.status == true) {
        getCheckoutDetail(channel);
    }
}

export function AppLifecycleEvents() {
    const pathname = usePathname();
    const params = useParams();
    const channel = params.channel;


    // 1. Bắt sự kiện reload hoặc đóng tab
    useEffect(() => {
        const handleBeforeUnload = () => {

            getCheckout(channel);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // 2. Theo dõi chuyển route (pathname thay đổi)
    useEffect(() => {
        getCheckout(channel);
        // Thêm logic nếu cần, ví dụ gửi analytics, reset scroll, v.v.
    }, [pathname]);

    return null; // Không cần render gì cả
}
