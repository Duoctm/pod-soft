"use client";

import React from "react";
// import { FilterSidebar } from "./_components/filter-sidebar";
import { ProductCard } from "./_components/ProductCard";
import { useCategoryData } from "./hooks/useCategoryData";
const CategoryPage = ({ params }: { params: { slug: string; channel: string } }) => {
	const { attributes, category } = useCategoryData(params.slug, params.channel);

	if (!attributes || !category) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white">
				<div className="flex flex-col items-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
					<p className="mt-4 text-lg text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative mx-auto max-w-screen-2xl px-4 py-8">
			<h1 className="mb-12 text-center text-4xl font-bold text-gray-800">
				{category?.name || "Collection Products"}
			</h1>
			<div className="relative flex items-start">
				{/* <FilterSidebar
					channel={params.channel}
					slug={params.slug}
					category={category}
					attributes={attributes}
					setCategory={setCategory}
				/> */}
				{category.products?.edges && category.products.edges.length > 0 ? (
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{category.products.edges.map((product) => (
							<ProductCard key={product.node.id} product={product} channel={params.channel} />
						))}
					</div>
				) : (
					<div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg bg-gray-50">
						<svg
							className="mb-4 h-16 w-16 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
						</svg>
						<h3 className="mb-2 text-xl font-semibold text-gray-700">No Products Found</h3>
						<p className="text-gray-500">There are no products available in this category.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default CategoryPage;
