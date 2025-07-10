"use client";
import { PrintingTechnology } from "@/gql/graphql";
import { getCheckout } from "./action"
type DesignButtonProps = {
	variantId: string;
	productId: string;
	params: Record<string, string>;
	selectedVariantId: string;
	quantity: number;
	checkout: string;
	lineId: string;
};

export function DesignButton({ productId, variantId, params, selectedVariantId, quantity, checkout, lineId }: DesignButtonProps) {
	return (
		<button
			type="button"
			onClick={async () => {
				const result = await getCheckout(checkout, lineId);

				const cartInfo = JSON.stringify({
					params: params,
					selectedVariantId: selectedVariantId,
					quantity: quantity,
				});
				localStorage.setItem('cart', cartInfo);
				localStorage.setItem("services", JSON.stringify(result.printing_info_metadata.value));
				localStorage.setItem("printTechOfDesign", PrintingTechnology.Dtg);
				window.location.replace(`design/4/${productId}/${variantId}`);
			}}
		>
			<span
				className="text-sm md:text-blue-500 md:underline md:font-medium  border md:border-none  border-black bg-white  px-2 rounded-full py-1"
			>
				Design
			</span>
		</button>
	);
}
