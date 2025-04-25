import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";

import type { ProductListItemFragment } from "@/gql/graphql";
import { formatMoneyRange } from "@/lib/utils";

export function ProductElement({
	product,
	loading,
	priority,
}: { product: ProductListItemFragment } & { loading: "eager" | "lazy"; priority?: boolean }) {
	return (
		<li data-testid="ProductElement" className="group">
			<LinkWithChannel href={`/products/${product.slug}`} key={product.id}>
				<div className="overflow-hidden rounded-lg shadow-sm h-full transition-transform duration-300 ease-in-out group-hover:scale-[1.02]">
					{product?.thumbnail?.url && (
						<div className="relative">
							<ProductImageWrapper
								loading={loading}
								src={product.thumbnail.url}
								alt={product.thumbnail.alt ?? ""}
								width={512}
								height={512}
								sizes={"512px"}
								priority={priority}
								className="transform aspect-square object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 ease-in-out group-hover:bg-opacity-10" />
						</div>
					)}
					<div className="p-4 bg-white flex-1">
						<div className="flex justify-between items-start h-full">
							<div className="space-y-2 min-h-[4rem] flex flex-col justify-between">
								<h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 transition-colors duration-300 ease-in-out group-hover:text-blue-600">
									{product.name}
								</h3>
								<p className="text-sm text-neutral-500" data-testid="ProductElement_Category">
									{product.category?.name}
								</p>
							</div>
							<p className="text-lg font-bold text-blue-600 ml-4" data-testid="ProductElement_PriceRange">
								{formatMoneyRange({
									start: product?.pricing?.priceRange?.start?.gross,
									stop: product?.pricing?.priceRange?.stop?.gross,
								})}
							</p>


						</div>
					</div>
				</div>
			</LinkWithChannel>
		</li>
	);
}
