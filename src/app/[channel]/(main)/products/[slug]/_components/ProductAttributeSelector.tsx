import React from "react";
import { groupAndSortColors } from "../utils/soft-color";

type ProductAttributeSelectorProps = {
	name: string;
	values: string[];
	selectedValue: string | null;
	onSelect: (value: string) => void;
	loading?: boolean;
};

export const ProductAttributeSelector: React.FC<ProductAttributeSelectorProps> = ({
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
		const nonColorValues = sortedValues.filter(value => !value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/));
		const colorValues = sortedValues.filter(value => value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/));
		const sortedColorValues = groupAndSortColors(colorValues);
		sortedValues.splice(0, sortedValues.length, ...nonColorValues, ...sortedColorValues);
	}

	if (loading) {
		return (
			<div className="my-6 animate-pulse">
				<div className="mb-2 h-5 w-20 bg-gray-200 rounded"></div>
				<div className="flex flex-wrap gap-2">
					{[...Array(4)].map((_, index) => (
						<div
							key={index}
							className="h-9 w-9 bg-gray-200 rounded-md"
						></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="my-6">
			<h2 className="mb-2 text-sm font-semibold">{name}</h2>
			<div className="flex flex-wrap gap-2">
				{sortedValues.filter(value => value !== null).map((value) => {
					const isSelected = selectedValue === value;
					const colorMatch = value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
					const colorCode = isColor && colorMatch ? colorMatch[0] : null;
					const colorName = value.replace(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "").trim();

					if (isColor) {
						return value && (
							<div className="relative group" key={value}>
								<button
									className={`w-8 h-8 rounded-full border-2 transition-all duration-150 
										${isSelected 
											? 'border-slate-700 ring-2 ring-slate-300 ring-offset-2' 
											: 'border-slate-300 hover:border-slate-400'
										}`}
									style={{ backgroundColor: colorCode || "#f9fafb" }}
									onClick={() => onSelect(value)}
									title={colorName} // Add native HTML tooltip
								>
									<span className="sr-only">{colorName}</span>
								</button>
							</div>
						);
					}

					return value && (
						<button
							key={value}
							className={`flex h-8 items-center justify-center rounded-md px-3 text-sm
								transition-all duration-150 
								${isSelected
									? 'bg-[#8C3859] text-white border-slate-300'
									: 'border border-slate-200 hover:border-gray-300'
								}`}
							onClick={() => onSelect(value)}
							title={value}
						>
							{value}
						</button>
					);
				})}
			</div>
		</div>
	);
};
