"use client";
type DesignButtonProps = {
	colorId: string;
	variantId: string;
	productId: string;
	params: Record<string, string>;
	selectedVariantId: string;
	quantity: number;
};

export function DesignButton({ productId, colorId, variantId, params, selectedVariantId, quantity }: DesignButtonProps) {
	return (
		<button
			type="button"
			onClick={async () => {
				const cartInfo = JSON.stringify({
					params: params,
					selectedVariantId: selectedVariantId,
					quantity: quantity,
				});
				localStorage.setItem('cart', cartInfo);
				window.location.replace(`design/1/${productId}/${colorId}/${variantId}`);
			}}
			className="text-sm md:text-blue-500 md:underline md:font-medium  border md:border-none  border-black bg-white  px-2 rounded-full py-1"
		>
			Design
		</button>
	);
}
