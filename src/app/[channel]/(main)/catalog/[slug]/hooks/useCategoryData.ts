import { useCallback, useEffect, useState } from "react";
import { getAttributes } from "../actions/attributes";
import { getCategory } from "../actions/category";
import type { FilterSidebarProps } from "../types";
import { type Category } from "@/gql/graphql";
export function useCategoryData(slug: string, channel: string) {
	const [attributes, setAttributes] = useState<FilterSidebarProps["attributes"]>();
	const [category, setCategory] = useState<Category | null>(null);

	const fetchAttributes = useCallback(async () => {
		const attrs = await getAttributes();
		setAttributes(attrs);
	}, []);

	const fetchCategory = useCallback(async () => {
		const cat = await getCategory({ slug, channel });
		setCategory(cat as Category);
	}, [slug, channel]);

	useEffect(() => {
		void fetchAttributes();
		void fetchCategory();
	}, [fetchAttributes, fetchCategory]);

	return { attributes, category, setCategory };
}
