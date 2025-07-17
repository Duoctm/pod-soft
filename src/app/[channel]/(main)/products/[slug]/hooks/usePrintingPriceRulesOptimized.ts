import { useState, useCallback, useRef, useEffect } from 'react';
import { getPublicPrintingPriceRules } from '../actions/getPublicPrintingPriceRules';
import { debounce } from '../utils/debounce';
import { RequestManager, type PricingRequestParams } from '../utils/requestManager';
import { PrintingTechnology, PrintSide, type PrintingPriceRuleCountableEdge } from '@/gql/graphql';

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 300;

// Interface for price data
interface PriceData {
    price: number;
    currency: string;
    timestamp: number;
    isLoading?: boolean;
}

// Interface for price cache
interface PriceCache {
    [priceKey: string]: PriceData;
}

// Interface for price rules data
interface PriceRuleData {
    rulesForCalculation: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
    rulesForDisplay: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
}

/**
 * Optimized hook for fetching and managing printing price rules with debouncing,
 * request cancellation, and caching
 */
export const usePrintingPriceRulesOptimized = (channel: string, hasUser: boolean) => {
    // State for price rules and loading status
    const [productPriceRules, setProductPriceRules] = useState<PriceCache>({});
    const [listProductPriceRules, setListProductPriceRules] = useState<PriceRuleData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for request management and cache
    const requestManager = useRef<RequestManager>(new RequestManager());
    const priceCache = useRef<PriceCache>({});

    // Update cache ref when state changes
    useEffect(() => {
        priceCache.current = productPriceRules;
    }, [productPriceRules]);

    // Cleanup function to cancel all pending requests on unmount
    useEffect(() => {
        return () => {
            requestManager.current.cancelAllRequests();
        };
    }, []);

    /**
     * Helper function to find a price rule based on quantity
     */
    const findPrintingPriceRule = useCallback((
        rules: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[],
        quantity: number,
    ) => {
        if (!rules || rules.length === 0) {
            return null;
        }

        return rules.find((item) => {
            if (!item.node.condition) return false;
            const min = item.node.condition.minQuantity;
            const max = item.node.condition.maxQuantity;
            if (min == null) return false;
            return quantity >= min && (typeof max === "undefined" || max === null || quantity <= max);
        })?.node || null;
    }, []);

    /**
     * Check if a cached price is still valid
     */
    const isCacheValid = useCallback((priceKey: string): boolean => {
        const cachedData = priceCache.current[priceKey];
        if (!cachedData) return false;

        const now = Date.now();
        return (now - cachedData.timestamp) < CACHE_EXPIRATION;
    }, []);

    /**
     * Fetch price rules from API with request cancellation
     */
    const fetchPrintingPriceRules = useCallback(
        async (params: PricingRequestParams): Promise<void> => {
            const { variantId, colorId, quantity, printingTechnology, size } = params;

            if (!variantId || !colorId || typeof quantity !== "number") return;

            // Create price key: if size provided, use colorId-size, otherwise just colorId
            const priceKey = size ? `${colorId}-${size}` : colorId;

            try {
                // Parse variant ID to get object ID
                let objectId: number | null = null;
                try {
                    objectId = parseInt(atob(variantId).split(":")[1]);
                } catch {
                    console.error('❌ Failed to parse variant ID:', variantId);
                    objectId = null;
                }
                if (!objectId) return;

                // Set loading state for this specific price key
                setProductPriceRules(prev => ({
                    ...prev,
                    [priceKey]: {
                        ...(prev[priceKey] || { price: 0, currency: "USD" }),
                        isLoading: true,
                        timestamp: Date.now()
                    }
                }));
                setIsLoading(true);

                // Determine printing technology to use
                const selectedPrintingTechnology = printingTechnology || PrintingTechnology.None;

                // For pricing display: if Silk is selected, use None pricing
                const printingTechnologyForPricing =
                    selectedPrintingTechnology === PrintingTechnology.Silk ?
                        PrintingTechnology.None :
                        selectedPrintingTechnology;

                // Set printSide based on printing technology
                const printSide = printingTechnologyForPricing === PrintingTechnology.None ?
                    PrintSide.None :
                    PrintSide.All;

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

                // Register this request with the request manager
                const controller = requestManager.current.registerRequest(params);

                // Make API call without abort signal (signal not supported by API)
                const publicPrintingPriceRules = await getPublicPrintingPriceRules({
                    ...apiParams
                });

                // If request was aborted, don't update state
                if (controller.signal.aborted) {
                    return;
                }

                const edges = (publicPrintingPriceRules?.edges as Pick<
                    PrintingPriceRuleCountableEdge,
                    "node" | "__typename"
                >[]) || [];

                // Separate rules into calculation and display arrays
                const rulesForCalculation = edges.filter(item => item.node.usedForCalculation);
                const rulesForDisplayFiltered = edges.filter(item => !item.node.usedForCalculation);

                setListProductPriceRules({
                    rulesForCalculation,
                    rulesForDisplay: rulesForDisplayFiltered
                });

                // Choose rules based on user login status
                const rulesToUse = hasUser ? rulesForCalculation : rulesForDisplayFiltered;

                if (rulesToUse.length > 0) {
                    const priceRule = findPrintingPriceRule(rulesToUse, quantity);

                    setProductPriceRules(prev => ({
                        ...prev,
                        [priceKey]: {
                            price: priceRule?.price || 0,
                            currency: priceRule?.currency || "USD",
                            isLoading: false,
                            timestamp: Date.now()
                        },
                    }));
                } else {
                    // Fallback: if no rules found for the selected type, try the other type
                    const fallbackRules = hasUser ? rulesForDisplayFiltered : rulesForCalculation;
                    if (fallbackRules.length > 0) {
                        const priceRule = findPrintingPriceRule(fallbackRules, quantity);
                        setProductPriceRules(prev => ({
                            ...prev,
                            [priceKey]: {
                                price: priceRule?.price || 0,
                                currency: priceRule?.currency || "USD",
                                isLoading: false,
                                timestamp: Date.now()
                            },
                        }));
                    } else {
                        // No rules at all
                        setProductPriceRules(prev => ({
                            ...prev,
                            [priceKey]: {
                                price: 0,
                                currency: "USD",
                                isLoading: false,
                                timestamp: Date.now()
                            },
                        }));
                    }
                }

                // Mark request as complete
                requestManager.current.completeRequest(params);

                // Only set global loading to false if no other requests are pending
                if (requestManager.current.getPendingRequestCount() === 0) {
                    setIsLoading(false);
                }

                // Clear any previous errors
                setError(null);
            } catch (error) {
                // Only handle error if it's not an abort error
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error("Error fetching printing price rules:", error);
                    setError("Failed to fetch pricing information");

                    // Set loading to false and mark the price as not loading
                    setProductPriceRules(prev => ({
                        ...prev,
                        [priceKey]: {
                            ...(prev[priceKey] || { price: 0, currency: "USD" }),
                            isLoading: false,
                            timestamp: Date.now()
                        }
                    }));

                    // Only set global loading to false if no other requests are pending
                    if (requestManager.current.getPendingRequestCount() === 0) {
                        setIsLoading(false);
                    }
                }
            }
        },
        [hasUser, channel, findPrintingPriceRule],
    );

    /**
     * Debounced version of fetchPrintingPriceRules
     */
    const debouncedFetchPriceRules = useCallback(
        debounce((params: PricingRequestParams) => {
            void fetchPrintingPriceRules(params);
        }, DEBOUNCE_DELAY),
        [fetchPrintingPriceRules]
    );

    /**
     * Public API: Fetch price with debouncing
     * This is the main function that components should call
     */
    const fetchPriceWithDebounce = useCallback((params: PricingRequestParams) => {
        const { colorId, size } = params;
        const priceKey = size ? `${colorId}-${size}` : colorId;

        // Check if we already have a valid cached price
        if (isCacheValid(priceKey)) {
            // If we have a valid cache but it's loading, let it continue
            if (priceCache.current[priceKey]?.isLoading) {
                return;
            }

            // If we have a valid cache with the same quantity, don't fetch again
            const cachedPrice = priceCache.current[priceKey];
            if (cachedPrice && !cachedPrice.isLoading) {
                return;
            }
        }

        // Otherwise, fetch with debouncing
        debouncedFetchPriceRules(params);
    }, [debouncedFetchPriceRules, isCacheValid]);

    /**
     * Initialize pricing with default quantity (1)
     */
    const initializePricing = useCallback(
        async (
            variantId: string,
            colorId: string,
            selectedPrintingTechnology?: PrintingTechnology,
            forceRefresh = false,
            size?: string
        ) => {
            const priceKey = size ? `${colorId}-${size}` : colorId;

            // Skip if we already have pricing and not forcing refresh
            if (!forceRefresh && priceCache.current[priceKey] && !priceCache.current[priceKey].isLoading) {
                return;
            }

            // Cancel any pending requests for this price key
            requestManager.current.cancelRequest({
                variantId,
                colorId,
                quantity: 1,
                printingTechnology: selectedPrintingTechnology,
                size
            });

            // Fetch immediately (no debounce for initialization)
            await fetchPrintingPriceRules({
                variantId,
                colorId,
                quantity: 1,
                printingTechnology: selectedPrintingTechnology,
                size
            });
        },
        [fetchPrintingPriceRules]
    );

    /**
     * Reset all pricing data
     */
    const resetPricing = useCallback(() => {
        // Cancel all pending requests
        requestManager.current.cancelAllRequests();

        // Clear state
        setProductPriceRules({});
        setListProductPriceRules(null);
        setIsLoading(false);
        setError(null);
    }, []);

    /**
     * Get price for a specific color and size
     */
    const getPriceForColorAndSize = useCallback((colorId: string, size?: string) => {
        const priceKey = size ? `${colorId}-${size}` : colorId;
        return productPriceRules[priceKey] || null;
    }, [productPriceRules]);

    /**
     * Cancel all pending requests
     */
    const cancelPendingRequests = useCallback(() => {
        requestManager.current.cancelAllRequests();
        setIsLoading(false);
    }, []);

    return {
        productPriceRules,
        listProductPriceRules,
        isLoading,
        error,
        fetchPriceWithDebounce,
        initializePricing,
        resetPricing,
        getPriceForColorAndSize,
        cancelPendingRequests
    };
};