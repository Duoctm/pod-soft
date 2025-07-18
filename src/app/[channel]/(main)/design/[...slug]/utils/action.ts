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

async function getPrintingPriceRules(printTech: PrintingTechnology[], channel: string, printSide: PrintSide, objectId?: number, _minQuantity?: number) {

    if (objectId) {
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
    else {
        const data = await executeGraphQL(PublicPrintingPriceRulesDocument, {
            variables: {
                filter: {
                    status: Status.Active,
                    printingTechnologies: printTech,
                    printSide: printSide,
                    // minQuantity: minQuantity
                },
                sortBy: null,
                channel: channel
            }
        });
        return data.publicPrintingPriceRules?.edges;
    }
}


export { getAdditionalService, getPrintingPriceRules }


