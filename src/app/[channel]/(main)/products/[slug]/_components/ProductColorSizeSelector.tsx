import React, { useMemo, useState, useEffect, useRef } from "react";
import { ProductVariant } from "@/gql/graphql";
import ProductAttributeSelector from "./ProductAttributeSelector";

type Props = {
	variants: ProductVariant[];
	loading?: boolean;
	onChange?: (
		selected: { color: string | null; size: string | null },
		variantId: string | null,
		sizeList: string[],
		colorAttributeValueId?: string,
		variant?: ProductVariant | null
	) => void;
	defaultVariant?: ProductVariant | null;
};

const ProductColorSizeSelector: React.FC<Props> = ({
	variants,
	loading,
	onChange,
	defaultVariant,
}) => {
	const variantMap = useMemo(() => {
		const map = new Map<string, ProductVariant>();
		variants.forEach((variant) => {
			const color = variant.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
			const size = variant.attributes.find((a) => a.attribute.name?.toUpperCase() === "SIZE")?.values[0]?.name;
			if (color && size) {
				map.set(`${color}-${size}`, variant);
			}
		});
		return map;
	}, [variants]);

	const colorList = useMemo(() => {
		const set = new Set<string>();
		variants.forEach((v) => {
			const color = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
			if (color) set.add(color);
		});
		return Array.from(set);
	}, [variants]);

	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [selectedSize, setSelectedSize] = useState<string | null>(null);

	// Chỉ set mặc định 1 lần khi mount hoặc khi defaultVariant thực sự thay đổi
	const didSetDefault = useRef(false);
	useEffect(() => {
		if (defaultVariant && !didSetDefault.current) {
			const color = defaultVariant.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
			const size = defaultVariant.attributes.find((a) => a.attribute.name?.toUpperCase() === "SIZE")?.values[0]?.name;
			if (color && colorList.includes(color)) setSelectedColor(color);
			if (size) setSelectedSize(size);
			didSetDefault.current = true;
		} else if (colorList.length > 0 && !selectedColor) {
			setSelectedColor(colorList[0]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultVariant, colorList]);

	const sizeList = useMemo(() => {
		if (!selectedColor) return [];
		const set = new Set<string>();
		variants.forEach((v) => {
			const color = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
			const size = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "SIZE")?.values[0]?.name;
			if (color === selectedColor && size) set.add(size);
		});
		return Array.from(set);
	}, [variants, selectedColor]);

	const selectedVariant = useMemo(() => {
		if (!selectedColor || !selectedSize) return null;
		return variantMap.get(`${selectedColor}-${selectedSize}`) || null;
	}, [selectedColor, selectedSize, variantMap]);

	const selectedVariantId = selectedVariant?.id || null;

	const selectedColorAttributeValueId = useMemo(() => {
		if (!selectedColor) return undefined;
		const variant = variants.find(v => {
			const color = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
			return color === selectedColor;
		});
		return variant?.attributes.find(a => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.id;
	}, [selectedColor, variants]);

	// Gọi onChange khi lựa chọn thay đổi
	useEffect(() => {
		onChange?.(
			{ color: selectedColor, size: selectedSize },
			selectedVariantId,
			sizeList,
			selectedColorAttributeValueId,
			selectedVariant
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		selectedColor,
		selectedSize,
		selectedVariantId,
		sizeList,
		selectedColorAttributeValueId,
		selectedVariant,
	]);

	return (
		<div>
			<ProductAttributeSelector
				name="COLOR"
				values={colorList}
				selectedValue={selectedColor}
				onSelect={(color) => setSelectedColor(color)}
				loading={loading}
			/>
			{selectedColor && (
				<ProductAttributeSelector
					name="SIZE"
					values={sizeList}
					selectedValue={selectedSize}
					onSelect={(size) => setSelectedSize(size)}
					loading={loading}
				/>
			)}
		</div>
	);
};

export default ProductColorSizeSelector;