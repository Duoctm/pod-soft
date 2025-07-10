'use server'

import { PublicPrintingAdditionalServicesDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const getPublicPrintingAdditionServices = async (channel: string) => {
    try {
        const { publicPrintingAdditionalServices } = await executeGraphQL(PublicPrintingAdditionalServicesDocument, {
            variables: {
                channel,
            },
        })
        if (!publicPrintingAdditionalServices) {
            console.warn("No public printing additional services found for channel:", channel);
            return [];
        }

        return publicPrintingAdditionalServices || [];
    } catch (error) {
        console.error("Failed to fetch printing addition services:", error);
        return [];
    }
}