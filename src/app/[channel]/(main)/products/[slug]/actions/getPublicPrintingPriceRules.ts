'use server';

import { type PrintingTechnology, type PrintSide, PublicPrintingPriceRulesDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function getPublicPrintingPriceRules({
    channel,
    printingTechnologies,
    usedForCalculation,
    printSide,
    objectIds,
    minQuantity,

}: {
    channel: string
    printingTechnologies: PrintingTechnology[];
    usedForCalculation?: boolean;
    printSide?: PrintSide;
    objectIds: number[];
    minQuantity?: number;
    signal?: AbortSignal;
}) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const { publicPrintingPriceRules } = await executeGraphQL(PublicPrintingPriceRulesDocument, {
            variables: {
                filter: {
                    printingTechnologies: printingTechnologies,
                    usedForCalculation: usedForCalculation,
                    printSide: printSide,
                    objectIds: objectIds,
                    minQuantity: minQuantity
                },
                channel: channel
            },

        })

        if (!publicPrintingPriceRules) {
            return null;
        }



        return publicPrintingPriceRules;

    } catch (error) {
        console.error('Error fetching public printing price rules:', error);
        throw new Error('Failed to fetch public printing price rules');

    }


}