"use client";

import { ProductCountableConnection } from "@/gql/graphql";
import React, { useEffect, useState, useCallback } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { getProductList } from "../../app/[channel]/(main)/products/[slug]/actions/getProductList";
import { ProductList } from "@/ui/components/ProductList"; // nếu bạn có component hiển thị

type InfiniteProductListProps = {
	channel: string;
	first: number;
};

const InfiniteProductList = ({ channel, first }: InfiniteProductListProps) => {
	const [loading, setLoading] = useState(false);
	const [products, setProducts] = useState<ProductCountableConnection | null>(null);
	const [cursor, setCursor] = useState<string | null | undefined>(null);

	const [setRef, isIntersecting] = useIntersectionObserver({
		threshold: 1,
		freezeOnceVisible: false,
	});

	const fetchData = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		const newData = await getProductList({
			first: first,
			after: cursor,
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
	}, [cursor, channel, first, loading]);

	useEffect(() => {
		if (isIntersecting && !loading && (products?.pageInfo.hasNextPage ?? true)) {
			fetchData();
		}
	}, [isIntersecting, loading, fetchData, products?.pageInfo.hasNextPage]);

	return (
		<div className="w-full min-h-screen">
			{products && <ProductList products={products.edges.map((e) => e.node)} />}
			{loading && (
				<div className="my-4 flex justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
				</div>
			)}
			{/* {!products?.pageInfo.hasNextPage && <p className="my-4 text-center">No more products</p>} */}
			<div ref={setRef}></div>
		</div>
	);
};

export default InfiniteProductList;
