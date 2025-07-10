import { useState, useCallback } from 'react';
import { getPublicPrintingAdditionServices } from '../actions/getPublicPrintingAdditionServices';
import type { PrintingAdditionalServiceCountableConnection } from '@/gql/graphql';

export const useAdditionalServices = (channel: string) => {
    const [publicPrintingAdditionalServices, setPublicPrintingAdditionalServices] = useState<
        Pick<PrintingAdditionalServiceCountableConnection, "edges" | "__typename"> | null
    >(null);
    const [services, setServices] = useState<string[] | null>(null);
    const [serviceDetails, setServiceDetails] = useState<{
        id: string;
        name: string;
        price: number;
        currency: string;
    }[] | null>(null);

    const getPublicPrintingAdditionalServices = useCallback(async () => {
        try {
            const services = await getPublicPrintingAdditionServices(channel);
            if (services) {
                setPublicPrintingAdditionalServices(services as Pick<PrintingAdditionalServiceCountableConnection, "edges" | "__typename">);
            }
        } catch (error) {
            console.error("Error fetching printing additional services:", error);
        }
    }, [channel]);

    const handleSetOptions = useCallback(
        (ids: string[], serviceDetails: { id: string, name: string, price: number, currency: string }[]) => {
            if (!ids || !serviceDetails) return;
            console.log("🚀 useAdditionalServices - ids:", ids);
            setServices(ids);
            setServiceDetails(serviceDetails);
        },
        [],
    );

    return {
        publicPrintingAdditionalServices,
        services,
        serviceDetails,
        getPublicPrintingAdditionalServices,
        handleSetOptions,
    };
};
