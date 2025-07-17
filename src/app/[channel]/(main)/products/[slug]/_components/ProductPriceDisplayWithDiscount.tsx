import React, { useMemo } from 'react';
import { Loader } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { PrintingPriceRuleCountableEdge } from '@/gql/graphql';

interface ProductPriceDisplayWithDiscountProps {
    loading: boolean;
    currentColor: string | null;
    selectedSize: string | null; // Add selected size
    productPriceRules: {
        [priceKey: string]: { price: number; currency: string; isLoading?: boolean }; // Updated with loading state
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
    selectedSize,
    productPriceRules,
    listProductPriceRules,
    hasUser,
    quantity,
}) => {

    // Memoized calculations for better performance
    const effectiveQuantity = useMemo(() => quantity || 1, [quantity]);

    const priceKey = useMemo(() => {
        return selectedSize && currentColor ? `${currentColor}-${selectedSize}` : currentColor;
    }, [selectedSize, currentColor]);

    const currentPricing = useMemo(() => {
        return priceKey ? productPriceRules[priceKey] : null;
    }, [priceKey, productPriceRules]);

    // Check if we're loading a specific price
    const isSpecificPriceLoading = currentPricing?.isLoading === true;

    // Show loading only if explicitly loading or if we have no pricing data at all
    if ((loading && !listProductPriceRules && !currentPricing) || isSpecificPriceLoading) {
        return (
            <div className="price-container">
                <div className="price-skeleton h-12 w-32 animate-pulse rounded bg-gray-200 transition-all duration-300 ease-in-out md:h-14 md:w-40 lg:h-16 lg:w-48" />
            </div>
        );
    }

    // PRIORITY 1: Use size-specific pricing if available
    if (currentPricing) {
        console.log('✅ Using size-specific pricing for:', selectedSize);

        // Check if price is 0, show contact message
        if (currentPricing.price === 0) {
            console.log('💰 Displaying Contact for Quote (size-specific, price=0)');
            return (
                <div className="price-container">
                    <div className="contact-quote bg-[#FA9633]/10 border border-[#FA9633] rounded-lg px-4 py-2 transition-all duration-300 ease-in-out">
                        <span className="text-lg font-semibold text-[#FA9633]">
                            Contact for Quote
                        </span>
                    </div>
                </div>
            );
        }

        // For logged in users, try to show discount comparison with retail price
        if (hasUser && listProductPriceRules) {
            const retailPriceRule = findPriceFromRules(listProductPriceRules.rulesForDisplay, 1);
            const retailPrice = retailPriceRule?.price || 0;
            const memberPrice = currentPricing.price;

            // If we have both prices and retail price is higher, show discount
            if (memberPrice > 0 && retailPrice > 0 && retailPrice > memberPrice) {
                const discountPercentage = Math.round(((retailPrice - memberPrice) / retailPrice) * 100);

                return (
                    <div className="price-container">
                        <div className="price-discount-group flex items-center gap-2 transition-all duration-300 ease-in-out">
                            {/* Member price (main) - Fixed color #F58A71 */}
                            <span className="price-main text-3xl font-extrabold text-[#F58A71] transition-all duration-300 ease-in-out md:text-4xl xl:text-5xl">
                                {formatMoney(memberPrice, currentPricing.currency)}
                            </span>
                            <span className="price-original text-xl text-gray-500 line-through transition-all duration-300 ease-in-out">
                                {formatMoney(retailPrice, currentPricing.currency)}
                            </span>
                            {/* Discount percentage */}
                            <span className="discount-badge bg-[#F58A71] text-white px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 ease-in-out">
                                -{discountPercentage}%
                            </span>
                        </div>
                    </div>
                );
            }
        }

        // Default display (no discount or guest user)
        return (
            <div className="price-container">
                <span className="price-main ml-2 text-3xl font-extrabold text-[#F58A71] transition-all duration-300 ease-in-out md:text-4xl lg:text-5xl">
                    {formatMoney(currentPricing.price, currentPricing.currency)}
                </span>
                {!hasUser && (
                    <span className="price-label text-xs text-gray-600 transition-all duration-300 ease-in-out">Retail Price</span>
                )}
            </div>
        );
    }

    // PRIORITY 2: Fallback to general pricing rules if no size-specific pricing
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
                        <div className="price-container">
                            <div className="price-discount-group flex items-center gap-2 transition-all duration-300 ease-in-out">
                                <span className="price-main text-4xl font-extrabold text-[#F58A71] transition-all duration-300 ease-in-out md:text-5xl xl:text-5xl">
                                    {formatMoney(memberPrice, memberPriceRule?.currency || "USD")}
                                </span>
                                <span className="price-original text-xl text-gray-500 line-through transition-all duration-300 ease-in-out">
                                    {formatMoney(retailPrice, memberPriceRule?.currency || "USD")}
                                </span>
                                <span className="discount-badge bg-[#F58A71] text-white px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 ease-in-out">
                                    -{discountPercentage}%
                                </span>
                            </div>
                        </div>
                    );
                } else {
                    // If member price is higher or equal to retail price, just show member price
                    return (
                        <div className="price-container">
                            <span className="price-main ml-2 text-3xl font-extrabold text-[#F58A71] transition-all duration-300 ease-in-out md:text-4xl lg:text-5xl">
                                {formatMoney(memberPrice, memberPriceRule?.currency || "USD")}
                            </span>
                        </div>
                    );
                }
            } else if (memberPrice > 0) {
                // Only member price available
                return (
                    <div className="flex flex-col transition-all duration-300 ease-in-out">
                        <span className="ml-2 text-3xl font-extrabold text-[#F58A71] md:text-4xl lg:text-5xl transition-all duration-300 ease-in-out">
                            {formatMoney(memberPrice, memberPriceRule?.currency || "USD")}
                        </span>
                    </div>
                );
            } else {
                // Member price is 0 - show contact message
                return (
                    <div className="flex flex-col">
                        <div className="bg-[#FA9633]/10 border border-orange-300 rounded-lg px-4 py-2">
                            <span className="text-lg font-semibold text-orange-700">
                                Contact for Quote
                            </span>
                        </div>
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
                    <div className="flex flex-col transition-all duration-300 ease-in-out">
                        <span className="ml-2 text-3xl font-extrabold text-[#F58A71] md:text-4xl lg:text-5xl transition-all duration-300 ease-in-out">
                            {formatMoney(retailPrice, retailPriceRule?.currency || "USD")}
                        </span>
                    </div>
                );
            } else {
                // Retail price is 0 - show contact message for guest users
                return (
                    <div className="flex flex-col transition-all duration-300 ease-in-out">
                        <div className="bg-[#FA9633]/10 border border-[#FA9633] rounded-lg px-4 py-2 transition-all duration-300 ease-in-out">
                            <span className="text-lg font-semibold text-[#FA9633] transition-all duration-300 ease-in-out">
                                Contact for Quote
                            </span>
                        </div>
                    </div>
                );
            }
        }
    }

    // PRIORITY 3: Last resort - show loader
    return (
        <div className="flex flex-col transition-all duration-300 ease-in-out">
            <span className="ml-2 text-3xl font-extrabold text-[#F58A71] md:text-4xl lg:text-5xl transition-all duration-300 ease-in-out">
                <Loader className="h-6 w-6 animate-spin text-[#F58A71]" />
            </span>
        </div>
    );
};

export { ProductPriceDisplayWithDiscount };
