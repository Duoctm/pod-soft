import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo } from "react";
import { filterOptions } from "../actions/filter-option";
import { type CategoryType } from "../types";
import { getCategory } from "../actions/category";

interface FilterOptionProps {
	attributeName: string | null;
	isColor: boolean;
	setCategory: React.Dispatch<React.SetStateAction<CategoryType | any>>;
	slug: string;
	channel: string;
}

export const FilterOption = React.memo(function FilterOption({
	attributeName,
	isColor,
	setCategory,
	slug,
	channel,
}: FilterOptionProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// Derived values
	const color = searchParams.get("color");
	const size = searchParams.get("size");
	const splitAttributeName = isColor && attributeName ? attributeName.split("-")[1] : attributeName;
	const paramName = isColor ? "color" : "size";
	const paramValue = isColor
		? attributeName?.toLowerCase().split("-")[0]
		: attributeName?.toLowerCase();

	// Check if this option is selected
	const selected = useMemo(() => {
		const currentValue = searchParams.get(paramName);
		return currentValue ? currentValue.split(",").includes(paramValue || "") : false;
	}, [searchParams, paramName, paramValue]);

	// Build query string for router.push
	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams();
			if (color) params.set("color", color);
			if (size) params.set("size", size);

			const currentValue = params.get(name);
			if (currentValue) {
				const values = currentValue.split(",");
				if (!values.includes(value)) {
					values.push(value);
					params.set(name, values.join(","));
				} else {
					const filteredValues = values.filter((v) => v !== value);
					if (filteredValues.length > 0) {
						params.set(name, filteredValues.join(","));
					} else {
						params.delete(name);
					}
				}
			} else {
				params.set(name, value);
			}
			return params.toString();
		},
		[color, size]
	);

	// Handle filter logic and update category
	const handleFilterOptions = useCallback(async () => {
		const filterVal = [
			{ slug: "color", values: color?.split(",") },
			{ slug: "size", values: size?.split(",") },
		];
		const hasFilter = filterVal.some((filter) => filter.values && filter.values.length > 0 && filter.values[0] !== "");

		if (!hasFilter) {
			const categoryData = await getCategory({ slug, channel });
			setCategory(categoryData as CategoryType);
		} else {
			const filter = await filterOptions({
				filterAttributes: filterVal,
				channel: "default-channel",
			});
			setCategory((prev: any) => ({
				...prev,
				products: filter,
			}));
		}
	}, [color, size, slug, channel, setCategory]);

	// Trigger filter logic when color/size changes
	useEffect(() => {
		void handleFilterOptions();
	}, [color, size, handleFilterOptions]);

	// Handle click on filter option
	const handleClickSelect = useCallback(() => {
		if (paramValue) {
			router.push(`${pathname}?${createQueryString(paramName, paramValue)}`);
		}
	}, [router, pathname, createQueryString, paramName, paramValue]);

	return (
		<div
			onClick={handleClickSelect}
			className={`
				flex items-center justify-center
				transition-all duration-200 ease-in-out
				cursor-pointer
				hover:scale-105
				${isColor 
					? "h-10 w-10 rounded-full shadow-md hover:shadow-lg" 
					: "h-10 w-20 rounded-2xl shadow-sm hover:shadow-md"
				}
				${selected 
					? "border-2 border-black ring-2 ring-gray-200" 
					: "border border-gray-200 hover:border-gray-300"
				}
			`}
			style={{
				backgroundColor: isColor ? splitAttributeName || undefined : "white",
			}}
		>
			{!isColor && (
				<span className={`
					text-sm font-medium
					${selected ? "text-black" : "text-gray-600"}
				`}>
					{splitAttributeName}
				</span>
			)}
		</div>
	);
});
