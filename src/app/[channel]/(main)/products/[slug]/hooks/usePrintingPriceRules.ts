import { useState, useCallback } from 'react';
import { getPublicPrintingPriceRules } from '../actions/getPublicPrintingPriceRules';
import { PrintingTechnology, PrintSide, type PrintingPriceRuleCountableEdge } from '@/gql/graphql';

export const usePrintingPriceRules = (channel: string, hasUser: boolean) => {
    const [productPriceRules, setProductPriceRules] = useState<{
        [priceKey: string]: { price: number; currency: string }; // Changed: now stores by colorId-size key
    }>({});
    const [listProductPriceRules, setListProductPriceRules] = useState<{
        rulesForCalculation: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
        rulesForDisplay: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
    } | null>(null);

    const findPrintingPriceRule = useCallback((
        rules: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[],
        quantity: number,
    ) => {
        if (!rules || rules.length === 0) {
            return null;
        }


        const foundRule = rules.find((item) => {
            if (!item.node.condition) {

                return false;
            }
            const min = item.node.condition.minQuantity;
            const max = item.node.condition.maxQuantity;
            if (min == null) {

                return false;
            }
            const matches = quantity >= min && (typeof max === "undefined" || max === null || quantity <= max);

            return matches;
        })?.node || null;



        return foundRule;
    }, []);

    const fetchPrintingPriceRules = useCallback(
        async (variantId: string, colorId: string, qty: number, selectedPrintingTechnology?: PrintingTechnology, size?: string) => {
            if (!variantId || !colorId || typeof qty !== "number") return;

            // Create price key: if size provided, use colorId-size, otherwise just colorId for backward compatibility
            const priceKey = size ? `${colorId}-${size}` : colorId;



            try {
                let objectId: number | null = null;
                try {
                    objectId = parseInt(atob(variantId).split(":")[1]);

                } catch {
                    console.error('❌ Failed to parse variant ID:', variantId);
                    objectId = null;
                }
                if (!objectId) return;

                // Determine printing technology - use selected or default to None
                const originalPrintingTechnology = selectedPrintingTechnology !== undefined ? selectedPrintingTechnology : PrintingTechnology.None;

                // For pricing display: if Silk is selected, use None pricing (since Silk price is 0 in database)
                // But keep the original technology for add to cart functionality
                const printingTechnologyForPricing = originalPrintingTechnology === PrintingTechnology.Silk ? PrintingTechnology.None : originalPrintingTechnology;



                // Set printSide: if printingTechnologyForPricing is None, use PrintSide.None, else PrintSide.All
                const printSide = printingTechnologyForPricing === PrintingTechnology.None ? PrintSide.None : PrintSide.All;

                // Prepare API call parameters based on hasUser
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


                const publicPrintingPriceRules = await getPublicPrintingPriceRules(apiParams);



                // If no results with current technology, try with None to test
                // if ((!publicPrintingPriceRules?.edges || publicPrintingPriceRules.edges.length === 0) && printingTechnologyForPricing !== PrintingTechnology.None) {
                //     

                //     const testParams = { ...apiParams, printingTechnologies: [PrintingTechnology.None] };
                //     const testResults = await getPublicPrintingPriceRules(testParams);


                // }

                const edges = (publicPrintingPriceRules?.edges as Pick<
                    PrintingPriceRuleCountableEdge,
                    "node" | "__typename"
                >[]) || [];

                // Separate rules into calculation and display arrays
                const rulesForCalculation = edges.filter(item => item.node.usedForCalculation);
                // For display rules (public/retail prices), don't restrict to minQuantity=1
                // This allows quantity-based pricing for non-logged users
                const rulesForDisplayFiltered = edges.filter(item => !item.node.usedForCalculation);


                // Lọc rulesForDisplay chỉ lấy rule có minQuantity=1 và maxQuantity=10
                // const rulesForDisplayFiltered = edges.filter(item => {
                //     if (item.node.usedForCalculation) return false;
                //     const min = item.node.condition?.minQuantity;
                //     return min === 1
                // });

                setListProductPriceRules({
                    rulesForCalculation,
                    rulesForDisplay: rulesForDisplayFiltered
                });

                // Choose rules based on user login status
                // hasUser = true: Show member/wholesale prices (rulesForCalculation)
                // hasUser = false: Show retail/public prices (rulesForDisplay)
                const rulesToUse = hasUser ? rulesForCalculation : rulesForDisplayFiltered;



                if (rulesToUse.length > 0) {
                    const priceRule = findPrintingPriceRule(rulesToUse, qty);

                    setProductPriceRules((prev) => ({
                        ...prev,
                        [priceKey]: {
                            price: priceRule?.price || 0,
                            currency: priceRule?.currency || "USD",
                        },
                    }));
                } else {
                    // Fallback: if no rules found for the selected type, try the other type
                    const fallbackRules = hasUser ? rulesForDisplayFiltered : rulesForCalculation;
                    if (fallbackRules.length > 0) {
                        const priceRule = findPrintingPriceRule(fallbackRules, qty);
                        setProductPriceRules((prev) => ({
                            ...prev,
                            [priceKey]: {
                                price: priceRule?.price || 0,
                                currency: priceRule?.currency || "USD",
                            },
                        }));
                    } else {
                        // No rules at all
                        setProductPriceRules((prev) => ({
                            ...prev,
                            [priceKey]: { price: 0, currency: "USD" },
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching printing price rules:", error);
            }
        },
        [hasUser, channel, findPrintingPriceRule],
    );

    // Function to reset pricing when printing technology changes
    const resetPricing = useCallback(() => {

        setProductPriceRules({});
        setListProductPriceRules(null);
    }, []);

    // Function to reset pricing for specific color/size when printing technology changes
    // const resetPricingForColor = useCallback((colorId: string, size?: string) => {
    //     const priceKey = size ? `${colorId}-${size}` : colorId;
    //   
    //     setProductPriceRules((prev) => {
    //         const newState = { ...prev };
    //         delete newState[priceKey];
    //         return newState;
    //     });
    // }, []);

    // New function to initialize pricing with default quantity - optimized
    const initializePricing = useCallback(
        async (variantId: string, colorId: string, selectedPrintingTechnology?: PrintingTechnology, forceRefresh = false, size?: string) => {
            // Create price key: if size provided, use colorId-size, otherwise just colorId for backward compatibility
            const priceKey = size ? `${colorId}-${size}` : colorId;



            // Use a function to check current state instead of dependency
            if (!forceRefresh) {
                setProductPriceRules((prev) => {
                    // Skip if we already have pricing for this priceKey
                    if (prev[priceKey]) {

                        return prev;
                    }
                    // Continue with fetch since we don't have the price (fire and forget)
                    void fetchPrintingPriceRules(variantId, colorId, 1, selectedPrintingTechnology, size);
                    return prev;
                });
            } else {
                // Force refresh - always fetch
                await fetchPrintingPriceRules(variantId, colorId, 1, selectedPrintingTechnology, size);
            }
        },
        [fetchPrintingPriceRules], // Remove productPriceRules dependency
    );

    // Helper function to get price for specific color and size
    const getPriceForColorAndSize = useCallback((colorId: string, size?: string) => {
        const priceKey = size ? `${colorId}-${size}` : colorId;
        return productPriceRules[priceKey] || null;
    }, [productPriceRules]);

    return {
        productPriceRules,
        listProductPriceRules,
        fetchPrintingPriceRules,
        initializePricing,
        resetPricing,
        getPriceForColorAndSize, // New helper function
    };
};
