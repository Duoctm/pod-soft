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

import { addCart } from "./actions/addCart";
import { useNavigateLogin } from "@/hooks/useNavigateLogin";
import Wrapper from "@/ui/components/wrapper";
import { getUser } from "@/actions/user";
import { PrintingTechnology, type ProductVariant, type PrintingPriceRuleCountableEdge } from "@/gql/graphql";

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
    const { productPriceRules, listProductPriceRules, fetchPrintingPriceRules, initializePricing, resetPricing: _resetPricing } = usePrintingPriceRules(channel, hasUser);
    const { publicPrintingAdditionalServices, services, serviceDetails, getPublicPrintingAdditionalServices, handleSetOptions } = useAdditionalServices(channel);

    // Local state
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showMarginPrice, setShowMarginPrice] = useState(false);
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
    useEffect(() => {
        if (!currentColor || !selectedVariant) return;

        console.log('🔄 Initialize pricing check:', {
            currentColor,
            selectedVariant: selectedVariant.id,
            hasExistingPrice: !!productPriceRules[currentColor],
            printTechnology
        });

        // Convert string to PrintingTechnology enum
        const selectedPrintingTechnology = convertStringToPrintingTechnology(printTechnology);

        // Initialize immediately if no pricing exists
        if (!productPriceRules[currentColor]) {
            console.log('🆕 No existing price, initializing...');
            void initializePricing(selectedVariant.id, currentColor, selectedPrintingTechnology);
        }
    }, [currentColor, selectedVariant, initializePricing, printTechnology, productPriceRules]);

    // Handle quantity changes only
    useEffect(() => {
        if (!currentColor || !selectedVariant) return;
        const colorSizes = sizeQuantities[currentColor];
        if (!colorSizes || Object.keys(colorSizes).length === 0) return;
        const qty = Object.values(colorSizes).map(item => item.quantity).reduce((a, b) => a + b, 0);
        if (qty === 0) return;

        console.log('📊 Quantity-based useEffect triggered:', {
            currentColor,
            qty,
            printTechnology
        });

        // Convert string to PrintingTechnology enum
        const selectedPrintingTechnology = convertStringToPrintingTechnology(printTechnology);

        void fetchPrintingPriceRules(selectedVariant.id, currentColor, qty, selectedPrintingTechnology);
    }, [currentColor, selectedVariant, sizeQuantities, fetchPrintingPriceRules, printTechnology]);

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

            // Convert string to PrintingTechnology enum
            const selectedPrintingTechnology = convertStringToPrintingTechnology(newPrintTech);

            // Get current quantity or default to 1
            const currentColorForFetch = selected.color || currentColor;
            const colorSizes = sizeQuantities[currentColorForFetch || ''];
            let qty = 1; // Default quantity

            if (colorSizes && Object.keys(colorSizes).length > 0) {
                const totalQty = Object.values(colorSizes).map(item => item.quantity).reduce((a, b) => a + b, 0);
                if (totalQty > 0) {
                    qty = totalQty;
                }
            }

            // Immediately fetch pricing with new technology
            setTimeout(() => {
                void fetchPrintingPriceRules(variant.id, currentColorForFetch!, qty, selectedPrintingTechnology);
            }, 100); // Small delay to ensure state is updated
        }
    }, [currentColor, printTechnology, sizeQuantities, fetchPrintingPriceRules, setSelectedVariant]);

    const handleQuantityChange = useCallback(async (size: string, quantity: number) => {
        if (!currentColor || !selectedVariant) return;
        const validQty = quantity > 0 ? quantity : 1;

        console.log('📊 handleQuantityChange called:', {
            size,
            quantity: validQty,
            currentColor,
            printTechnology,
            selectedVariant: selectedVariant.id
        });

        setSizeQuantities((prev) => {
            const colorSizes = { ...(prev[currentColor] || {}) };
            if (quantity === 0) {
                delete colorSizes[size];
            } else {
                colorSizes[size] = {
                    quantity: validQty,
                    variantId: selectedVariant?.id || "",
                };
            }
            return {
                ...prev,
                [currentColor]: colorSizes,
            };
        });

        // Convert string to PrintingTechnology enum for quantity change
        const selectedPrintingTechnology = convertStringToPrintingTechnology(printTechnology);

        console.log('🔄 Fetching price rules with current technology:', {
            printTechnology,
            convertedTechnology: selectedPrintingTechnology,
            quantity: validQty
        });

        void fetchPrintingPriceRules(selectedVariant.id, currentColor, validQty, selectedPrintingTechnology);
    }, [selectedVariant, currentColor, fetchPrintingPriceRules, printTechnology]);

    const handleClickAddToCart = useCallback(async () => {
        setAddToCartLoading(true);
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

        if (items.length === 0) {
            toast.error("Please select at least one size and quantity");
            setAddToCartLoading(false);
            return;
        }

        // Helper function to calculate pricing info
        const calculatePricingInfo = (quantity: number) => {
            if (!listProductPriceRules || !currentColor) return null;

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

            const memberPrice = memberPriceRule?.price || 0;
            const retailPrice = retailPriceRule?.price || 0;

            let discountPercentage = 0;
            if (memberPrice > 0 && retailPrice > 0 && retailPrice > memberPrice) {
                discountPercentage = Math.round(((retailPrice - memberPrice) / retailPrice) * 100);
            }

            return {
                memberPrice: memberPrice,
                retailPrice: retailPrice,
                discountPercentage,
                currency: memberPriceRule?.currency || retailPriceRule?.currency || "USD",
                hasDiscount: discountPercentage > 0
            };
        };

        const newItems = items.map((item) => {
            const variant = productDetail?.variants?.find((v) => v.id === item.variantId);
            const originalMetadata = variant?.metadata ?? [];

            // Calculate pricing info for this item
            const pricingInfo = calculatePricingInfo(1);

            const metadata = [
                ...originalMetadata,
                {
                    key: "printing_info",
                    value: JSON.stringify([
                        {
                            print_side: "ALL",
                            printing_technology: printTechnology || "NONE",
                            additional_service_ids: services || [],
                        },
                    ]),
                },
                {
                    key: "service_detail",
                    value: JSON.stringify(serviceDetails)
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
        });

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
    }, [channel, params, sizeQuantities, currentColor, printTechnology, services, serviceDetails, productDetail, listProductPriceRules]);

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
                                    print_side: "ALL",
                                    printing_technology: printTechnology || "NONE",
                                    additional_service_ids: decodedNumbers || [],
                                },
                            ]),
                        },
                        {
                            key: "service_detail",
                            value: JSON.stringify(decodedServiceDetails)
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
            <ProductTitle name={productDetail?.name} isLoading={loading} className="mb-7 px-4 md:hidden" />

            <div className="relative flex w-full max-w-7xl flex-col gap-2 rounded-lg px-4 md:flex-row md:gap-8">
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
                    currentQuantity={currentColor ? Object.values(sizeQuantities[currentColor] ?? {}).reduce((total, item) => total + item.quantity, 0) : 0}
                    sizeList={sizeList}
                    sizeQuantities={currentColor ? sizeQuantities[currentColor] ?? {} : {}}
                    selectedSize={selectedSize}
                    addtoCartLoading={addtoCartLoading}
                    user={user}
                    publicPrintingAdditionalServices={publicPrintingAdditionalServices}
                    features={features}
                    fromDesign={params.fromDesign}
                    onShowSizeGuide={() => setShowSizeGuide(true)}
                    onColorSizeChange={handleColorSizeChange}
                    onQuantityChange={handleQuantityChange}
                    onSelectSize={setSelectedSize}
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
                    title="DTG"
                    listMarginPrice={listProductPriceRules?.rulesForDisplay || []}
                    variantValues={listParams ?? []}
                />
            )}
        </Wrapper>
    );
};

export { ProductDetail };
