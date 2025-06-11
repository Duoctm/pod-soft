import { create } from "zustand";
import { type AttributeCountableConnection, type ProductCountableConnection } from "@/gql/graphql";

export type ProductType = {
    loading: boolean;
    cursor: string | null;
    products: ProductCountableConnection | null;
    attibutes: AttributeCountableConnection | null;
    setAttributes: (attributes: AttributeCountableConnection | null) => void;
    setProducts: (products: ProductCountableConnection | null) => void;
    setLoading: (loading: boolean) => void;
}


export const useProduct = create<ProductType>()((set) => ({
    loading: true,
    products: null,
    cursor: null,
    attibutes: null,
    setAttributes(newAttributes) {
        set(() => ({
            attibutes: newAttributes as AttributeCountableConnection || null,
        }));
    },
    setProducts(products) {
        set((state) => ({
            ...state,
            products,
            loading: false,
            cursor: products?.pageInfo.endCursor || null,
        }));
    },
    setLoading(loading) {
        set((state) => ({
            ...state,
            loading,
        }));
    },
}));