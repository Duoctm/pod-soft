import Link from "next/link";
import Image from "next/image";
import React from "react";
import type { ProductEdge } from "../types";

export const ProductCard = React.memo(({ product, channel }: { product: ProductEdge; channel: string }) => (
	<Link
		href={`/${channel}/products/${product.node.slug}`}
		key={product.node.id}
		className="group transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105"
	>
		<div className="relative aspect-square w-full">
			{product.node.thumbnail ? (
				<Image
					src={product.node.thumbnail.url}
					alt={product.node.name}
					fill
					className="scale-90 object-contain transition-all duration-300 group-hover:scale-100"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					priority
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gray-100">
					<span className="text-gray-400">No image available</span>
				</div>
			)}
		</div>
		<div className="p-6">
			<h2 className="mb-3 line-clamp-2 text-xl font-semibold text-gray-800">{product.node.name}</h2>
			<p className="mb-4 line-clamp-3 text-sm text-gray-600">{product.node.name}</p>
		</div>
	</Link>
));
