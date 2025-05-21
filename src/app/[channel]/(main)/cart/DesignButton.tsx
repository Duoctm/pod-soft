"use client";
type DesignButtonProps = {
	colorId: string;
	productId: string;
	params: Record<string, string>;
	selectedVariantId: string;
	quantity: number;
};

export function DesignButton({ productId, colorId, params, selectedVariantId, quantity }: DesignButtonProps) {
	return (
		<button
			type="button"
			onClick={async () => {
				JSON.stringify({
					params: params,
					selectedVariantId: selectedVariantId,
					quantity: quantity,
				}),
					window.location.replace(`design/1/${productId}/${colorId}`);
			}}
			 className="text-sm md:text-blue-500 md:underline md:font-medium  border md:border-none py-1 border-black bg-white  px-2 rounded-full"

			// className="rounded-md font-semibold px-3 py-1 text-sm bg-[#8B3958] text-white border border-[#8B3958] hover:bg-[#7A314F] hover:text-white hover:border-[#7A314F] focus:outline-none focus:ring-2 focus:ring-[#7A314F] focus:ring-offset-2 disabled:bg-[#C59CAE] disabled:text-white disabled:border-[#C59CAE] disabled:cursor-not-allowed"
		>
			Design
		</button>
	);
}
