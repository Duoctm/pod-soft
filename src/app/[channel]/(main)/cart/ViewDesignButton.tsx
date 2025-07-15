"use client";
import { getCheckout } from "./action";
import { cn } from "@/lib/utils";

type MetadataItem = { key: string; value: string };

interface ViewDesignButtonProps {
	lineId: string;
	checkout: string;
	params: { channel: string };
	metadata?: MetadataItem[];
}

interface DesignMetadata {
	productId: string;
	variantId: string;
	// Add other fields as needed
}

interface CheckoutLineMetadata {
	quantity: number | null;
	design_metadata: MetadataItem | null;
	printing_info_metadata: MetadataItem | null;
}

export function ViewDesignButton({ lineId, checkout, params, metadata }: ViewDesignButtonProps) {
	const viewDesign = metadata?.find((item: MetadataItem) => item.key === "design");
	// Nếu metadata chưa có, không render nút
	if (!viewDesign) return null;

	return (
		<button
			type="button"
			onClick={async () => {
				const result: CheckoutLineMetadata = await getCheckout(checkout, lineId);

				localStorage.setItem(
					"cart",
					JSON.stringify({
						params: params,
					}),
				);

				// Type the design_metadata parsing
				let designMetadata: DesignMetadata | undefined;
				if (result.design_metadata && typeof result.design_metadata.value === "string") {
					try {
						designMetadata = JSON.parse(result.design_metadata.value) as DesignMetadata;
					} catch {
						designMetadata = undefined;
					}
				}
				if (!designMetadata) return;

				localStorage.setItem("designInfor", JSON.stringify(designMetadata));
				localStorage.setItem("checkoutLineId", lineId);
				localStorage.setItem("checkoutId", checkout);
				localStorage.setItem(
					"services",
					JSON.stringify(result.printing_info_metadata && typeof result.printing_info_metadata.value === "string" ? result.printing_info_metadata.value : "")
				);
				localStorage.setItem("cart_quantity", JSON.stringify(result.quantity || 0));

				// Type the printing_info_metadata parsing
				let printingInfo: { printing_technology?: string } = {};
				if (result.printing_info_metadata && typeof result.printing_info_metadata.value === "string") {
					try {
						const parsed = JSON.parse(result.printing_info_metadata.value);
						if (typeof parsed === "object" && parsed !== null) {
							printingInfo = parsed;
						}
					} catch {
						printingInfo = {};
					}
				}

				if (printingInfo.printing_technology) {
					localStorage.setItem("printTechOfDesign", printingInfo.printing_technology);
				}

				window.location.replace(`design/2/${designMetadata.productId}/${designMetadata.variantId}`);
			}}
			className={cn(
				"inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors",
				{}
			)}
		>
			View Design
		</button>
	);
}
