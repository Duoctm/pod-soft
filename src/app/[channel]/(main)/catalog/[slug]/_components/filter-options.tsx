import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo } from "react";
import { filterOptions } from "../actions/filter-option";
import { type CategoryType } from "../types";
import { getProductList } from "../../../products/[slug]/actions/getProductList";

interface FilterOptionProps {
	attributeName: string | null;
	isColor: boolean;
	setCategory: React.Dispatch<React.SetStateAction<CategoryType>>;
	setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
	slug: string;
	channel: string;
	paramName: string;
	paramValue: string;
}

export const FilterOption = React.memo(function FilterOption({
	setIsFilterOpen,
	attributeName,
	isColor,
	setCategory,
	slug,
	paramValue: slugValue,
	paramName,
	channel,
}: FilterOptionProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// Derived values
	const color = searchParams.get("color");
	const size = searchParams.get("size");
	const gender = searchParams.get("gender"); 
	const brand = searchParams.get("brand");
	const printTechnology = searchParams.get("print technology");
	const splitAttributeName = isColor && attributeName ? attributeName.split("-")[1] : attributeName;

	const paramValue = isColor
		? slugValue?.toLowerCase().split("-")[0]
		: slugValue?.toLowerCase().includes("gender")
			? slugValue?.toLowerCase()
			: slugValue?.toLowerCase();

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
			if (gender) params.set("gender", gender);
			if (brand) params.set("brand", brand);
			if (printTechnology) params.set("printTechnology", printTechnology);

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
		[color, size, gender, brand, printTechnology],
	);

	// Handle filter logic and update category
	const handleFilterOptions = useCallback(async () => {
		const filterVal = [
			{ slug: "color", values: color?.split(",") },
			{ slug: "size", values: size?.split(",") },
			{ slug: "gender", values: gender?.split(",") },
			{ slug: "brand", values: brand?.split(",") },
			{ slug: "print-technology", values: printTechnology?.split(",") },
		];
		const hasFilter = filterVal.some(
			(filter) => filter.values && filter.values.length > 0 && filter.values[0] !== "",
		);

		if (!hasFilter) {
			const newData = await getProductList({
				first: 10,
				after: null,
				channel: channel,
			});
			setCategory((prev) => {
				return {
					...prev,
					edges: newData?.edges,
				};
			});
		} else {
			const filter = await filterOptions({
				filterAttributes: filterVal,
				channel: channel,
				first: 10,
				after: null,
			});
			setCategory((prev) => {
				return {
					...prev,
					edges: filter.edges || [],
				};
			});
		}
	}, [color, size, gender, brand, printTechnology, slug, channel, setCategory]);

	// Trigger filter logic when filters change
	useEffect(() => {
		void handleFilterOptions();
	}, [color, size, gender, brand, printTechnology, handleFilterOptions]);

	// Handle click on filter option
	const handleClickSelect = useCallback(() => {
		if (paramValue) {
			router.push(`${pathname}?${createQueryString(paramName, paramValue)}`);
		}
		setIsFilterOpen(false);
	}, [router, pathname, createQueryString, paramName, paramValue]);

	return (
		<div
			onClick={handleClickSelect}
			className={`
				flex cursor-pointer items-center
				justify-center transition-all duration-200
				ease-in-out
				hover:scale-105
				${
					isColor
						? "h-10 w-10 rounded-full shadow-md hover:shadow-lg"
						: "px-2 py-2 rounded-md shadow-sm hover:shadow-md"
				}
				${selected ? "border-2 border-black ring-2 ring-gray-200" : "border border-gray-200 hover:border-gray-300"}
			`}
			style={{
				backgroundColor: isColor ? splitAttributeName || undefined : "white",
			}}
		>
			{!isColor && (
				<span
					className={`
					text-sm font-medium
					${selected ? "text-black" : "text-gray-600"}
				`}
				>
					{splitAttributeName}
				</span>
			)}
		</div>
	);
});
