"use client";
import { OrderDirection, ProductCountableConnection, ProductOrderField } from "@/gql/graphql";
import { ProductList } from "@/ui/components/ProductList";
import React, { useCallback, useEffect, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { searchProduct } from "../actions/search";
import { ProductsPerPage } from "@/app/config";
interface ProductSearchResultProps {
	channel: string;
	after: string;
	search: string;
}

const ProductSearchResult = ({ channel, search, after }: ProductSearchResultProps) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [cursor, setCursor] = useState<string | null | undefined>(null);
	const [products, setProducts] = useState<ProductCountableConnection | null>(null);

	const [setRef, isIntersecting] = useIntersectionObserver({
		threshold: 1,
		freezeOnceVisible: false,
	});

	const fetchData = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		const newData = await searchProduct({
			first: ProductsPerPage,
			after: after,
			search: search,
			sortBy: ProductOrderField.Rating,
			sortDirection: OrderDirection.Asc,
			channel: channel,
		});

		if (newData && newData.edges) {
			setProducts((prev) => {
				if (!prev) return newData as ProductCountableConnection;
				return {
					...newData,
					edges: [...prev.edges, ...newData.edges],
				} as ProductCountableConnection;
			});

			setCursor(newData.pageInfo.endCursor);
		}

		setLoading(false);
	}, [cursor, channel, loading, search]);

	useEffect(() => {
		if (isIntersecting && !loading && (products?.pageInfo.hasNextPage ?? true)) {
			fetchData();
		}
	}, [isIntersecting, loading, products?.pageInfo.hasNextPage, search]);

	return (
		<div className="min-h-screen w-full">
			{products && <ProductList products={products.edges.map((e) => e.node)} />}
			{loading && (
				<div className="my-4 flex justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
				</div>
			)}
			<div ref={setRef}></div>
		</div>
	);
};

export default ProductSearchResult;
