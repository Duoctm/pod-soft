import React from "react";
import { sortColorsByLuminance } from "../../utils/soft-color";

type ProductAttributeSelectorProps = {
	name: string;
	values: string[];
	selectedValue: string | null;
	onSelect: (value: string) => void;
};

export const ProductAttributeSelector: React.FC<ProductAttributeSelectorProps> = ({
	name,
	values,
	selectedValue,
	onSelect,
}) => {
	const isColor = name.toUpperCase() === "COLOR";
	if (isColor && values.length > 0) {
		const newColor = [...values];
		values = sortColorsByLuminance(newColor);
	}
	return (
		<div className="my-6">
			<h2 className="mb-2 text-sm font-semibold">{name}</h2>
			<div className="flex flex-wrap gap-2">
				{values.map((value) => {
					const isSelected = selectedValue === value;

					const colorMatch = value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
					const colorCode = isColor && colorMatch ? colorMatch[0] : null;

					const baseClasses =
						"flex h-9 max-w-[2.5rem] items-center justify-center rounded-md border px-3 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 text-black";
					const colorStyle = isColor ? { backgroundColor: colorCode || "#f9fafb" } : {};
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
