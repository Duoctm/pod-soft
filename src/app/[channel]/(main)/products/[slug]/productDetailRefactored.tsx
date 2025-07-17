"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import edjsHTML from "editorjs-html";
import xss from "xss";

import Swipper from "./_components/Swipper";
import SizeGuideModal from "./guide";
import { ProductInfo } from "./_components/ProductInfo";
import AddToCardLoading from "./_components/AddToCardLoading";
import MarginPricePopup from "./_components/MarginPricePopup";
import { ProductTitle } from "./_components/ProductTitle";
import { ProductDescription } from "./_components/ProductDescription";

import { useProductDetail } from "./hooks/useProductDetail";
import { useUser } from "./hooks/useUser";
import { usePrintingPriceRules } from "./hooks/usePrintingPriceRules";
import { useAdditionalServices } from "./hooks/useAdditionalServices";
import { useLargeQuantityInput } from "./hooks/useLargeQuantityInput";

import { addCart } from "./actions/addCart";
import { getPublicPrintingPriceRules } from "./actions/getPublicPrintingPriceRules";
import { useNavigateLogin } from "@/hooks/useNavigateLogin";
import Wrapper from "@/ui/components/wrapper";
import { getUser } from "@/actions/user";
import { PrintingTechnology, PrintSide, type ProductVariant, type PrintingPriceRuleCountableEdge } from "@/gql/graphql";

import "react-toastify/dist/ReactToastify.css";

// Helper function to convert string to PrintingTechnology enum
const convertStringToPrintingTechnology = (printTechnology: string | null): PrintingTechnology => {
    console.log('🔧 convertStringToPrintingTechnology input:', printTechnology);

    if (!printTechnology) {
        console.log('🔧 No printTechnology provided, returning None');
        return PrintingTechnology.None;
    }

    const upperCase = printTechnology.toUpperCase();
    console.log('🔧 Uppercase conversion:', upperCase);

    switch (upperCase) {
        case 'DTG':
            console.log('🔧 Matched DTG, returning PrintingTechnology.Dtg');
            return PrintingTechnology.Dtg;
        case 'SILK':
            console.log('🔧 Matched SILK, returning PrintingTechnology.Silk');
            return PrintingTechnology.Silk;
        case 'NONE':
        default:
            console.log('🔧 Matched NONE or default, returning PrintingTechnology.None');
            return PrintingTechnology.None;
    }
};

interface PageProps {
    params: {
        slug: string;
        channel: string;
        fromDesign?: boolean;
        typeDesign?: 1 | 3;
    };
}

type SizeQuantities = {
    [colorId: string]: {
        [size: string]: { quantity: number; variantId: string };
    };
};

const parseDescription = (description: string, lineIndex: number = 0): string[] | null => {
    const parser = edjsHTML();
    if (!description) return null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsedData = JSON.parse(description) as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (parsedData.blocks && Array.isArray(parsedData.blocks)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            parsedData.blocks.map((block: { data: { text: string } }) => {
                const removeText = block.data.text.split("\n")[lineIndex];
                block.data.text = removeText;
            });
        }
        return parser.parse(parsedData);
    } catch (parseError) {
        console.error("Error parsing product description:", parseError);
        return [xss(description)];
    }
};

