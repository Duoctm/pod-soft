import React from "react";

type Props = {
	sizeList: string[];
	sizeQuantities: { [size: string]: { quantity: number; variantId: string } };
	onChange: (size: string, quantity: number) => void;
	min?: number;
	max?: number;
	selectedSize?: string | null;
	onSelectSize?: (size: string) => void;
};

const ProductSizeQuantityInputs: React.FC<Props> = ({
	sizeList,
	sizeQuantities,
	onChange,
	min = 0,
	max = 100,
	selectedSize,
	onSelectSize,
}) => {
	// Xoá log hoặc chỉ log khi debug
	// console.log("🚀 ProductSizeQuantityInputs.tsx:22 - sizeQuantities:", sizeQuantities);

	return (
		<div className="flex flex-wrap gap-2">
			{sizeList.map((size) => (
				<div key={size} className="flex flex-col items-center">
					<span className="mb-1 font-semibold">{size}</span>
					<input
						type="number"
						min={min}
						max={max}
						value={sizeQuantities[size]?.quantity ?? 0}
						onChange={(e) => onChange(size, Math.max(min, Math.min(max, Number(e.target.value))))}
						className={`w-12 rounded border px-2 py-1 text-center transition-all duration-150
                        ${selectedSize === size
								? "w-20 border-2 border-[#8B3958] bg-white shadow-lg ring-2 ring-[#8B3958]"
								: "border-gray-300 bg-gray-50 opacity-60"
							}`}
						disabled={selectedSize !== size}
						onFocus={() => onSelectSize?.(size)}
					/>
				</div>
			))}
		</div>
	);
};

export default React.memo(ProductSizeQuantityInputs);