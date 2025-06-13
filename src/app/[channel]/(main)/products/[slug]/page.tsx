'use client'

// eslint-disable-next-line import/order
import { type Product, type ProductVariant } from '@/gql/graphql'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import edjsHTML from "editorjs-html";
import xss from 'xss';
import { Loader2, Pen, Ruler, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import AddToCardLoading from './_components/AddToCardLoading';
import ProductSizeQuantityInputs from './_components/ProductSizeQuantityInputs';
import ProductColorSizeSelector from './_components/ProductColorSizeSelector';
import Swipper from './_components/Swipper';
import SizeGuideModal from './guide';
import { ProductDescription } from './_components/ProductDescription';
import { ProductTitle } from './_components/ProductTitle';
import { getProductDetails } from './actions/getProductDetails';
import "react-toastify/dist/ReactToastify.css";
import { addCart } from './actions/addCart';
import Wrapper from '@/ui/components/wrapper'
import { getUser } from '@/actions/user';
import { cn, formatMoney } from '@/lib/utils';
import { useNavigateLogin } from '@/hooks/useNavigateLogin';

interface PageProps {
    params: {
        slug: string;
        channel: string;
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
}

type SizeQuantities = { [size: string]: { quantity: number; variantId: string } };

const ProductDetail: React.FC<PageProps> = ({ params }) => {
    const { slug, channel } = params;
    const searchParams = useSearchParams()
    const variantParam = searchParams.get("variant")


    const router = useRouter();
    const [productDetail, setProductDetail] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [imagesLoading, setImagesLoading] = useState<boolean>(false);
    const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({});
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [addtoCartLoading, setAddToCartLoading] = useState(false);
    const [colorAttributeValueId, setColorAttributeValueId] = useState<string | undefined>();
    const [sizeList, setSizeList] = useState<string[]>([]);

    const features = useMemo(() => {
        if (!productDetail?.description) return null;
        return parseDescription(productDetail.description, 3);
    }, [productDetail?.description]);

    const getProductDetail = useCallback(async () => {
        setLoading(true);
        try {

            const { product } = await getProductDetails(slug, channel);
            // Set default variant ban đầu
            console.log(product)
            if (product) {
                if (product?.defaultVariant) {
                    setSelectedVariant(product.defaultVariant as ProductVariant);
                    setProductDetail(product as Product);
                }
            }
        } catch (error) {
            throw new Error("Error when fetching data");
        } finally {

            setLoading(false);
        }
    }, [slug, channel, variantParam]);

    useEffect(() => {
        void getProductDetail();
    }, [slug, channel]);


    // Xử lý chọn color/size
    const handleColorSizeChange = useCallback(
        (
            selected: { color: string | null; size: string | null },
            _variantId: string | null,
            sizeList: string[],
            colorAttributeValueId?: string,
            variant?: ProductVariant | null
        ) => {
            setSelectedVariant(prev => (prev?.id !== variant?.id ? variant ?? null : prev));
            setSelectedSize(prev => (prev !== selected.size ? selected.size ?? null : prev));
            setColorAttributeValueId(prev => (prev !== colorAttributeValueId ? colorAttributeValueId : prev));
            setSizeList(prev => (JSON.stringify(prev) !== JSON.stringify(sizeList) ? sizeList : prev));
        },
        []
    );

    // Xử lý chọn số lượng size
    const handleQuantityChange = useCallback(
        (size: string, quantity: number) => {
            setSizeQuantities((prev) => ({
                ...prev,
                [size]: {
                    quantity,
                    variantId: selectedVariant?.id || "",
                },
            }));
        },
        [selectedVariant]
    );

    // Thêm vào giỏ hàng
    const handleClickAddToCart = useCallback(async () => {
        setAddToCartLoading(true);
        const user = await getUser();
        if (!user) {
            void useNavigateLogin(channel);
            setAddToCartLoading(false);
            return;
        }
        const items = Object.values(sizeQuantities)
            .filter((v) => v.quantity > 0 && v.variantId)
            .map(({ variantId, quantity }) => ({ variantId, quantity }));

        if (items.length === 0) {
            toast.error("Please select at least one size and quantity");
            setAddToCartLoading(false);
            return;
        }
        const result = await addCart(params, items);
        if (result?.error?.error == 2) {
            result.error.messages.forEach((item: any) => {
                toast.error(item.message);
            });
        } else if (result?.error?.error == 3) {
            toast.error("Something went wrong. Please try again later");
        } else {
            toast.success("Product added to cart");
        }

        setAddToCartLoading(false);
    }, [channel, params, sizeQuantities]);

    // Chuyển sang trang design
    const handleNavigateTodesign = useCallback(async () => {

        const user = await getUser();
        if (!user) {

            useNavigateLogin(channel);
            setAddToCartLoading(false);
            return;
        }

        if (!colorAttributeValueId || !selectedVariant?.id) return;
        setAddToCartLoading(true);
        localStorage.setItem(
            "cart",
            JSON.stringify({
                params: params,
                selectedVariantId: selectedVariant.id,
                quantity: 1,
            }),
        );
        router.push(`/${channel}/design/1/${productDetail?.id}/${colorAttributeValueId}/${selectedVariant.id}`);
    }, [colorAttributeValueId, selectedVariant, channel, productDetail, params, router]);

    return (
        <Wrapper className='min-h-screen flex flex-col md:flex-row'>
            <ToastContainer position="top-center" />
            <ProductTitle name={productDetail?.name} isLoading={loading} className="mb-7 px-4 md:hidden" />
            <div className="relative flex w-full max-w-7xl flex-col gap-2 rounded-lg px-4 md:flex-row md:gap-8">
                <div className="w-full md:w-1/2 lg:w-[35%]">
                    {selectedVariant ? (
                        (loading || imagesLoading) ? (
                            <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-md" style={{ minHeight: 300 }} />
                        ) : (
                            <Swipper
                                images={selectedVariant?.media?.map(i => i.url) as string[]}
                                loading={loading || imagesLoading}
                                onImagesLoaded={() => setImagesLoading(false)}
                            />
                        )
                    ) : <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-md" style={{ minHeight: 300 }} />}
                    <div className="hidden w-full md:block">
                        <ProductDescription descriptionHtml={parseDescription(productDetail?.description as string)} title="Descriptions" />
                    </div>
                </div>
                <div className="relative flex w-full flex-col rounded-lg md:w-1/2 md:px-6 lg:w-[65%]">
                    <div className=" flex flex-col flex-1 flex-grow">
                        <ProductTitle name={productDetail?.name} isLoading={loading} className="hidden md:flex" />
                        {/* price */}
                        <div className='flex items-center justify-between'>
                            <div className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
                                {loading || !selectedVariant ? (
                                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32"></div>
                                ) : (
                                    formatMoney(
                                        selectedVariant?.pricing?.price?.gross.amount as number,
                                        selectedVariant?.pricing?.price?.gross.currency as string,
                                    )
                                )}
                            </div>
                            <button className="flex items-center gap-x-2" onClick={() => setShowSizeGuide(true)}>
                                <Ruler />
                                <span className="underline">Size Guide</span>
                            </button>
                        </div>
                        <ProductColorSizeSelector
                            variants={productDetail?.variants || []}
                            defaultVariant={productDetail?.defaultVariant}
                            loading={loading}
                            onChange={handleColorSizeChange}
                        />
                        <ProductSizeQuantityInputs
                            sizeList={sizeList}
                            sizeQuantities={sizeQuantities}
                            onChange={handleQuantityChange}
                            selectedSize={selectedSize}
                            onSelectSize={setSelectedSize}
                            min={0}
                            max={9999}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-start mt-4">
                            {loading ? (
                                <>
                                    <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 md:w-48"></div>
                                    <div className="flex w-full flex-row  gap-4">
                                        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
                                        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
                                    </div>
                                </>
                            ) : <div className="flex flex-row-reverse gap-2 ">
                                <button
                                    id="add-to-cart-button "
                                    className={cn(
                                        "flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#8B3958] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#8B3958]/90 focus:outline-none focus:ring-2 focus:ring-[#8B3958] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
                                        addtoCartLoading ? "cursor-not-allowed opacity-50" : "",
                                    )}
                                    onClick={handleClickAddToCart}
                                >
                                    {addtoCartLoading ? (
                                        <Loader2 className='w-6 h-6 animate-spin' />
                                    ) : (
                                        <>
                                            <ShoppingCart className='w-5 h-5' />
                                        </>
                                    )}
                                    <p>Add to Cart</p>
                                </button>
                                {

                                    selectedVariant?.metadata ? selectedVariant?.metadata.find(i => i.key === "custom_json") && <div
                                        onClick={handleNavigateTodesign}
                                        className="w-full sm:w-auto"
                                    >
                                        <button
                                            className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#8B3958] px-5 
                                    py-2 text-sm font-semibold text-white shadow-lg 
                                    transition-all duration-300 hover:scale-105 hover:bg-[#8B3958]/90 
                                    focus:outline-none focus:ring-2
                                    focus:ring-[#8B3958] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                        >
                                            <Pen className='w-4 h-4' />
                                            Design
                                        </button>
                                    </div> :
                                        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 md:w-48"></div>

                                }
                            </div>


                            }
                        </div>
                        <ProductDescription descriptionHtml={features} isLoading={loading} />
                        <div className="block w-full md:hidden">
                            <ProductDescription descriptionHtml={parseDescription(productDetail?.description as string)} title="Descriptions" />
                        </div>
                    </div>
                </div>
            </div>
            {showSizeGuide && (
                <SizeGuideModal
                    setShowSizeGuide={setShowSizeGuide}
                    catalog={
                        productDetail?.category?.slug === "tee" ||
                            productDetail?.category?.slug === "fleece"
                            ? productDetail?.category?.slug
                            : "tee"
                    }
                />
            )}
            {addtoCartLoading && <AddToCardLoading />}
        </Wrapper>
    );
};

export default ProductDetail;