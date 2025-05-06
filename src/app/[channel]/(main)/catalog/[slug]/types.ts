import { type getAttributes } from "./actions/attributes";
import type { Category, Attribute } from "@/gql/graphql";

export type CategoryType = Category;
export type AttributesType = Attribute[];

export interface FilterSidebarProps {
    slug: string;
    attributes: Awaited<ReturnType<typeof getAttributes>>;
    category: CategoryType | null;
    setCategory: React.Dispatch<React.SetStateAction<CategoryType | null>>;
    channel: string;
}

export interface FilterAttribute {
    slug: string;
    values: string[];
}

export interface Filters {
    attributes: FilterAttribute[];
}

export interface ProductNode {
    id: string;
    name: string;
    slug: string;
    thumbnail?: {
        url: string;
        alt?: string | null;
    } | null;
}

export interface ProductEdge {
    node: ProductNode;
} 