import React from "react";
import ProductElement from "./ProductElement";
import { type ProductListItemFragment } from "@/gql/graphql";

const ProductList = React.memo(function ProductList({ products }: { products: readonly ProductListItemFragment[] }) {
	if (!products || products.length === 0) {
		return (
			<div className="w-full text-center py-8">
				<h2 className="text-xl font-medium text-gray-900">No products found</h2>
				<p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
			</div>
		);
	}

	return (
		<ul
			role="list"
			data-testid="ProductList"
			className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 w-full mx-auto min-h-screen"
		>
			{products.map((product, index) => (
				<ProductElement
					key={product.id}
					product={product}
					priority={index < 2}
					loading={index < 3 ? "eager" : "lazy"}
				/>
			))}
		</ul>
	);
});

export default ProductList;
