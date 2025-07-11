import React from 'react';
import { Loader } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import type { PrintingPriceRuleCountableEdge } from '@/gql/graphql';

interface ProductPriceDisplayWithDiscountProps {
    loading: boolean;
    currentColor: string | null;
    selectedSize: string | null; // Add selected size
    productPriceRules: {
        [priceKey: string]: { price: number; currency: string }; // Updated: now uses priceKey instead of colorId
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

    // Keep debugging minimal to prevent performance issues

    // If quantity is 0, default to 1 to show pricing
    const effectiveQuantity = quantity || 1;

    // Create price key for current color and selected size
    const priceKey = selectedSize && currentColor ? `${currentColor}-${selectedSize}` : currentColor;
    const currentPricing = priceKey ? productPriceRules[priceKey] : null;

    console.log('🎨 ProductPriceDisplayWithDiscount render:', {
        selectedSize,
        currentColor,
        priceKey,
        currentPricing,
        hasListRules: !!listProductPriceRules,
        effectiveQuantity
    });

    // Debug log for component render (reduced logging to prevent performance issues)
    console.log('🎨 ProductPriceDisplayWithDiscount render:', {
        selectedSize,
        currentColor,
        priceKey,
        hasPricing: !!currentPricing
    });

    // Show loading only if explicitly loading or if we have no pricing data at all
    if (loading && !listProductPriceRules && !currentPricing) {
        return (
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32" />
        );
    }

    // PRIORITY 1: Use size-specific pricing if available
    if (currentPricing) {
        console.log('✅ Using size-specific pricing for:', selectedSize);

        // Check if price is 0, show contact message
        if (currentPricing.price === 0) {
            console.log('💰 Displaying Contact for Quote (size-specific, price=0)');
            return (
                <div className="flex flex-col">
                    <div className="bg-[#FA9633]/10 border border-[#FA9633] rounded-lg px-4 py-2">
                        <span className="text-lg font-semibold text-[#FA9633]">
                            Contact for Quote
                        </span>
                    </div>
                </div>
            );
        }

        console.log('💰 Displaying size-specific price for:', selectedSize);

        // For logged in users, try to show discount comparison with retail price
        if (hasUser && listProductPriceRules) {
            const retailPriceRule = findPriceFromRules(listProductPriceRules.rulesForDisplay, 1);
            const retailPrice = retailPriceRule?.price || 0;
            const memberPrice = currentPricing.price;

            // If we have both prices and retail price is higher, show discount
            if (memberPrice > 0 && retailPrice > 0 && retailPrice > memberPrice) {
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
                                {formatMoney(memberPrice, currentPricing.currency)}
                            </span>
                        </div>
                        {/* List Price (crossed out) */}
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm text-gray-500">List Price:</span>
                            <span className="text-xl text-gray-500 line-through">
                                {formatMoney(retailPrice, currentPricing.currency)}
                            </span>
                        </div>

                    </div>
                );
            }
        }

        // Default display (no discount or guest user)
        return (
            <div className="flex flex-col">
                <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                    {formatMoney(currentPricing.price, currentPricing.currency)}
                </span>
                {!hasUser && (
                    <span className="text-xs text-gray-600">Retail Price</span>
                )}

            </div>
        );
    }

    // PRIORITY 2: Fallback to general pricing rules if no size-specific pricing
    if (listProductPriceRules && currentColor) {
        console.log('⚠️ Using general pricing rules fallback');
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
                    <div className="flex flex-col">
                        <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                            {formatMoney(retailPrice, retailPriceRule?.currency || "USD")}
                        </span>
                    </div>
                );
            } else {
                // Retail price is 0 - show contact message for guest users
                return (
                    <div className="flex flex-col">
                        <div className="bg-[#FA9633]/10 border border-[#FA9633] rounded-lg px-4 py-2">
                            <span className="text-lg font-semibold text-[#FA9633]">
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
        <div className="flex flex-col">
            <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                <Loader className="h-6 w-6 animate-spin" />
            </span>
        </div>
    );
};

export { ProductPriceDisplayWithDiscount };
