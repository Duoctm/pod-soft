import { useState, useCallback } from 'react';
import { getPublicPrintingPriceRules } from '../actions/getPublicPrintingPriceRules';
import { PrintingTechnology, PrintSide, type PrintingPriceRuleCountableEdge } from '@/gql/graphql';

export const usePrintingPriceRules = (channel: string, hasUser: boolean) => {
    const [productPriceRules, setProductPriceRules] = useState<{
        [colorId: string]: { price: number; currency: string };
    }>({});
    const [listProductPriceRules, setListProductPriceRules] = useState<{
        rulesForCalculation: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
        rulesForDisplay: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
    } | null>(null);

    const findPrintingPriceRule = useCallback((
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
    }, []);

    const fetchPrintingPriceRules = useCallback(
        async (variantId: string, colorId: string, qty: number, selectedPrintingTechnology?: PrintingTechnology) => {
            if (!variantId || !colorId || typeof qty !== "number") return;

            console.log('🔄 fetchPrintingPriceRules called with:', {
                variantId,
                colorId,
                qty,
                selectedPrintingTechnology,
                hasUser
            });

            try {
                let objectId: number | null = null;
                try {
                    objectId = parseInt(atob(variantId).split(":")[1]);
                    console.log('🔍 Variant ID parsing:', {
                        originalVariantId: variantId,
                        decodedObjectId: objectId
                    });
                } catch {
                    console.error('❌ Failed to parse variant ID:', variantId);
                    objectId = null;
                }
                if (!objectId) return;

                // Determine printing technology - use selected or default to None
                const printingTechnology = selectedPrintingTechnology !== undefined ? selectedPrintingTechnology : PrintingTechnology.None;

                console.log('🎯 Final printing technology for API:', {
                    input: selectedPrintingTechnology,
                    inputType: typeof selectedPrintingTechnology,
                    inputIsUndefined: selectedPrintingTechnology === undefined,
                    final: printingTechnology,
                    finalString: String(printingTechnology),
                    isNone: printingTechnology === PrintingTechnology.None,
                    isDtg: printingTechnology === PrintingTechnology.Dtg,
                    isSilk: printingTechnology === PrintingTechnology.Silk,
                    enumValues: {
                        None: PrintingTechnology.None,
                        Dtg: PrintingTechnology.Dtg,
                        Silk: PrintingTechnology.Silk
                    }
                });

                // Set printSide: if printingTechnology is None, use PrintSide.None, else undefined (or your default)
                const printSide = printingTechnology === PrintingTechnology.None ? PrintSide.None : PrintSide.All;

                // Prepare API call parameters based on hasUser
                const apiParams = hasUser ? {
                    channel: channel,
                    printingTechnologies: [printingTechnology],
                    printSide: printSide,
                    objectIds: [objectId],
                } : {
                    channel: channel,
                    printingTechnologies: [printingTechnology],
                    usedForCalculation: false,
                    printSide: printSide,
                    objectIds: [objectId],
                };

                console.log('📡 API call params:', apiParams);

                const publicPrintingPriceRules = await getPublicPrintingPriceRules(apiParams);

                console.log('📥 API response:', {
                    publicPrintingPriceRules,
                    edgesLength: publicPrintingPriceRules?.edges?.length || 0
                });

                // If no results with current technology, try with None to test
                if ((!publicPrintingPriceRules?.edges || publicPrintingPriceRules.edges.length === 0) && printingTechnology !== PrintingTechnology.None) {
                    console.log('🔄 No results found, trying with PrintingTechnology.None for debugging...');

                    const testParams = { ...apiParams, printingTechnologies: [PrintingTechnology.None] };
                    const testResults = await getPublicPrintingPriceRules(testParams);

                    console.log('🧪 Test results with None:', {
                        testResults,
                        testEdgesLength: testResults?.edges?.length || 0
                    });
                }

                const edges = (publicPrintingPriceRules?.edges as Pick<
                    PrintingPriceRuleCountableEdge,
                    "node" | "__typename"
                >[]) || [];

                // Separate rules into calculation and display arrays
                const rulesForCalculation = edges.filter(item => item.node.usedForCalculation);
                const rulesForDisplayFiltered = edges.filter(item => !item.node.usedForCalculation && item.node.condition?.minQuantity === 1);
                console.log('Rules separation:', rulesForDisplayFiltered)
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
                        [colorId]: {
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
                            [colorId]: {
                                price: priceRule?.price || 0,
                                currency: priceRule?.currency || "USD",
                            },
                        }));
                    } else {
                        // No rules at all
                        setProductPriceRules((prev) => ({
                            ...prev,
                            [colorId]: { price: 0, currency: "USD" },
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

    // New function to initialize pricing with default quantity - optimized
    const initializePricing = useCallback(
        async (variantId: string, colorId: string, selectedPrintingTechnology?: PrintingTechnology, forceRefresh = false) => {
            console.log('initializePricing called with:', {
                variantId,
                colorId,
                selectedPrintingTechnology,
                hasExistingPrice: !!productPriceRules[colorId],
                forceRefresh
            });

            // Skip if we already have pricing for this color and not forcing refresh
            if (productPriceRules[colorId] && !forceRefresh) {
                console.log('Already have price for', colorId, '- skipping');
                return;
            }

            // Fetch with quantity = 1 for initial pricing
            await fetchPrintingPriceRules(variantId, colorId, 1, selectedPrintingTechnology);
        },
        [fetchPrintingPriceRules, productPriceRules],
    );

    return {
        productPriceRules,
        listProductPriceRules,
        fetchPrintingPriceRules,
        initializePricing,
        resetPricing,
    };
};
