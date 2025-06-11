
import React from "react";
import { type CategoryType } from "../../app/[channel]/(main)/catalog/[slug]/types";
import { cn } from "@/lib/utils";

interface FilterOptionProps {
	attributeName: string | null;
	isSelected: boolean
	isColor: boolean;
	setCategory: React.Dispatch<React.SetStateAction<CategoryType>>;
	setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
	slug: string;
	channel: string;
	paramName: string;
	paramValue: string;
	onSelect: () => void;

}

export const FilterOption = React.memo(function FilterOption({
	attributeName,
	isColor,
	isSelected,
	onSelect
}: FilterOptionProps) {

	const splitAttributeName = isColor && attributeName ? attributeName.split("-")[1] : attributeName;




	return (
		<div
			onClick={onSelect}
			className={cn(
				"text-sm font-medium flex cursor-pointer items-center justify-center transition-all duration-200 ease-in-out hover:bg-[#8C3859] hover:text-white",
				isColor
					? "w-10 h-10 border-2 rounded-full shadow-md hover:shadow-lg"
					: "min-w-14 px-2 py-2 rounded-md shadow-sm hover:shadow-md",
				isSelected
					? " ring-gray-200 !bg-[#8C3859] !text-white"
					: "border-2 border-gray-200 hover:border-gray-300"
			)}
			style={{
				backgroundColor: isColor ? splitAttributeName || undefined : "",
			}}
		>
			{!isColor && (
				<span
				>
					{splitAttributeName}
				</span>
			)}
		</div>
	);
});
