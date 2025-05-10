import { notFound, redirect } from "next/navigation";
import { OrderDirection, ProductOrderField, SearchProductsDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { Pagination } from "@/ui/components/Pagination";
import { ProductList } from "@/ui/components/ProductList";
import { ProductsPerPage } from "@/app/config";
import { Search } from "lucide-react";

export const metadata = {
	title: "Search products · ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({
	searchParams,
	params,
}: {
	searchParams: Record<"query" | "cursor", string | string[] | undefined>;
	params: { channel: string };
}) {
	const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;
	const searchValue = searchParams.query;

	if (!searchValue) {
		notFound();
	}

	if (Array.isArray(searchValue)) {
		const firstValidSearchValue = searchValue.find((v) => v.length > 0);
		if (!firstValidSearchValue) {
			notFound();
		}
		redirect(`/search?${new URLSearchParams({ query: firstValidSearchValue }).toString()}`);
	}

	const { products } = await executeGraphQL(SearchProductsDocument, {
		variables: {
			first: ProductsPerPage,
			search: searchValue,
			after: cursor,
			sortBy: ProductOrderField.Rating,
			sortDirection: OrderDirection.Asc,
			channel: params.channel,
		},
		revalidate: 60,
	});

	if (!products) {
		notFound();
	}

	const newSearchParams = new URLSearchParams({
		query: searchValue,
		...(products.pageInfo.endCursor && { cursor: products.pageInfo.endCursor }),
	});

	return (
		<section className="mx-auto min-h-screen max-w-7xl p-8 pb-16">
			{products.totalCount && products.totalCount > 0 ? (
				<div>
					<h1 className="pb-8 text-xl font-semibold">Search results for &quot;{searchValue}&quot;:</h1>
					<ProductList products={products.edges.map((e) => e.node)} />
					<Pagination
						pageInfo={{
							...products.pageInfo,
							basePathname: `/search`,
							urlSearchParams: newSearchParams,
						}}
					/>
				</div>
			) : (
				<div className="flex min-h-[50vh] flex-col items-center justify-center">
					<div className="mb-4 text-6xl text-gray-400">
						<Search className="h-20 w-20" />
					</div>
					<h1 className="text-2xl font-medium text-gray-700">No results found</h1>
					<p className="mt-2 text-gray-500">We couldn't find any matches for "{searchValue}"</p>
				</div>
			)}
		</section>
	);
}
