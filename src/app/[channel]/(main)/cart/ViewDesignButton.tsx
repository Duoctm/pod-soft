"use client";
//import { fetchCheckoutLineMetadata } from "./data";
import { getCheckout } from "./action";
type ViewDesignButtonProps = {
	lineId: string;
	checkout: any;
	params: any;
};

export function ViewDesignButton({ lineId, checkout, params }: ViewDesignButtonProps) {
	return (
		<>
			<button
				type="button"
				onClick={async () => {
					const result = await getCheckout(checkout, lineId);

					// const result = await getCheckout(checkout);
					// console.log('result', result);
					localStorage.setItem(
						"cart",
						JSON.stringify({
							params: params,
						}),
					);
					//const metadata = (await fetchCheckoutLineMetadata(checkout, lineId)) as any;
					const metadata = JSON.parse((result.design_metadata.value)) as any;

					localStorage.setItem("designInfor", JSON.stringify(metadata));
					localStorage.setItem("checkoutLineId", lineId);
					localStorage.setItem("checkoutId", checkout);
					localStorage.setItem("services", JSON.stringify(result.printing_info_metadata.value));
					localStorage.setItem("cart_quantity", JSON.stringify(result.quantity || 0));

					const metadataStr = result.printing_info_metadata.value as string;

					const parsed = JSON.parse(metadataStr) as { printing_technology?: string };

					if (parsed.printing_technology) {
						localStorage.setItem("printTechOfDesign", parsed.printing_technology);
					}


					window.location.replace(`design/2/${metadata.productId}/${metadata.variantId}`);
				}}
				className="whitespace-nowrap rounded-full border border-black bg-white px-4 py-1 text-sm md:border-none md:font-medium md:text-blue-500 md:underline"


			// className="rounded-md font-semibold px-3 py-1 text-sm bg-white text-[#8B3958] border border-[#8B3958] hover:bg-[#7A314F] hover:text-white hover:border-[#7A314F] focus:outline-none focus:ring-2 focus:ring-[#7A314F] focus:ring-offset-2 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-300"
			>
				View Design
			</button>
			|
		</>
	);
}
