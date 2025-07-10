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

    return (
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
    );
};

export { ProductPriceDisplay };
