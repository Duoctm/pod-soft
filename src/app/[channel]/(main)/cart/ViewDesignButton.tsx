"use client";
import { fetchCheckoutLineMetadata } from "./data";
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
					localStorage.setItem(
						"cart",
						JSON.stringify({
							params: params,
						}),
					);
					const metadata = (await fetchCheckoutLineMetadata(checkout, lineId)) as any;
					localStorage.setItem("designInfor", JSON.stringify(metadata));
					localStorage.setItem("cartId", lineId);
					window.location.replace(`design/2/${metadata.productId}/${metadata.colorValue}/${metadata.variantId}`);
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
