import React from 'react';
import { Loader } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { PrintingPriceRuleCountableEdge } from '@/gql/graphql';

interface ProductPriceDisplayWithDiscountProps {
    loading: boolean;
    currentColor: string | null;
    productPriceRules: {
        [colorId: string]: { price: number; currency: string };
    };
    listProductPriceRules: {
        rulesForCalculation: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
        rulesForDisplay: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
    } | null;
    hasUser: boolean;
    quantity: number;
}

const findPriceFromRules = (
    rules: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[],
    quantity: number
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

const ProductPriceDisplayWithDiscount: React.FC<ProductPriceDisplayWithDiscountProps> = ({
    loading,
    currentColor,
    productPriceRules,
    listProductPriceRules,
    hasUser,
    quantity,
}) => {

    console.log(listProductPriceRules)

    // If quantity is 0, default to 1 to show pricing
    const effectiveQuantity = quantity || 1;

    // Show loading only if explicitly loading or if we have no pricing data at all
    if (loading && !listProductPriceRules) {
        return (
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32" />
        );
    }

    // If we have pricing rules, use them; otherwise fallback to productPriceRules
    if (listProductPriceRules && currentColor) {
        if (hasUser) {
            // Logged in user - show member price (rulesForCalculation)
            const memberPriceRule = findPriceFromRules(listProductPriceRules.rulesForCalculation, effectiveQuantity);
            const retailPriceRule = findPriceFromRules(listProductPriceRules.rulesForDisplay, 1);

            const memberPrice = memberPriceRule?.price || 0;
            const retailPrice = retailPriceRule?.price || 0;

            // If we have both prices, show comparison
            if (memberPrice > 0 && retailPrice > 0) {
                // If retail price is higher than member price, show discount
                if (retailPrice > memberPrice) {
                    const discountPercentage = Math.round(((retailPrice - memberPrice) / retailPrice) * 100);

                    return (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                {/* Discount percentage */}
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    -{discountPercentage}%
                                </span>
                                {/* Member price (main) */}
                                <span className="text-4xl font-extrabold text-[#8B3958] md:text-5xl xl:text-5xl">
                                    {formatMoney(memberPrice, memberPriceRule?.currency || "USD")}
                                </span>
                            </div>
                            {/* List Price (crossed out) */}
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-sm text-gray-500">List Price:</span>
                                <span className="text-xl text-gray-500 line-through">
                                    {formatMoney(retailPrice, memberPriceRule?.currency || "USD")}
                                </span>
                            </div>
                        </div>
                    );
                } else {
                    // If member price is higher or equal to retail price, just show member price
                    return (
                        <div className="flex flex-col">
                            <span className="ml-2 text-3xl font-extrabold text-[#8B3958] md:text-4xl lg:text-5xl">
                                {formatMoney(memberPrice, memberPriceRule?.currency || "USD")}
                            </span>
                        </div>
                    );
                }
            } else if (memberPrice > 0) {
                // Only member price available
                return (
                    <div className="flex flex-col">
                        <span className="ml-2 text-3xl font-extrabold text-[#8B3958] md:text-4xl lg:text-5xl">
                            {formatMoney(memberPrice, memberPriceRule?.currency || "USD")}
                        </span>
                    </div>
                );
            }
        } else {
            // Guest user - show retail price (rulesForDisplay)
            const retailPriceRule = findPriceFromRules(listProductPriceRules.rulesForDisplay, effectiveQuantity);
            const retailPrice = retailPriceRule?.price || 0;

            console.log('Guest pricing debug:', {
                retailPriceRule,
                retailPrice,
                rulesForDisplay: listProductPriceRules.rulesForDisplay
            });

            if (retailPrice > 0) {
                return (
                    <div className="flex flex-col">
                        <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                            {formatMoney(retailPrice, retailPriceRule?.currency || "USD")}
                        </span>
                    </div>
                );
            }
        }
    }

    // Check if we should show loading - only if no data available at all
    if (loading || (!listProductPriceRules && !productPriceRules?.[currentColor!])) {
        return (
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32" />
        );
    }

    // Fallback to default pricing from productPriceRules
    const currentPrice = productPriceRules[currentColor!];
    if (currentPrice) {
        return (
            <div className="flex flex-col">
                <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                    {formatMoney(currentPrice.price, currentPrice.currency)}
                </span>
                {!hasUser && (
                    <span className="text-xs text-gray-600">Retail Price</span>
                )}
            </div>
        );
    }

    // Last resort - show loader
    return (
        <div className="flex flex-col">
            <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                <Loader className="h-6 w-6 animate-spin" />
            </span>
        </div>
    );
};

export { ProductPriceDisplayWithDiscount };
