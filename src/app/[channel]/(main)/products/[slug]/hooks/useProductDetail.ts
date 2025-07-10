import { useState, useCallback } from 'react';
import { getProductDetails } from '../actions/getProductDetails';
import type { Product, ProductVariant } from '@/gql/graphql';

export const useProductDetail = (slug: string, channel: string) => {
    const [productDetail, setProductDetail] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const getProductDetail = useCallback(async (variantParam?: string) => {
        setLoading(true);
        try {
            const { product } = await getProductDetails(slug, channel);
            if (product) {
                if (product?.defaultVariant) {
                    if (variantParam) {
                        const foundVariant = product.variants?.find((variant) => variant.id === variantParam);
                        setSelectedVariant(foundVariant ? foundVariant as ProductVariant : product.defaultVariant as ProductVariant);
                    } else {
                        setSelectedVariant(product.defaultVariant as ProductVariant);
                    }
                    setProductDetail(product as Product);
                }
            }
        } catch (error) {
            console.error("Error when fetching product details:", error);
        } finally {
            setLoading(false);
        }
    }, [slug, channel]);

    return {
        productDetail,
        loading,
        selectedVariant,
        setSelectedVariant,
        getProductDetail,
    };
};
