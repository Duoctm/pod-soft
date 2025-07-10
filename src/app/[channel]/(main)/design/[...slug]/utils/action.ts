'use server';

import { PrintingTechnology, PublicPrintingAdditionalServicesOfDesignDocument, PublicPrintingPriceRulesDocument, Status } from "@/gql/graphql";
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

async function getPrintingPriceRules(objectId: number, printTech: PrintingTechnology[], channel: string) {

    const data = await executeGraphQL(PublicPrintingPriceRulesDocument, {
        variables: {
            filter: {
                status: Status.Active,
                objectId: objectId,
                printingTechnologies: printTech,
            },
            sortBy: null,
            channel: channel
        }
    });
    return data.publicPrintingPriceRules?.edges;
}


export { getAdditionalService, getPrintingPriceRules }


