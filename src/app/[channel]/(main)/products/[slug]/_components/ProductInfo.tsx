import React from 'react';
import { Ruler } from 'lucide-react';
import { ProductTitle } from './ProductTitle';
import { ProductPriceDisplayWithDiscount } from './ProductPriceDisplayWithDiscount';
import ProductSelector from './ProductSelector';
import ProductSizeQuantityInputs from './ProductSizeQuantityInputs';
import PublicPrintingAdditionalServices from './PublicPrintingAdditionalServices';
import { ProductActions } from './ProductActions';
import { ProductDescription } from './ProductDescription';
import type { Product, UserDetailsFragment, PrintingAdditionalServiceCountableConnection, PrintingPriceRuleCountableEdge } from '@/gql/graphql';

interface ProductInfoProps {
    productDetail: Product | null;
    loading: boolean;
    currentColor: string | null;
    productPriceRules: { [colorId: string]: { price: number; currency: string } };
    listProductPriceRules: {
        rulesForCalculation: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
        rulesForDisplay: Pick<PrintingPriceRuleCountableEdge, "node" | "__typename">[];
    } | null;
    hasUser: boolean;
    currentQuantity: number;
    sizeList: string[];
    sizeQuantities: { [size: string]: { quantity: number; variantId: string } };
    selectedSize: string | null;
    addtoCartLoading: boolean;
    user: UserDetailsFragment | undefined;
    publicPrintingAdditionalServices: Pick<PrintingAdditionalServiceCountableConnection, "edges" | "__typename"> | null;
    features: string[] | null;
    isShowDesignButton: boolean;
    fromDesign?: boolean;
    onShowSizeGuide: () => void;
    onColorSizeChange: (selected: any, variantId: any, sizeList: any, printTech: any, colorId?: any, variant?: any) => void;
    onQuantityChange: (size: string, quantity: number) => void;
    onSelectSize: (size: string) => void;
    onSetOptions: (ids: string[], serviceDetails: any) => void;
    onAddToCart: () => void;
    onNavigateToDesign: () => void;
    onNavigateToDesignChangeProduct: () => void;
    onShowMarginPrice: () => void;
    setShowDesignButton: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
    productDetail,
    loading,
    currentColor,
    productPriceRules,
    listProductPriceRules,
    hasUser,
    currentQuantity,
    sizeList,
    sizeQuantities,
    selectedSize,
    addtoCartLoading,
    user,
    publicPrintingAdditionalServices,
    features,
    isShowDesignButton,
    fromDesign,
    onShowSizeGuide,
    onColorSizeChange,
    onQuantityChange,
    onSelectSize,
    onSetOptions,
    onAddToCart,
    onNavigateToDesign,
    onNavigateToDesignChangeProduct,
    onShowMarginPrice,
    setShowDesignButton
}) => {
    return (
        <div className="relative flex w-full flex-col rounded-lg md:w-1/2 md:px-6 lg:w-[65%]">
            <div className="flex flex-1 flex-grow flex-col">
                <ProductTitle name={productDetail?.name} isLoading={loading} className="hidden md:flex" />

                <div className="flex items-center justify-between">
                    <ProductPriceDisplayWithDiscount
                        loading={loading}
                        currentColor={currentColor}
                        productPriceRules={productPriceRules}
                        listProductPriceRules={listProductPriceRules}
                        hasUser={hasUser}
                        quantity={currentQuantity}
                    />
                    <button className="flex items-center gap-x-2" onClick={onShowSizeGuide}>
                        <Ruler />
                        <span className="underline">Size Guide</span>
                    </button>
                </div>

                <ProductSelector
                    variants={productDetail?.variants || []}
                    defaultVariant={productDetail?.defaultVariant}
                    loading={loading}
                    onChange={onColorSizeChange}
                    setShowDesignButton={setShowDesignButton}
                />

                <ProductSizeQuantityInputs
                    sizeList={sizeList}
                    sizeQuantities={sizeQuantities}
                    onChange={onQuantityChange}
                    selectedSize={selectedSize}
                    onSelectSize={onSelectSize}
                    min={0}
                    max={productDetail?.defaultVariant?.quantityAvailable as number || 9999}
                />

                <PublicPrintingAdditionalServices
                    services={publicPrintingAdditionalServices}
                    onChange={onSetOptions}
                />

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-start">
                    <ProductActions
                        loading={loading}
                        addtoCartLoading={addtoCartLoading}
                        user={user}
                        selectedVariant={productDetail?.defaultVariant || null}
                        isShowDesignButton={isShowDesignButton}
                        fromDesign={fromDesign}
                        onAddToCart={onAddToCart}
                        onNavigateToDesign={onNavigateToDesign}
                        onNavigateToDesignChangeProduct={onNavigateToDesignChangeProduct}
                        onShowMarginPrice={onShowMarginPrice}
                    />
                </div>

                <ProductDescription descriptionHtml={features} isLoading={loading} />

                <div className="block w-full md:hidden">
                    <ProductDescription
                        descriptionHtml={features}
                        title="Descriptions"
                    />
                </div>
            </div>
        </div>
    );
};

export { ProductInfo };
