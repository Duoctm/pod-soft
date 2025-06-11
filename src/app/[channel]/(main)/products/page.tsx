
import { ProductsPerPage } from "@/app/config";
import Wrapper from "@/ui/components/wrapper";
// import InfiniteProductList from "../../../../ui/components/InfiniteProductList";
import InfiniteProducts from "@/ui/components/service/InfiniteProducts";
export const metadata = {
	title: "Products · ZoomPrints",
	description: "ZoomPrints is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default async function Page({
	params,
}: {
	params: { channel: string };
	searchParams: {
		cursor: string | string[] | undefined;
		page: number | string | undefined;
	};
}) {
	return (
		<Wrapper>
			{/* <h2 className="sr-only">Product list</h2> */}
			{/* <InfiniteProductList channel={params.channel} first={ProductsPerPage} /> */}
			<InfiniteProducts channel={params.channel} first={ProductsPerPage} />
		</Wrapper>
	);
}
