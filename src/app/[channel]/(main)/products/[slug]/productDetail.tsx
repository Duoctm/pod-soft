/* eslint-disable import/order */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";


import React, { useCallback, useEffect, useState, useMemo } from "react";
import edjsHTML from "editorjs-html";
import xss from "xss";
import { Info, Loader, Loader2, Pen, Ruler, ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

import AddToCardLoading from "./_components/AddToCardLoading";
import ProductSizeQuantityInputs from "./_components/ProductSizeQuantityInputs";
import Swipper from "./_components/Swipper";
import SizeGuideModal from "./guide";
import { ProductDescription } from "./_components/ProductDescription";
import { ProductTitle } from "./_components/ProductTitle";
import { getProductDetails } from "./actions/getProductDetails";

import {
    type UserDetailsFragment,
    type Product,
    type ProductVariant,
    PrintingTechnology,
    PrintSide,
    type PrintingPriceRuleCountableEdge,
    type PrintingAdditionalServiceCountableConnection,
} from "@/gql/graphql";
import "react-toastify/dist/ReactToastify.css";
import { addCart } from "./actions/addCart";

import MarginPricePopup from "./_components/MarginPricePopup";

import { getPublicPrintingPriceRules } from "./actions/getPublicPrintingPriceRules";
import Wrapper from "@/ui/components/wrapper";
import { getUser } from "@/actions/user";
import { cn, formatMoney } from "@/lib/utils";
import { useNavigateLogin } from "@/hooks/useNavigateLogin";

import ProductSelector from "./_components/ProductSelector";
import { getPublicPrintingAdditionServices } from "./actions/getPublicPrintingAdditionServices";
import PublicPrintingAdditionalServices from "./_components/PublicPrintingAdditionalServices";

interface PageProps {
    params: {
        slug: string;
        channel: string;
        fromDesign?: boolean;
        typeDesign?: 1 | 3;
    };
}

interface BlocksProps {
    timne: number;
    version: string;
    blocks: BlockProps[];
}

interface BlockProps {
    id: string;
    type: string;
    data: {
        text: string;
    };
}

const parseDescription = (description: string, lineIndex: number = 0): string[] | null => {
    const parser = edjsHTML();
    if (!description) return null;
    try {
        const parsedData = JSON.parse(description) as BlocksProps;
        parsedData.blocks.map((block: { data: { text: string } }) => {
            const removeText = block.data.text.split("\n")[lineIndex];
            block.data.text = removeText;
        });
        return parser.parse(parsedData);
    } catch (parseError) {
        console.error("Error parsing product description:", parseError);
        return [xss(description)];
    }
};

// Thay đổi type SizeQuantities để lưu theo từng color
type SizeQuantities = {
    [colorId: string]: {
        [size: string]: { quantity: number; variantId: string };
    };
};

const ProductDetail: React.FC<PageProps> = ({ params }) => {
    const { slug, channel } = params;
    const searchParams = useSearchParams();
    const variantParam = searchParams.get("variant");

    const [user, setUser] = useState<UserDetailsFragment>();
    const router = useRouter();
    const [productDetail, setProductDetail] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showMarginPrice, setShowMarginPrice] = useState(false);
    const [imagesLoading, setImagesLoading] = useState<boolean>(false);
    // Lưu sizeQuantities theo từng color
    const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({});
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [addtoCartLoading, setAddToCartLoading] = useState(false);
    const [colorAttributeValueId, setColorAttributeValueId] = useState<string | undefined>();
    const [sizeList, setSizeList] = useState<string[]>([]);
    const [printTechnology, setPrintTechnology] = useState<string | null>("NONE");
    const [services, setServices] = useState<string[] | null>(null);
    const [isShowDesignButton, setShowDesignButton] = useState<boolean>(false);
    const [serviceDetails, setServiceDetails] = useState<{
        id: string;
        name: string;
        price: number;
        currency: string;
    }[] | null>(null);

    const [productPriceRules, setProductPriceRules] = useState<{
        [colorId: string]: { price: number; currency: string };
    }>({});
    const [listProductPriceRules, setListProductPriceRules] = useState<
        Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[] | null
    >(null);
    const [hasUser, setHasUser] = useState<boolean>(false);

    const [listParams, setListParams] = useState<{ name: string; size: string }[] | null>(null);
    // Thêm state lưu color hiện tại
    const [currentColor, setCurrentColor] = useState<string | null>(null);
    const [publicPrintingAdditionalServices, setPublicPrintingAdditionalServices] = useState<Pick<PrintingAdditionalServiceCountableConnection, "edges" | "__typename"> | null>(null);



    const features = useMemo(() => {
        if (!productDetail?.description) return null;
        return parseDescription(productDetail.description, 3);
    }, [productDetail?.description]);





    const findPrintingPriceRule = (
        listProductPriceRules: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[] | null,
        quantity: number,
    ) => {
        if (!listProductPriceRules) return null;
        const foundRule =
            listProductPriceRules.find((item) => {
                if (!item.node.condition) return false;
                const min = item.node.condition.minQuantity;
                const max = item.node.condition.maxQuantity;

                if (min == null) return false;
                return quantity >= min && (typeof max === "undefined" || max === null || quantity <= max);
            })?.node || null;

        if (!foundRule) {
            // Optionally, show a message or handle the missing rule case here
            // toast.error("No price rule found for this quantity");
        }

        return foundRule;
    };

    const getProductDetail = useCallback(async () => {
        setLoading(true);
        try {
            const { product } = await getProductDetails(slug, channel);
            if (product) {
                if (product?.defaultVariant) {
                    if (variantParam) {
                        product.variants?.find((variant) => variant.id === variantParam)
                            ? setSelectedVariant(
                                product.variants?.find((variant) => variant.id === variantParam) as ProductVariant,
                            )
                            : setSelectedVariant(product.defaultVariant as ProductVariant);
                    }
                    setProductDetail(product as Product);
                }
            }
        } catch (error) {
            throw new Error("Error when fetching data");
        } finally {
            setLoading(false);
        }
    }, [slug, channel]);

    // Refactored to accept variantId, colorId, and qty as parameters
    const fetchPrintingPriceRules = useCallback(
        async (variantId: string, colorId: string, qty: number) => {
            if (!variantId || !colorId || typeof qty !== "number") return;

            try {
                // Decode variantId cho API
                let objectId: number | null = null;
                try {
                    objectId = parseInt(atob(variantId).split(":")[1]);
                } catch {
                    objectId = null;
                }
                if (!objectId) return;

                // Gọi API lấy giá
                const publicPrintingPriceRules = await getPublicPrintingPriceRules({
                    channel: channel,
                    printingTechnologies: [PrintingTechnology.None],
                    usedForCalculation: hasUser,
                    printSide: PrintSide.All,
                    objectIds: [objectId],
                });

                const edges =
                    (publicPrintingPriceRules?.edges as Pick<
                        PrintingPriceRuleCountableEdge,
                        "node" | "__typename"
                    >[]) || null;

                setListProductPriceRules(edges);

                if (edges && edges.length > 0) {
                    const priceRule = findPrintingPriceRule(edges, qty);
                    setProductPriceRules((prev) => ({
                        ...prev,
                        [colorId]: {
                            price: priceRule?.price || 0,
                            currency: priceRule?.currency || "USD",
                        },
                    }));
                } else {
                    setProductPriceRules((prev) => ({
                        ...prev,
                        [colorId]: { price: 0, currency: "USD" },
                    }));
                }
            } catch (error) {
                console.error("Error fetching printing price rules:", error);
            }
        },
        [hasUser, loading],
    );

    const fetchUser = useCallback(async () => {
        try {
            const userData = await getUser();
            if (userData) {
                setUser(userData as UserDetailsFragment);
                setHasUser(!!userData);
            }
            return userData;
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    }, []);

    const getPublicPrintingAdditionalServices = useCallback(async () => {
        try {
            const services = await getPublicPrintingAdditionServices(channel);
            if (!services) {
                return;
            }
            else {
                setPublicPrintingAdditionalServices(services as Pick<PrintingAdditionalServiceCountableConnection, "edges" | "__typename">);
            }
        } catch (error) {
            throw new Error("Error fetching printing additional services");
        }
    }, [channel, hasUser]);


    useEffect(() => {
        void fetchUser();
    }, [slug, channel]);

    useEffect(() => {
        void getPublicPrintingAdditionalServices();
    }, [channel, hasUser]);

    useEffect(() => {
        if (!currentColor || !selectedVariant) return;

        const colorSizes = sizeQuantities[currentColor];
        if (!colorSizes || Object.keys(colorSizes).length === 0) return; // Không có size nào cho màu này

        // Lấy tổng qty của tất cả size thuộc màu hiện tại
        const qty = Object.values(colorSizes)
            .map(item => item.quantity)
            .reduce((a, b) => a + b, 0);

        if (qty === 0) return; // Không có qty nào

        void fetchPrintingPriceRules(selectedVariant.id, currentColor, qty);
    }, [currentColor, selectedVariant, sizeQuantities, fetchPrintingPriceRules, loading]);


    useEffect(() => {
        void getProductDetail();
    }, [slug, channel, hasUser]);

    useEffect(() => {
        if (!productDetail || !productDetail.variants?.length) return;

        // Lấy variant đầu tiên làm mặc định nếu chưa có currentColor
        const defaultVariant = productDetail.defaultVariant || productDetail.variants[0];
        console.log("🚀 productDetail.tsx:262 - defaultVariant:", defaultVariant);

        const colorName = defaultVariant?.attributes?.find(attr => attr.attribute)?.values?.[0]?.name;
        console.log("🚀 productDetail.tsx:263 - colorId:", colorName);

        const size = defaultVariant?.attributes?.find(attr => attr.attribute?.name === "SIZE")?.values?.[0]?.name;

        if (colorName && !currentColor) {
            setCurrentColor(colorName);
        }

        // Nếu chưa có sizeQuantities cho màu này thì set mặc định 1
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
    }, [productDetail]);


    // Xử lý chọn color/size
    const handleColorSizeChange = useCallback(
        (
            selected: { color: string | null; size: string | null },
            _variantId: string | null,
            sizeList: string[],
            selectedPrintTech: string | null,
            colorAttributeValueId?: string,
            variant?: ProductVariant | null,
        ) => {
            // Nếu đổi sang color mới
            if (selected.color && selected.color !== currentColor) {
                setCurrentColor(selected.color);
                // Nếu đã có lựa chọn cho color này thì load lại, nếu chưa thì reset
                setSizeQuantities((prev) => {
                    // Nếu đã có state cho color mới thì giữ nguyên, nếu chưa thì tạo rỗng
                    if (prev[selected.color!]) return prev;
                    return { ...prev, [selected.color!]: {} };
                });
            }

            // Chỉ push những giá trị unit (size là đơn vị, không phải màu)
            if (selected.size && selected.color) {
                setListParams((prev) => {
                    // Tránh trùng lặp size
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

            setPrintTechnology(selectedPrintTech || "NONE");

            setSelectedVariant((prev) => (prev?.id !== variant?.id ? variant ?? null : prev));
            setSelectedSize((prev) => (prev !== selected.size ? selected.size ?? null : prev));
            setColorAttributeValueId((prev) => (prev !== colorAttributeValueId ? colorAttributeValueId : prev));
            setSizeList((prev) => (JSON.stringify(prev) !== JSON.stringify(sizeList) ? sizeList : prev));
        },
        [currentColor],
    );

    // Xử lý chọn số lượng size, lưu theo color
    const handleQuantityChange = useCallback(
        async (size: string, quantity: number) => {
            if (!currentColor || !selectedVariant) return;
            const validQty = quantity > 0 ? quantity : 1;

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

            // Gọi lại API lấy giá mới nhất cho màu hiện tại và số lượng mới
            void fetchPrintingPriceRules(selectedVariant.id, currentColor, validQty);
        },
        [selectedVariant, currentColor, fetchPrintingPriceRules],
    );


    const handleSetOptions = useCallback(
        (ids: string[], serviceDetails: { id: string, name: string, price: number, currency: string }[]) => {
            if (!ids || !serviceDetails) return 1;
            console.log("🚀 productDetail.tsx:406 - ids:", ids);

            setServices(ids);
            setServiceDetails(serviceDetails);
        },
        [],
    );


    // Thêm vào giỏ hàng
    const handleClickAddToCart = useCallback(async () => {
        setAddToCartLoading(true);
        const user = await getUser();
        if (!user) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            await useNavigateLogin(channel);
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

        const newItems = items.map((item) => {
            // Tìm variant tương ứng với variantId
            const variant = productDetail?.variants?.find((v) => v.id === item.variantId);
            // Lấy metadata gốc của variant (nếu có)
            const originalMetadata = variant?.metadata ?? [];
            return {
                variantId: item.variantId,
                quantity: item.quantity,
                quantityOfCart: sizeQuantities[item.variantId],
                metadata: [
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
                ],
            };
        });

        const result = await addCart(params, newItems);
        if (result?.error?.error == 2) {
            result.error.messages.forEach((item) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                toast.error(item.message);
            });
        } else if (result?.error?.error == 3) {
            toast.error("Something went wrong. Please try again later");
        } else {
            toast.success("Product added to cart");
        }

        setAddToCartLoading(false);
        // Reset size quantities của color hiện tại sau khi add to cart
        setSizeQuantities((prev) => ({
            ...prev,
            [currentColor]: {},
        }));
    }, [channel, params, sizeQuantities, currentColor, printTechnology]);

    // Chuyển sang trang design
    const handleNavigateTodesign = useCallback(async () => {


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
    }, [colorAttributeValueId, selectedVariant, channel, productDetail, params, router, services, serviceDetails, sizeQuantities]);

    const handleNavigateToDesignChangeProduct = useCallback(async () => {

        if (!colorAttributeValueId || !selectedVariant?.id) return;

        router.push(`/${channel}/design/${params.typeDesign}/${productDetail?.id}/${selectedVariant.id}`);
    }, [colorAttributeValueId, selectedVariant, channel, productDetail, params, router, services, serviceDetails, sizeQuantities]);

    return (
        <Wrapper className="flex min-h-screen flex-col md:flex-row">
            <ToastContainer position="top-center" />
            <ProductTitle name={productDetail?.name} isLoading={loading} className="mb-7 px-4 md:hidden" />
            <div className="relative flex w-full max-w-7xl flex-col gap-2 rounded-lg px-4 md:flex-row md:gap-8">
                <div className="w-full md:w-1/2 lg:w-[35%]">
                    {selectedVariant ? (
                        loading || imagesLoading ? (
                            <div
                                className="aspect-square w-full animate-pulse rounded-md bg-gray-200"
                                style={{ minHeight: 300 }}
                            />
                        ) : (
                            <Swipper
                                images={Array.isArray(selectedVariant?.media) ? selectedVariant.media.map((i) => i.url) : []}
                                loading={loading || imagesLoading}
                                onImagesLoaded={() => setImagesLoading(false)}
                            />
                        )
                    ) : (
                        <div
                            className="aspect-square w-full animate-pulse rounded-md bg-gray-200"
                            style={{ minHeight: 300 }}
                        />
                    )}
                    <div className="hidden w-full md:block">
                        <ProductDescription
                            descriptionHtml={parseDescription(productDetail?.description as string)}
                            title="Descriptions"
                        />
                    </div>
                </div>
                <div className="relative flex w-full flex-col rounded-lg md:w-1/2 md:px-6 lg:w-[65%]">
                    <div className=" flex flex-1 flex-grow flex-col">
                        <ProductTitle name={productDetail?.name} isLoading={loading} className="hidden md:flex" />
                        {/* price */}

                        <div className="flex items-center justify-between">
                            {/* <div className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                                {loading || !selectedVariant ? (
                                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32"></div>
                                ) : (
                                    formatMoney(
                                        selectedVariant?.pricing?.price?.gross.amount as number,
                                        selectedVariant?.pricing?.price?.gross.currency as string,
                                    )
                                )}
                            </div> */}

                            {loading || !productPriceRules?.[currentColor!] ? (
                                <div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32">
                                </div>
                            ) : (
                                <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                                    {productPriceRules[currentColor!].price ? (
                                        formatMoney(
                                            productPriceRules[currentColor!].price,
                                            productPriceRules[currentColor!].currency,
                                        )
                                    ) : (
                                        <Loader className="h-6 w-6 animate-spin" />
                                    )}
                                </span>
                            )}
                            <button className="flex items-center gap-x-2" onClick={() => setShowSizeGuide(true)}>
                                <Ruler />
                                <span className="underline">Size Guide</span>
                            </button>
                        </div>
                        <ProductSelector
                            variants={productDetail?.variants || []}
                            defaultVariant={productDetail?.defaultVariant}
                            loading={loading}
                            onChange={handleColorSizeChange}
                            setShowDesignButton={setShowDesignButton}
                        />


                        <ProductSizeQuantityInputs
                            sizeList={sizeList}
                            sizeQuantities={currentColor ? sizeQuantities[currentColor] ?? {} : {}}
                            onChange={handleQuantityChange}
                            selectedSize={selectedSize}
                            onSelectSize={setSelectedSize}
                            min={0}
                            max={productDetail?.defaultVariant?.quantityAvailable as number || 9999}
                        />

                        <PublicPrintingAdditionalServices services={publicPrintingAdditionalServices} onChange={handleSetOptions} />
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-start">
                            {loading ? (
                                <>
                                    <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 md:w-48"></div>
                                    <div className="flex w-full flex-row  gap-4">
                                        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
                                        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-grow gap-2">
                                    {!params.fromDesign && (
                                        <div className="flex flex-1 items-center justify-between gap-2">
                                            <div className="flex items-center justify-between gap-2">

                                                {(selectedVariant?.metadata?.find((i) => i.key === "custom_json") && (isShowDesignButton == true)) && (
                                                    <div onClick={handleNavigateTodesign} className="w-full sm:w-auto">
                                                        <button className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#F58A71] px-5 
              py-2 text-sm font-semibold text-white shadow-lg 
              transition-all duration-300 hover:scale-105 hover:bg-[#F58A71]/90 
              focus:outline-none focus:ring-2
              focus:ring-[#F58A71] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                        >
                                                            <Pen className="h-4 w-4" />
                                                            Design
                                                        </button>
                                                    </div>
                                                )}

                                                <button
                                                    id="add-to-cart-button"
                                                    className={cn(
                                                        "flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#F58A71] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#F58A71]/90 focus:outline-none focus:ring-2 focus:ring-[#F58A71] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
                                                        addtoCartLoading ? "cursor-not-allowed opacity-50" : ""
                                                    )}
                                                    onClick={handleClickAddToCart}
                                                >
                                                    {addtoCartLoading ? (
                                                        <Loader2 className="h-6 w-6 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="h-5 w-5" />
                                                            <p>Add to Cart</p>
                                                        </>
                                                    )}
                                                </button>

                                            </div>
                                            {user ? (
                                                <div className="w-full sm:w-auto">
                                                    <button
                                                        className="flex w-full transform items-center justify-center gap-2 rounded-lg hover:bg-[#8B3958] px-5 py-2 text-sm font-semibold border hover:text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#8B3958]/90 focus:outline-none focus:ring-2 focus:ring-[#8B3958] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                        onClick={() => setShowMarginPrice(true)}
                                                    >
                                                        <Info className="h-4 w-4" />
                                                        Provider Info
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                    {params.fromDesign === true && (
                                        <>
                                            {selectedVariant?.metadata?.find((i) => i.key === "custom_json") ? (
                                                <div onClick={handleNavigateToDesignChangeProduct} className="w-full sm:w-auto">
                                                    <button
                                                        className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#F58A71] px-5 
              py-2 text-sm font-semibold text-white shadow-lg 
              transition-all duration-300 hover:scale-105 hover:bg-[#F58A71]/90 
              focus:outline-none focus:ring-2
              focus:ring-[#F58A71] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"

                                                    >
                                                        Select Product
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 md:w-48" />
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <ProductDescription descriptionHtml={features} isLoading={loading} />
                        <div className="block w-full md:hidden">
                            <ProductDescription
                                descriptionHtml={parseDescription(productDetail?.description as string)}
                                title="Descriptions"
                            />
                        </div>
                    </div>
                </div>
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
                    listMarginPrice={listProductPriceRules}
                    variantValues={listParams ?? []}
                />
            )}
        </Wrapper>
    );
};

// eslint-disable-next-line import/no-default-export
export default ProductDetail;
