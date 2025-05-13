import { notFound } from "next/navigation";
import { ProductListPaginatedDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductsPerPage } from "@/app/config";
import Wrapper from "@/ui/components/wrapper";
import InfiniteProductList from "../../../../ui/components/InfiniteProductList";
 
export const metadata = {
	title: "Products · ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({
	params,
	searchParams,
}: {
	params: { channel: string };
	searchParams: {
		cursor: string | string[] | undefined;
		page: number | string  | undefined;
	};
}) {
	const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;
	const { products } = await executeGraphQL(ProductListPaginatedDocument, {
		variables: {
			first: ProductsPerPage,
			after: cursor,
			channel: params.channel,
		},
		revalidate: 60,
	});

	if (!products) {
		notFound();
	}
	// for (const i of products) {
	// 	console.log(i);y
	// }
	// console.log(products.edges[0].node.pricing);

	// const newSearchParams = new URLSearchParams({
	// 	...(products.pageInfo.endCursor && { cursor: products.pageInfo.endCursor }),
	// });

	return (
		<Wrapper className="mx-auto w-full pb-16">
			<h2 className="sr-only">Product list</h2>
			{/* <ProductList products={products.edges.map((e) => e.node)} /> */}
			{/* <Pagination
				pageInfo={{
					// ...products.pageInfo,
					urlSearchParams: newSearchParams,
					basePathname: `/products`,
					itemsPerPage: 12,
					currentPage: page,
					totalCount: products.totalCount as number,
					}}
					/> */}
					<InfiniteProductList channel={params.channel} first={ProductsPerPage} />
		</Wrapper>
	);
}
