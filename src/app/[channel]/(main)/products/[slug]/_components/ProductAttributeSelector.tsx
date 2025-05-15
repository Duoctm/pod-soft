import React from "react";
import { sortColorsByLuminance } from "../utils/soft-color";

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
		const sortedColorValues = sortColorsByLuminance(colorValues);
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
				{sortedValues.map((value) => {
					const isSelected = selectedValue === value;

					const colorMatch = value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
					const colorCode = isColor && colorMatch ? colorMatch[0] : null;

					const baseClasses =
						"flex h-9 max-w-[2.5rem] items-center justify-center rounded-md border px-3 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 text-black";
					const colorStyle = isColor ? { backgroundColor: colorCode || "#f9fafb", borderRadius: "100%" } : {};
					const stateClasses = isSelected
						? "border-black ring-1 ring-black ring-offset-1"
						: "border-gray-300 hover:border-gray-500";
					const extraClasses = isColor ? `w-9 p-0 ${isSelected ? "ring-offset-2" : ""}` : "";

					return (
						<button
							key={value}
							className={`${baseClasses} ${stateClasses} ${extraClasses}`}
							style={colorStyle}
							onClick={() => onSelect(value)}
							title={value}
						>
							{isColor ? null : value}
							{isColor && (
								<span className="sr-only">
									{value.replace(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "").trim()}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
};
