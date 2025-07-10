import React from 'react';
import { Pen, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/gql/graphql';

interface ProductActionsProps {
    loading: boolean;
    addtoCartLoading: boolean;
    selectedVariant: ProductVariant | null;
    isShowDesignButton: boolean;
    fromDesign?: boolean;
    onAddToCart: () => void;
    onNavigateToDesignChangeProduct: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
    loading,
    addtoCartLoading,
    selectedVariant,
    isShowDesignButton,
    fromDesign,
    onAddToCart,
    onNavigateToDesignChangeProduct,
}) => {
    if (loading) {
        return (
            <>
                <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 md:w-48"></div>
                <div className="flex w-full flex-row gap-4">
                    <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
                    <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
                </div>
            </>
        );
    }

    // const hasDesignCapability = selectedVariant?.metadata?.find((i) => i.key === "custom_json");

    return (
        <div className="flex flex-grow gap-2">
            {!fromDesign && (
                <div className="flex w-full gap-2">
                    {/* Nút Design */}
                    {(selectedVariant?.metadata?.find((i) => i.key === "custom_json") && (isShowDesignButton == true)) && (
                        <div className="">
                            <button className="flex transform items-center justify-center gap-2 rounded-lg bg-[#F58A71] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#F58A71]/90 focus:outline-none focus:ring-2 focus:ring-[#F58A71] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <Pen className="h-4 w-4" />
                                Design
                            </button>
                        </div>
                    )}
                    {/* Nút Add to Cart */}
                    <div className="">
                        <button
                            id="add-to-cart-button"
                            className={cn(
                                "flex transform items-center justify-center gap-2 rounded-lg bg-[#F58A71] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#F58A71]/90 focus:outline-none focus:ring-2 focus:ring-[#F58A71] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                addtoCartLoading ? "cursor-not-allowed opacity-50" : ""
                            )}
                            onClick={onAddToCart}
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
                </div>
            )}
            {fromDesign === true && (
                <>
                    {selectedVariant?.metadata?.find((i) => i.key === "custom_json") ? (
                        <div onClick={onNavigateToDesignChangeProduct} className="w-full sm:w-auto">
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
    );
};

export { ProductActions };
