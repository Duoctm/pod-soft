
import { ProductsPerPage } from "@/app/config";
import Wrapper from "@/ui/components/wrapper";
import InfiniteProductList from "../../../../ui/components/InfiniteProductList"; 
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
		<Wrapper className="mx-auto w-full pb-16">
			<h2 className="sr-only">Product list</h2>
			<InfiniteProductList channel={params.channel} first={ProductsPerPage} />
		</Wrapper>
	);
}
