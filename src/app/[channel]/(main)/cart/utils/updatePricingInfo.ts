import { type MetadataItem } from "@/gql/graphql";

export type PricingInfoUpdate = {
    memberPrice: number;
    retailPrice: number;
    discountPercentage: number;
    quantity?: number; // Optional, default to 1 if not provided
};

type ExistingPricingInfo = {
    member_price: number;
    retail_price: number;
    discount_percentage: number;
    currency: string;
    has_discount: boolean;
    color: string;
    size: string;
    quantity: number;
};

export function updatePricingInfo(
    metadata: MetadataItem[],
    newPricing: PricingInfoUpdate
): MetadataItem[] {

    if (!metadata || !Array.isArray(metadata)) {
        console.error("Invalid metadata format:", metadata);
        return [];
    }


    return metadata.map((item) => {
        if (item.key === "pricing_info") {
            try {
                const oldValue = JSON.parse(item.value) as ExistingPricingInfo;

                const updated: ExistingPricingInfo = {
                    ...oldValue,
                    member_price: newPricing.memberPrice,
                    retail_price: newPricing.retailPrice,
                    discount_percentage: newPricing.discountPercentage,
                    quantity: newPricing.quantity || 1,
                };

                return {
                    ...item,
                    value: JSON.stringify(updated),
                };
            } catch (err) {
                console.error("Failed to parse pricing_info:", err);
                return item;
            }
        }
        return item;
    });
}
