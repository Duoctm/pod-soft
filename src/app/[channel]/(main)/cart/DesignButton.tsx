"use client";
import { getCheckout } from "./action"
import { PrintingTechnology } from "@/gql/graphql";
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
				console.log('cartInfo', quantity);
				localStorage.setItem("services", JSON.stringify(result.printing_info_metadata.value));
				localStorage.setItem(
					"services",
					JSON.stringify(result.line_additional_services && typeof result.line_additional_services.value === "string" ? result.line_additional_services.value : "")
				);
				localStorage.setItem("printTechOfDesign", PrintingTechnology.Dtg);
				window.location.replace(`design/4/${productId}/${variantId}`);
			}}
			className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
		>
			Design
		</button>
	);
}