const ProductDetail: React.FC<PageProps> = ({ params }) => {
    const { slug, channel } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const variantParam = searchParams.get("variant");

    // Custom hooks
    const { productDetail, loading, selectedVariant, setSelectedVariant, getProductDetail } = useProductDetail(slug, channel);
    const { user, hasUser, fetchUser } = useUser();
    const {
        productPriceRules,
        listProductPriceRules,
        fetchPrintingPriceRules,
        initializePricing,
        resetPricing: _resetPricing,
        getPriceForColorAndSize: _getPriceForColorAndSize
    } = usePrintingPriceRules(channel, hasUser);
    const { publicPrintingAdditionalServices, services, serviceDetails, getPublicPrintingAdditionalServices, handleSetOptions } = useAdditionalServices(channel);

    // Local state
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showMarginPrice, setShowMarginPrice] = useState(false);
    const [listMarginPrice, setListMarginPrice] = useState<any[]>([]);
    const [_marginPriceLoading, setMarginPriceLoading] = useState(false);
    const [imagesLoading, setImagesLoading] = useState<boolean>(false);
    const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({});
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [addtoCartLoading, setAddToCartLoading] = useState(false);
    const [colorAttributeValueId, setColorAttributeValueId] = useState<string | undefined>();
    const [sizeList, setSizeList] = useState<string[]>([]);
    const [printTechnology, setPrintTechnology] = useState<string | null>("NONE");
    const [listParams, setListParams] = useState<{ name: string; size: string }[] | null>(null);
    const [currentColor, setCurrentColor] = useState<string | null>(null);
    const [isShowDesignButton, setShowDesignButton] = useState<boolean>(false);

    const features = useMemo(() => {
        if (!productDetail?.description) return null;
        return parseDescription(productDetail.description, 3);
    }, [productDetail?.description]);

    // Memoized current quantity calculation
    const currentQuantity = useMemo(() => {
        if (!currentColor || !sizeQuantities[currentColor]) return 0;
        return Object.values(sizeQuantities[currentColor]).reduce((total, item) => total + item.quantity, 0);
    }, [currentColor, sizeQuantities]);

    // Memoized size quantities for current color
    const currentColorSizeQuantities = useMemo(() => {
        return currentColor ? sizeQuantities[currentColor] ?? {} : {};
    }, [currentColor, sizeQuantities]);

    // Effects
    useEffect(() => {
        void fetchUser();
    }, [slug, channel, fetchUser]);

    useEffect(() => {
        void getPublicPrintingAdditionalServices();
    }, [channel, hasUser, getPublicPrintingAdditionalServices]);

    useEffect(() => {
        void getProductDetail(variantParam || undefined);
    }, [slug, channel, hasUser, getProductDetail, variantParam]);

    // Initialize pricing when color and variant are available - but only once
    // Using refs to avoid dependency loops with productPriceRules
    const priceCacheInit = React.useRef(productPriceRules);
    priceCacheInit.current = productPriceRules;

    useEffect(() => {
        if (!currentColor || !selectedVariant) return;

        console.log('🔄 Initialize pricing check:', {
            currentColor,
            selectedVariant: selectedVariant.id,
            hasExistingPrice: !!priceCacheInit.current[currentColor],
            printTechnology
        });

        // For DTG, use None technology for pricing
        const selectedPrintingTechnology = printTechnology === "DTG"
            ? PrintingTechnology.None
            : convertStringToPrintingTechnology(printTechnology);

        // Initialize immediately if no pricing exists for current color
        // Check both general color pricing and specific color-size pricing
        const generalPriceKey = currentColor;
        const specificPriceKey = selectedSize ? `${currentColor}-${selectedSize}` : null;

        const hasGeneralPrice = !!priceCacheInit.current[generalPriceKey];
        const hasSpecificPrice = specificPriceKey ? !!priceCacheInit.current[specificPriceKey] : false;

        if (!hasGeneralPrice && !hasSpecificPrice) {
            console.log('🆕 No existing price, initializing...', {
                currentColor,
                selectedSize,
                generalPriceKey,
                specificPriceKey,
                hasGeneralPrice,
                hasSpecificPrice,
                printTechnology,
                usingNoneForDTG: printTechnology === "DTG"
            });
            void initializePricing(selectedVariant.id, currentColor, selectedPrintingTechnology, false, selectedSize || undefined);
        }
    }, [currentColor, selectedVariant, initializePricing, printTechnology, selectedSize]); // Removed productPriceRules dependency

    // Function to fetch margin price using new API
    const fetchMarginPrice = useCallback(async () => {
        if (!selectedVariant || !channel) return;

        try {
            setMarginPriceLoading(true);

            // Extract objectId from selectedVariant.id
            let objectId: number | null = null;
            try {
                objectId = parseInt(atob(selectedVariant.id).split(":")[1]);
            } catch (error) {
                console.error('🔧 Error extracting objectId from variantId:', error);
                objectId = null;
            }

            if (!objectId) {
                console.warn('⚠️ Could not extract objectId from variant:', selectedVariant.id);
                setListMarginPrice([]);
                return;
            }

            // Determine printSide based on print technology
            const printSide = printTechnology === "NONE" ? PrintSide.None : PrintSide.All;

            console.log('🚀 Fetching margin price with params:', {
                channel,
                printingTechnologies: ['DTG', 'NONE'], // hardcoded as requested
                printSide,
                objectIds: [objectId],
                printTechnology,
                variantId: selectedVariant.id
            });

            const result = await getPublicPrintingPriceRules({
                channel,
                printingTechnologies: [PrintingTechnology.Dtg, PrintingTechnology.None], // hardcoded
                objectIds: [objectId],
                usedForCalculation: hasUser // Use appropriate rules based on user status
            });

            if (result?.edges) {
                console.log('✅ Margin price fetched successfully:', result.edges, 'rules');
                setListMarginPrice(result.edges);
            } else {
                console.warn('⚠️ No margin price rules found');
                setListMarginPrice([]);
            }
        } catch (error) {
            console.error('❌ Error fetching margin price:', error);
            setListMarginPrice([]);
        } finally {
            setMarginPriceLoading(false);
        }
    }, [selectedVariant, channel, printTechnology, hasUser]);

    // Fetch margin price when dependencies change
    useEffect(() => {
        if (showMarginPrice) {
            void fetchMarginPrice();
        }
    }, [showMarginPrice, fetchMarginPrice]);

    // Fetch price when selected size changes (backup for cases not handled by handleSizeSelect)
    // Using refs to avoid dependency loops with productPriceRules
    const priceCache = React.useRef(productPriceRules);
    priceCache.current = productPriceRules;

    useEffect(() => {
        if (!selectedSize || !currentColor || !selectedVariant) return;

        // Get current quantity for this size
        const currentQuantity = sizeQuantities[currentColor]?.[selectedSize]?.quantity || 0;

        // Only fetch if there's a quantity for this size AND we don't have cached price
        const priceKey = `${currentColor}-${selectedSize}`;
        const hasCachedPrice = !!priceCache.current[priceKey];

        if (currentQuantity > 0 && !hasCachedPrice) {
            // For DTG, use None technology for pricing
            const selectedPrintingTechnology = printTechnology === "DTG"
                ? PrintingTechnology.None
                : convertStringToPrintingTechnology(printTechnology);
            console.log('🔄 useEffect: Selected size changed, no cached price, refetching:', {
                selectedSize,
                currentColor,
                currentQuantity,
                priceKey,
                hasCachedPrice,
                printTechnology,
                variantId: selectedVariant.id,
                usingNoneForDTG: printTechnology === "DTG"
            });

            // Use old API for pricing fetch
            void fetchPrintingPriceRules(
                selectedVariant.id,
                currentColor,
                currentQuantity,
                selectedPrintingTechnology,
                selectedSize
            );
        }
    }, [selectedSize, currentColor, selectedVariant, sizeQuantities, printTechnology, fetchPrintingPriceRules]);

    // Handle quantity changes only - REMOVED to prevent duplicate API calls
    // This useEffect was causing multiple API calls when quantity changes
    // The API call is now handled directly in handleQuantityChange

    useEffect(() => {
        if (!productDetail || !productDetail.variants?.length) return;
        const defaultVariant = productDetail.defaultVariant || productDetail.variants[0];
        const colorName = defaultVariant?.attributes?.find(attr => attr.attribute)?.values?.[0]?.name;
        const size = defaultVariant?.attributes?.find(attr => attr.attribute?.name === "SIZE")?.values?.[0]?.name;

        if (colorName && !currentColor) {
            setCurrentColor(colorName);
        }

        if (colorName && size && !sizeQuantities[colorName]) {
            setSizeQuantities(prev => ({
                ...prev,
                [colorName]: {
                    [size]: { quantity: 0, variantId: defaultVariant.id }
                }
            }));
            setSelectedSize(size);
            setSelectedVariant(defaultVariant);
        }
    }, [productDetail, currentColor, sizeQuantities, setSelectedVariant]);

    // Removed debug useEffect to prevent infinite loops
    // Debug info is now logged directly when state changes occur

    // Handlers
    const handleColorSizeChange = useCallback((
        selected: { color: string | null; size: string | null },
        _variantId: string | null,
        sizeList: string[],
        selectedPrintTech: string | null,
        colorAttributeValueId?: string,
        variant?: ProductVariant,
    ) => {
        console.log('🎯 handleColorSizeChange called with:', {
            selected,
            selectedPrintTech,
            currentColor,
            currentPrintTech: printTechnology
        });

        // Handle color change
        if (selected.color && selected.color !== currentColor) {
            setCurrentColor(selected.color);
            setSizeQuantities((prev) => {
                if (prev[selected.color!]) return prev;
                return { ...prev, [selected.color!]: {} };
            });
        }

        // Handle size change
        if (selected.size && selected.color) {
            setListParams((prev) => {
                const exists = (prev ?? []).some(
                    (item) => item.size === selected.size && item.name === selected.color,
                );
                if (exists) return prev;
                return [
                    ...(prev ?? []),
                    {
                        name: selected.color as string,
                        size: selected.size as string,
                    },
                ];
            });
        }

        // Handle printing technology change - immediately fetch new pricing
        const previousPrintTech = printTechnology;
        const newPrintTech = selectedPrintTech || "NONE";

        setPrintTechnology(newPrintTech);
        setSelectedVariant((prev) => (prev?.id !== variant?.id ? variant ?? null : prev));
        setSelectedSize((prev) => (prev !== selected.size ? selected.size ?? null : prev));
        setColorAttributeValueId((prev) => (prev !== colorAttributeValueId ? colorAttributeValueId : prev));
        setSizeList((prev) => (JSON.stringify(prev) !== JSON.stringify(sizeList) ? sizeList : prev));

        // If printing technology changed, immediately fetch new pricing
        if (newPrintTech !== previousPrintTech && variant && (selected.color || currentColor)) {
            console.log('🚀 Printing technology changed, fetching new pricing:', {
                previousPrintTech,
                newPrintTech,
                color: selected.color || currentColor,
                variantId: variant.id
            });

            // For DTG, use None technology for pricing
            const selectedPrintingTechnology = newPrintTech === "DTG"
                ? PrintingTechnology.None
                : convertStringToPrintingTechnology(newPrintTech);

            // Get current color for fetch
            const currentColorForFetch = selected.color || currentColor;

            console.log('🔄 Using printing technology for pricing:', {
                originalTech: newPrintTech,
                pricingTech: selectedPrintingTechnology,
                usingNoneForDTG: newPrintTech === "DTG"
            });

            // Reset pricing to force UI update with new technology
            void initializePricing(variant.id, currentColorForFetch!, selectedPrintingTechnology, true, selected.size || undefined);
        }
    }, [currentColor, printTechnology, setSelectedVariant, initializePricing]);

    // Handler for size selection with automatic price refetch
    const handleSizeSelect = useCallback(async (size: string) => {
        console.log('👆 handleSizeSelect called:', {
            size,
            currentColor,
            selectedVariant: selectedVariant?.id,
            printTechnology
        });

        // Set the selected size first
        setSelectedSize(size);

        // Check if this size already has quantity for current color
        if (currentColor && selectedVariant) {
            const existingQuantity = sizeQuantities[currentColor]?.[size]?.quantity || 0;

            if (existingQuantity > 0) {
                // Always fetch price for existing quantity to ensure up-to-date pricing
                // For DTG, use None technology for pricing
                const selectedPrintingTechnology = printTechnology === "DTG"
                    ? PrintingTechnology.None
                    : convertStringToPrintingTechnology(printTechnology);

                console.log('🔄 Size has existing quantity, force refetching price:', {
                    size,
                    existingQuantity,
                    currentColor,
                    printTechnology,
                    selectedPrintingTechnology,
                    usingNoneForDTG: printTechnology === "DTG"
                });

                // Use old API for pricing fetch
                void fetchPrintingPriceRules(
                    selectedVariant.id,
                    currentColor,
                    existingQuantity,
                    selectedPrintingTechnology,
                    size
                );
            }
        }
    }, [currentColor, selectedVariant, sizeQuantities, printTechnology, fetchPrintingPriceRules]);

    // Large quantity input handler using old API
    const largeQuantityHandler = useCallback(async (
        variantId: string,
        colorId: string,
        quantity: number,
        printingTechnology?: PrintingTechnology,
        size?: string
    ) => {
        console.log('� Large quantity handler called:', {
            variantId,
            colorId,
            quantity,
            printingTechnology,
            size,
            timestamp: new Date().toISOString()
        });

        // Use old API directly
        await fetchPrintingPriceRules(variantId, colorId, quantity, printingTechnology, size);
    }, [fetchPrintingPriceRules]);

    // Large quantity input hook for smooth UX
    const {
        handleInputChange: handleLargeQuantityInput,
        initializeQuantity: _initializeQuantity,
        getQuantityState: _getQuantityState,
        cancelAllRequests: _cancelAllRequests
    } = useLargeQuantityInput({
        onQuantityChange: largeQuantityHandler,
        debounceDelay: 300
    });

    // Handler for quantity changes with state update
    const handleQuantityChange = useCallback((size: string, quantity: number) => {
        if (!currentColor || !selectedVariant) return;

        const validQty = Math.max(0, quantity);

        console.log('📊 handleQuantityChange called:', {
            size,
            quantity,
            validQty,
            currentColor,
            selectedVariant: selectedVariant.id
        });

        // Update local state immediately for better UX
        setSizeQuantities((prev) => {
            const colorSizes = { ...(prev[currentColor] || {}) };
            if (validQty === 0) {
                delete colorSizes[size];
            } else {
                colorSizes[size] = {
                    quantity: validQty,
                    variantId: selectedVariant.id,
                };
            }

            const newState = {
                ...prev,
                [currentColor]: colorSizes,
            };
            return newState;
        });

        // Use large quantity input handler for API calls with debouncing
        if (validQty > 0) {
            const printingTech = printTechnology === "DTG"
                ? PrintingTechnology.None
                : convertStringToPrintingTechnology(printTechnology);

            handleLargeQuantityInput(
                size,
                String(validQty),
                selectedVariant.id,
                currentColor,
                printingTech
            );
        }
    }, [currentColor, selectedVariant, printTechnology, handleLargeQuantityInput]);

    const handleClickAddToCart = useCallback(async () => {
        setAddToCartLoading(true);


        //  const qty = sizeQuantities.


        if (printTechnology === PrintingTechnology.Silk) { }


        const user = await getUser();
        if (!user) {
            try {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                await useNavigateLogin(channel);
            } catch (error) {
                console.error("Error navigating to login:", error);
            }
            setAddToCartLoading(false);
            return;
        }
        if (!currentColor) {
            toast.error("Please select a color");
            setAddToCartLoading(false);
            return;
        }

        const items = Object.values(sizeQuantities[currentColor] || {})
            .filter((v) => v.quantity > 0 && v.variantId)
            .map(({ variantId, quantity }) => ({ variantId, quantity }));

        // Kiểm tra điều kiện cho Silk: tổng quantity < 288 thì không cho thêm vào giỏ hàng
        if (printTechnology === PrintingTechnology.Silk) {
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            if (totalQuantity < 288) {
                toast.error("Minimum quantity for silk printing is 288 pieces");
                setAddToCartLoading(false);
                return;
            }
        }

        if (items.length === 0) {
            toast.error("Please select at least one size and quantity");
            setAddToCartLoading(false);
            return;
        }

        // Helper function to calculate pricing info for a specific size and quantity
        const calculatePricingInfoForSizeAndQuantity = async (variantId: string, quantity: number) => {
            if (!listProductPriceRules || !currentColor) return null;

            // Find size for this variant
            const variant = productDetail?.variants?.find((v) => v.id === variantId);
            const size = variant?.attributes?.find((a) => a.attribute?.name === "SIZE")?.values?.[0]?.name;

            if (!size) return null;

            // If printTechnology is DTG, fetch pricing with None technology
            if (printTechnology === "DTG") {
                console.log('🔄 DTG detected, fetching pricing with None technology:', {
                    variantId,
                    currentColor,
                    size,
                    quantity,
                    originalPrintTech: printTechnology
                });

                // Use old API for pricing fetch
                await fetchPrintingPriceRules(
                    variantId,
                    currentColor,
                    quantity,
                    PrintingTechnology.None,
                    size
                );
            } else {
                // For other printing technologies, fetch with the current technology
                const selectedPrintingTechnology = convertStringToPrintingTechnology(printTechnology);
                console.log('🔄 Fetching pricing for technology:', {
                    variantId,
                    currentColor,
                    size,
                    quantity,
                    printTechnology,
                    selectedPrintingTechnology
                });

                await fetchPrintingPriceRules(
                    variantId,
                    currentColor,
                    quantity,
                    selectedPrintingTechnology,
                    size
                );
            }

            // Get the specific price for this color-size combination (after fetch)
            const priceKey = `${currentColor}-${size}`;
            const specificPrice = productPriceRules[priceKey];

            console.log('💰 calculatePricingInfoForSizeAndQuantity:', {
                variantId,
                size,
                priceKey,
                specificPrice,
                quantity,
                currentColor,
                printTechnology,
                usedNoneForDTG: printTechnology === "DTG"
            });

            const findPriceRule = (rules: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[], qty: number) => {
                return rules.find((item) => {
                    if (!item.node.condition) return false;
                    const min = item.node.condition.minQuantity;
                    const max = item.node.condition.maxQuantity;
                    if (min == null) return false;
                    return qty >= min && (typeof max === "undefined" || max === null || qty <= max);
                })?.node || null;
            };

            const memberPriceRule = findPriceRule(listProductPriceRules.rulesForCalculation, quantity);
            const retailPriceRule = findPriceRule(listProductPriceRules.rulesForDisplay, quantity);

            // Use the fetched price for this specific size if available, otherwise fallback to price rule calculation
            const memberPrice = specificPrice?.price || memberPriceRule?.price || 0;
            const retailPrice = retailPriceRule?.price || 0;

            let discountPercentage = 0;
            if (memberPrice > 0 && retailPrice > 0 && retailPrice > memberPrice) {
                discountPercentage = Math.round(((retailPrice - memberPrice) / retailPrice) * 100);
            }

            return {
                memberPrice: memberPrice,
                retailPrice: retailPrice,
                discountPercentage,
                currency: specificPrice?.currency || memberPriceRule?.currency || retailPriceRule?.currency || "USD",
                hasDiscount: discountPercentage > 0,
                size: size
            };
        };

        const newItems = await Promise.all(items.map(async (item) => {
            const variant = productDetail?.variants?.find((v) => v.id === item.variantId);
            const originalMetadata = variant?.metadata ?? [];

            // Calculate pricing info for this specific item
            const pricingInfo = await calculatePricingInfoForSizeAndQuantity(item.variantId, item.quantity);
            console.log(services)
            const metadata = [
                ...originalMetadata,
                {
                    key: "printing_info",
                    value: JSON.stringify([
                        {
                            print_side: "NONE",
                            printing_technology: "NONE",
                            additional_service_ids: [],
                        },
                    ]),
                },
                {
                    key: "service_detail",
                    value: JSON.stringify(serviceDetails)
                },
                {
                    key: "line_additional_services",
                    value: JSON.stringify(services || [])
                }
            ];

            // Add pricing info to metadata if available
            if (pricingInfo) {
                // Remove any old pricing_info key if exists
                const filtered = metadata.filter(m => m.key !== "pricing_info");


                filtered.push({
                    key: "pricing_info",
                    value: JSON.stringify({
                        member_price: pricingInfo.memberPrice,
                        retail_price: pricingInfo.retailPrice,
                        discount_percentage: pricingInfo.discountPercentage,
                        currency: pricingInfo.currency,
                        has_discount: pricingInfo.hasDiscount,
                        color: currentColor,
                        size: pricingInfo.size,
                        quantity: item.quantity
                    })
                });
                return {
                    variantId: item.variantId,
                    quantity: item.quantity,
                    metadata: filtered
                };
            }

            return {
                variantId: item.variantId,
                quantity: item.quantity,
                metadata
            };
        }));

        try {
            const result = await addCart(params, newItems);
            if (result?.error?.error == 2) {
                result.error.messages.forEach((item) => {
                    toast.error(item.message);
                });
            } else if (result?.error?.error == 3) {
                toast.error("Something went wrong. Please try again later");
            } else {
                toast.success("Product added to cart");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again later");
        }

        setAddToCartLoading(false);
        setSizeQuantities((prev) => ({
            ...prev,
            [currentColor]: {},
        }));
    }, [channel, params, sizeQuantities, currentColor, printTechnology, services, serviceDetails, productDetail, listProductPriceRules, productPriceRules, fetchPrintingPriceRules]);

    const handleNavigateToDesign = useCallback(async () => {


        // for (const [key, value] of colorSize) {
        //     console.log('key:', key, 'value:', value);
        // }
        //console.log(sizeQuantities[currentColor].size)
        const user = await getUser();
        if (!user) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            void useNavigateLogin(channel);
            setAddToCartLoading(false);
            return;
        }

        if (!colorAttributeValueId || !selectedVariant?.id) return;

        // setAddToCartLoading(true);
        let quantity = 0;
        if (currentColor) {
            const colorSize = sizeQuantities[currentColor];
            console.log(sizeQuantities[currentColor]);
            for (const [, value] of Object.entries(colorSize)) {
                if (value.variantId == selectedVariant.id) {
                    quantity = value.quantity;
                }
            }
        }

        // Kiểm tra điều kiện cho Silk: tổng quantity < 288 thì không cho sang trang design
        if (convertStringToPrintingTechnology(printTechnology) === PrintingTechnology.Silk) {
            let totalQuantity = 0;
            if (currentColor && sizeQuantities[currentColor]) {
                totalQuantity = Object.values(sizeQuantities[currentColor])
                    .reduce((sum, item) => sum + item.quantity, 0);
            }
            if (totalQuantity < 288) {
                toast.error("Minimum quantity for silk printing is 288 pieces");
                return;
            }
        }

        if (quantity == 0) {
            toast.error("The number of design products must be at least one.");
            return;
        }
        localStorage.setItem(
            "cart",
            JSON.stringify({
                params: params,
                selectedVariantId: selectedVariant.id,
                quantity: quantity,
            }),
        );

        localStorage.removeItem("services");

        if (currentColor && sizeQuantities[currentColor]) {
            const items = Object.values(sizeQuantities)
                .flatMap(colorObj =>
                    Object.values(colorObj)
                        .filter((v) => v.quantity > 0 && v.variantId)
                        .map(({ variantId, quantity }) => ({ variantId, quantity }))
                );

            //if (services && services.length > 0 && serviceDetails && serviceDetails.length > 0) {
            // Nếu không có item nào, có thể hiển thị thông báo hoặc xử lý khác


            let decodedNumbers: number[] | null = null;
            let decodedServiceDetails: any[] | null = null;
            if (services && serviceDetails) {
                decodedNumbers = services.map(item => Number(atob(item).split(":")[1]));
                decodedServiceDetails = serviceDetails.map(item => ({
                    ...item,
                    id: Number(atob(item.id).split(":")[1])
                }));
            }

            const serviceItem = items.map((item) => {
                // Tìm variant tương ứng với variantId
                const variant = productDetail?.variants?.find((v) => v.id === item.variantId);
                // Lấy metadata gốc của variant (nếu có)
                const originalMetadata = variant?.metadata ?? [];

                /*const colorSize = sizeQuantities[currentColor];
                let quantity = 0;
 
                for (const [key, value] of Object.entries(colorSize)) {
 
                    if (value.variantId == item.variantId) {
 
                        quantity = value.quantity;
                    }
                }*/

                return {
                    variantId: item.variantId,
                    quantity: item.quantity,
                    //sizeQuantities: quantity,
                    metadata: [
                        ...originalMetadata,
                        {
                            key: "printing_info",
                            value: JSON.stringify([
                                {
                                    print_side: "NONE",
                                    printing_technology: printTechnology || "NONE",
                                    additional_service_ids: decodedNumbers || [],
                                },
                            ]),
                        },
                        {
                            key: "service_detail",
                            value: JSON.stringify(decodedServiceDetails)
                        },
                        {
                            key: "line_additional_services",
                            value: JSON.stringify(services || [])
                        }
                    ],
                };
            });
            //Lưu vào localStorage để sử dụng trong trang design

            localStorage.setItem(
                "services",
                JSON.stringify(serviceItem),
            );

            //}

        }

        router.push(`/${channel}/design/1/${productDetail?.id}/${selectedVariant.id}`);
    }, [colorAttributeValueId, selectedVariant, channel, productDetail, params, router, currentColor, printTechnology, services, serviceDetails, sizeQuantities]);

    const handleNavigateToDesignChangeProduct = useCallback(async () => {

        if (!colorAttributeValueId || !selectedVariant?.id) return;

        router.push(`/${channel}/design/${params.typeDesign}/${productDetail?.id}/${selectedVariant.id}`);
    }, [colorAttributeValueId, selectedVariant, channel, productDetail, params, router]);

    return (
        <Wrapper className="flex min-h-screen flex-col md:flex-row">
            <ToastContainer position="top-center" />
            <ProductTitle name={productDetail?.name} isLoading={loading} className="mb-7 md:hidden" />
            <div className="relative flex w-full max-w-7xl flex-col gap-2 rounded-lg  md:flex-row md:gap-8">
                <div className="w-full md:w-1/2 lg:w-[35%]">
                    {selectedVariant ? (
                        loading || imagesLoading ? (
                            <div className="aspect-square w-full animate-pulse rounded-md bg-gray-200" style={{ minHeight: 300 }} />
                        ) : (
                            <Swipper
                                images={Array.isArray(selectedVariant?.media) ? selectedVariant.media.map((i) => i.url) : []}
                                loading={loading || imagesLoading}
                                onImagesLoaded={() => setImagesLoading(false)}
                            />
                        )
                    ) : (
                        <div className="aspect-square w-full animate-pulse rounded-md bg-gray-200" style={{ minHeight: 300 }} />
                    )}

                    <div className="hidden w-full md:block">
                        <ProductDescription
                            descriptionHtml={parseDescription(productDetail?.description as string)}
                            title="Descriptions"
                        />
                    </div>
                </div>

                <ProductInfo
                    productDetail={productDetail}
                    loading={loading}
                    currentColor={currentColor}
                    productPriceRules={productPriceRules}
                    listProductPriceRules={listProductPriceRules}
                    hasUser={hasUser}
                    currentQuantity={currentQuantity}
                    sizeList={sizeList}
                    sizeQuantities={currentColorSizeQuantities}
                    selectedSize={selectedSize}
                    addtoCartLoading={addtoCartLoading}
                    user={user}
                    publicPrintingAdditionalServices={publicPrintingAdditionalServices}
                    features={features}
                    fromDesign={params.fromDesign}
                    onShowSizeGuide={() => setShowSizeGuide(true)}
                    onColorSizeChange={handleColorSizeChange}
                    onQuantityChange={handleQuantityChange}
                    onSelectSize={handleSizeSelect}
                    onSetOptions={handleSetOptions}
                    onAddToCart={handleClickAddToCart}
                    onNavigateToDesign={handleNavigateToDesign}
                    onNavigateToDesignChangeProduct={handleNavigateToDesignChangeProduct}
                    isShowDesignButton={isShowDesignButton}
                    onShowMarginPrice={() => setShowMarginPrice(true)}
                    setShowDesignButton={setShowDesignButton}
                />
            </div>

            {showSizeGuide && (
                <SizeGuideModal
                    setShowSizeGuide={setShowSizeGuide}
                    catalog={
                        productDetail?.category?.slug === "tee" || productDetail?.category?.slug === "fleece"
                            ? productDetail?.category?.slug
                            : "tee"
                    }
                />
            )}

            {addtoCartLoading && <AddToCardLoading />}

            {showMarginPrice && (
                <MarginPricePopup
                    open={showMarginPrice}
                    onClose={() => setShowMarginPrice(false)}
                    title={printTechnology as string}
                    listMarginPrice={listMarginPrice}
                    variantValues={listParams ?? []}
                />
            )}
        </Wrapper>
    );
};

export { ProductDetail };
