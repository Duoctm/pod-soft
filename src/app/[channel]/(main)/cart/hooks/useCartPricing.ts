// Helper hook for cart pricing calculations
import { useState, useCallback } from 'react';
import { getPublicPrintingPriceRules } from "../../products/[slug]/actions/getPublicPrintingPriceRules";
import { PrintingTechnology, PrintSide, type PrintingPriceRuleCountableEdge } from '@/gql/graphql';

interface PricingInfo {
    memberPrice: number;
    retailPrice: number;
    discountPercentage: number;
    currency: string;
    hasDiscount: boolean;
}

// Helper function to find the correct price rule based on quantity
const findPrintingPriceRule = (
    rules: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[],
    quantity: number,
) => {
    if (!rules || rules.length === 0) return null;

    const foundRule = rules.find((item) => {
        if (!item.node.condition) return false;
        const min = item.node.condition.minQuantity;
        const max = item.node.condition.maxQuantity;
        if (min == null) return false;
        return quantity >= min && (typeof max === "undefined" || max === null || quantity <= max);
    })?.node || null;

    return foundRule;
};

// Helper function to convert string to PrintingTechnology enum
const convertStringToPrintingTechnology = (printTechnology: string | null): PrintingTechnology => {
    if (!printTechnology) return PrintingTechnology.None;

    const upperCase = printTechnology.toUpperCase();
    switch (upperCase) {
        case 'DTG':
            return PrintingTechnology.Dtg;
        case 'SILK':
            return PrintingTechnology.Silk;
        case 'NONE':
        default:
            return PrintingTechnology.None;
    }
};

export const useCartPricing = (channel: string) => {
    const [isCalculating, setIsCalculating] = useState(false);

    const calculatePricingForQuantity = useCallback(async (
        variantId: string,
        printingTechnology: PrintingTechnology | null,
        quantity: number,
        hasUser: boolean
    ): Promise<PricingInfo | null> => {
        setIsCalculating(true);

        try {
            // Parse variant ID to get object ID (number)
            let objectId: number | null = null;
            try {
                objectId = parseInt(atob(variantId).split(":")[1]);
            } catch {
                console.error('Failed to parse variant ID:', variantId);
                return null;
            }

            if (!objectId) return null;

            // Convert printing technology and set up API params
            const selectedPrintingTechnology = convertStringToPrintingTechnology(printingTechnology);
            const printingTechnologyForPricing = selectedPrintingTechnology === PrintingTechnology.Silk ? PrintingTechnology.None : selectedPrintingTechnology;
            console.log("🚀 useCartPricing.ts:74 - printingTechnologyForPricing:", printingTechnologyForPricing);

            const printSide = printingTechnologyForPricing === PrintingTechnology.None ? PrintSide.None : PrintSide.All;



            const apiParams = hasUser ? {
                channel: channel,
                printingTechnologies: [printingTechnologyForPricing],
                printSide: printSide,
                objectIds: [objectId],
            } : {
                channel: channel,
                printingTechnologies: [printingTechnologyForPricing],
                usedForCalculation: false,
                printSide: printSide,
                objectIds: [objectId],
            };

            console.log(hasUser)

            console.log('🔄 Calculating pricing for quantity:', quantity, 'with params:', apiParams);

            // Get price rules
            const publicPrintingPriceRules = await getPublicPrintingPriceRules(apiParams);
            const edges = (publicPrintingPriceRules?.edges as Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[]) || [];
            console.log("🚀 useCartPricing.ts:94 - edges:", edges);



            // Separate rules
            const rulesForCalculation = edges.filter(item => item.node.usedForCalculation);
            const rulesForDisplay = edges.filter(item => !item.node.usedForCalculation);

            // Choose rules based on user login status
            const rulesToUse = hasUser ? rulesForCalculation : rulesForDisplay;

            // Find price rules for quantity
            const memberPriceRule = findPrintingPriceRule(rulesToUse, quantity);
            const retailPriceRule = findPrintingPriceRule(rulesForDisplay, 1);

            const memberPrice = memberPriceRule?.price || 0;
            const retailPrice = retailPriceRule?.price || 0;

            let discountPercentage = 0;
            if (memberPrice > 0 && retailPrice > 0 && retailPrice > memberPrice) {
                discountPercentage = Math.round(((retailPrice - memberPrice) / retailPrice) * 100);
            }

            const result: PricingInfo = {
                memberPrice,
                retailPrice,
                discountPercentage,
                currency: memberPriceRule?.currency || retailPriceRule?.currency || "USD",
                hasDiscount: discountPercentage > 0,
            };

            console.log('✅ Calculated pricing:', result);
            return result;

        } catch (error) {
            console.error('Error calculating pricing:', error);
            return null;
        } finally {
            setIsCalculating(false);
        }
    }, [channel]);

    return {
        calculatePricingForQuantity,
        isCalculating,
    };
};
