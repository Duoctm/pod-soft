import React from 'react';
import { Loader } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

interface ProductPriceDisplayProps {
    loading: boolean;
    currentColor: string | null;
    productPriceRules: {
        [colorId: string]: { price: number; currency: string };
    };
}

// If price is 0, show contact message
const ProductPriceDisplay: React.FC<ProductPriceDisplayProps> = ({
    loading,
    currentColor,
    productPriceRules,
}) => {
    if (loading || !productPriceRules?.[currentColor!]) {
        return (
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32" />
        );
    }

    const currentPrice = productPriceRules[currentColor!];

    // If price is 0, show contact message
    if (currentPrice.price === 0) {
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

    return (
        <span className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
            {currentPrice.price ? (
                formatMoney(currentPrice.price, currentPrice.currency)
            ) : (
                <Loader className="h-6 w-6 animate-spin" />
            )}
        </span>
    );
};

export { ProductPriceDisplay };
