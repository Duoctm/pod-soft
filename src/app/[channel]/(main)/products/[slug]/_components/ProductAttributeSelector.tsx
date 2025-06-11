import React from "react";
import { groupAndSortColors } from "../utils/soft-color";

type ProductAttributeSelectorProps = {
	name: string;
	values: string[];
	selectedValue: string | null;
	onSelect: (value: string) => void;
	loading?: boolean;
};

const ProductAttributeSelector: React.FC<ProductAttributeSelectorProps> = ({
	name,
	values,
	selectedValue,
	onSelect,
	loading = false,
}) => {
	const isColor = name.toUpperCase() === "COLOR";
	const sortedValues = [...values];

	// Sort non-color values first, then color values
	if (isColor && values.length > 0) {
		const nonColorValues = sortedValues.filter((value) => !value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/));
		const colorValues = sortedValues.filter((value) => value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/));
		const sortedColorValues = groupAndSortColors(colorValues);
		sortedValues.splice(0, sortedValues.length, ...nonColorValues, ...sortedColorValues);
	}

	if (loading) {
		return (
			<div className="my-6 animate-pulse">
				<div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
				<div className="flex flex-wrap gap-2">
					{[...Array(4)].map((_, index) => (
						<div key={index} className="h-9 w-9 rounded-md bg-gray-200"></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="my-6">
			<h2 className="mb-2 text-sm font-semibold">{name}</h2>
			<div className="flex flex-wrap gap-1 md:gap-2">
				{sortedValues
					.filter((value) => value !== null)
					.map((value) => {
						const isSelected = selectedValue === value;
						const colorMatch = value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
						const colorCode = isColor && colorMatch ? colorMatch[0] : null;
						const colorName = value.replace(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "").trim();

						if (isColor) {
							return (
								value && (
									<div className="group relative" key={value}>
										<button
											className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-150
                        ${isSelected
													? "scale-110 border-[#8C3859] shadow-lg ring-2 ring-[#8C3859]"
													: "border-slate-300 hover:scale-105 hover:border-[#8C3859]"
												}`}
											style={{ backgroundColor: colorCode || "#f9fafb" }}
											onClick={() => onSelect(value)}
											title={colorName.replace("-", "")}
										>
											{isSelected && (
												<span className="pointer-events-none absolute select-none text-xl text-white">
													&#10003;
												</span>
											)}
											<span className="sr-only">{colorName}</span>
										</button>
									</div>
								)
							);
						}

						return (
							value && (
								<button
									key={value}
									className={`flex h-8 items-center justify-center rounded-md px-3 text-sm
								transition-all duration-150 
								${isSelected ? "border-slate-300 bg-[#8C3859] text-white" : "border border-slate-200 hover:border-gray-300"}`}
									onClick={() => onSelect(value)}
									title={value.replace("-", "")}
								>
									{value}
								</button>
							)
						);
					})}
			</div>
		</div>
	);
};

export default ProductAttributeSelector;
