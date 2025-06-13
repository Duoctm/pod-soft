'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { getUserServer } from '../checkout/hooks/useUserServer';
import { getCheckoutDetail } from './[channel]/auth/keycloak-callback/checkoutdata';

async function getCheckout(channel: string) {
    try {
        const user = await getUserServer();
        if (user.status === true) {
            await getCheckoutDetail(channel);
        }
    } catch (error) {
        console.error('Error in getCheckout:', error);
    }
}

export function AppLifecycleEvents() {
    const pathname = usePathname();
    const params = useParams();
    const channel = params.channel as string;
    const timeoutRef = useRef<NodeJS.Timeout>();

    const debouncedGetCheckout = useCallback((channel: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            void getCheckout(channel);
        }, 200);
    }, []);

    // Only track route changes
    useEffect(() => {
        if (channel) {
            debouncedGetCheckout(channel);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [pathname, channel, debouncedGetCheckout]);

    return null;
}
