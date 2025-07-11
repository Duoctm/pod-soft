"use client";
import { getCheckout } from "./action";
import { cn } from "@/lib/utils";

type ViewDesignButtonProps = {
	lineId: string;
	checkout: string;
	params: { channel: string };
	metadata?: any; // Thêm prop metadata nếu có thể truyền vào
};

export function ViewDesignButton({ lineId, checkout, params, metadata }: ViewDesignButtonProps) {
	// Nếu metadata chưa có, không render nút
	if (!metadata) return null;

	return (
		<button
			type="button"
			onClick={async () => {
				const result = await getCheckout(checkout, lineId);

				localStorage.setItem(
					"cart",
					JSON.stringify({
						params: params,
					}),
				);

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
			className={cn(
				"inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors",
				{}
			)}
		>
			View Design
		</button>
	);
}
