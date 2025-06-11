/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { Suspense, useCallback, useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { FilterIcon, PackageX } from "lucide-react";
import ProductList from "../ProductList";
import SkeletonLoading from "../SkeletonLoading";
import ProductSkeletonLoading from "../ProductSkeletonLoading";
import { type ProductCountableConnection } from "@/gql/graphql";
import { useProduct } from "@/app/[channel]/(main)/products/utils/useProduct";
import { getProductList } from "@/app/[channel]/(main)/products/[slug]/actions/getProductList";
import { useFilterSidebar } from "@/actions/useFilterSidebar";
const FilterSidebar = React.lazy(() => import("../FilterSidebar"));

const NoProducts = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
            <PackageX className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-500 text-center max-w-md">
                We couldnt find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
        </div>
    );
};

type InfiniteProductListProps = {
    channel: string;
    first: number;
};

const InfiniteProducts = ({ channel, first }: InfiniteProductListProps) => {
    const { cursor, products, loading, setProducts, setLoading } = useProduct();
    const { onOpen } = useFilterSidebar()
    const [setRef, isIntersecting] = useIntersectionObserver({
        threshold: 1,
        freezeOnceVisible: false,
    });

    const loadingMoreRef = useRef(false);

    // Fetch lần đầu
    const fetchProducts = useCallback(async () => {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoading(true);
        const result = await getProductList({
            first,
            after: null,
            channel,
        });
        if (result) setProducts(result as ProductCountableConnection);
        setLoading(false);
        loadingMoreRef.current = false;
    }, [first, channel, setProducts, setLoading]);

    useEffect(() => {
        void fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel, first]);

    // Fetch thêm khi scroll
    const handleFetchMoreProducts = useCallback(
        async () => {
            if (
                loadingMoreRef.current ||
                !products?.pageInfo?.hasNextPage ||
                !products.pageInfo.endCursor
            )
                return;
            loadingMoreRef.current = true;
            setLoading(true);
            const result = await getProductList({
                first,
                after: cursor,
                channel,
            });
            if (result) {
                const newProducts = result as ProductCountableConnection;
                // Merge không trùng id
                const prevIds = new Set(products.edges.map((e) => e.node.id));
                const newEdges = newProducts.edges.filter(
                    (e) => !prevIds.has(e.node.id)
                );
                setProducts({
                    ...newProducts,
                    edges: [...products.edges, ...newEdges],
                });
            }
            setLoading(false);
            loadingMoreRef.current = false;
        },
        [first, channel, products, setProducts, setLoading, cursor]
    );

    useEffect(() => {
        if (
            isIntersecting &&
            products?.pageInfo?.hasNextPage &&
            products.pageInfo.endCursor
        ) {
            void handleFetchMoreProducts();
        }
    }, [isIntersecting, handleFetchMoreProducts, products]);

    return (
        <div className="flex min-h-screen w-full flex-col gap-x-2 md:flex-row pb-4">
            <Suspense fallback={<SkeletonLoading />}>
                <FilterSidebar channel={channel} />
            </Suspense>

            <div className="flex flex-col flex-1 min-h-screen">
                <div className="w-full">
                    {!products && loading ? (
                        <ProductSkeletonLoading />
                    ) : products && products.edges && products.edges.length > 0 ? (
                        <ProductList products={products.edges.map((e) => e.node)} />
                    ) : (
                        <NoProducts />
                    )}
                </div>
                {/* Loading more chỉ khi scroll tới đáy và đang fetch thêm */}
                {products && isIntersecting &&
                    products.pageInfo.hasNextPage &&
                    loadingMoreRef.current &&
                    products.edges.length > 0 && <div className="text-center text-sm text-gray-500 ">Loading more products...</div>}

                <div ref={setRef}></div>
            </div>


            <button
                className="fixed bottom-4 right-4 z-50 rounded-full bg-black p-4 hover:bg-black/50 text-white shadow-lg lg:hidden"
                onClick={() => onOpen()}
            >
                <FilterIcon className="h-6 w-6" />
            </button>
        </div>
    );
};

// eslint-disable-next-line import/no-default-export
export default InfiniteProducts;
