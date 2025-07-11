'use server';

import { type PrintingTechnology, type PrintSide, PublicPrintingAdditionalServicesOfDesignDocument, PublicPrintingPriceRulesDocument, Status } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";


async function getAdditionalService(channel: string, first: number, after: string | null) {
    const data = await executeGraphQL(PublicPrintingAdditionalServicesOfDesignDocument, {
        variables: {
            channel: channel,
            first: first,
            after: after
        },
    });
    return data;
}

async function getPrintingPriceRules(objectId: number, printTech: PrintingTechnology[], channel: string, printSide: PrintSide) {
    const data = await executeGraphQL(PublicPrintingPriceRulesDocument, {
        variables: {
            filter: {
                status: Status.Active,
                objectId: objectId,
                printingTechnologies: printTech,
                printSide: printSide
            },
            sortBy: null,
            channel: channel
        }
    });
    return data.publicPrintingPriceRules?.edges;
}


export { getAdditionalService, getPrintingPriceRules }


