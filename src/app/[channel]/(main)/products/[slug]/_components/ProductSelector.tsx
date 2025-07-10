import React, { useMemo, useState, useEffect, useRef } from "react";
import ProductAttributeSelector from "./ProductAttributeSelector";
import { type ProductVariant } from "@/gql/graphql";

type Props = {
    variants: ProductVariant[];
    loading?: boolean;
    onChange?: (
        selected: { color: string | null; size: string | null, colorId: string | null }, // thêm trường colorId
        variantId: string | null,
        sizeList: string[],
        selectedPrintTech: string | null,
        colorAttributeValueId?: string,
        variant?: ProductVariant | null
    ) => void;
    defaultVariant?: ProductVariant | null;
    setShowDesignButton: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProductSelector: React.FC<Props> = ({
    variants,
    loading,
    onChange,
    defaultVariant,
    setShowDesignButton
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
    const [selectedPrintTech, setSelectedPrintTech] = useState<string | null>("NONE");

    // Chỉ set mặc định 1 lần khi mount hoặc khi defaultVariant thực sự thay đổi
    const didSetDefault = useRef(false);
    // Set giá trị mặc định từ defaultVariant
    useEffect(() => {
        if (defaultVariant && !didSetDefault.current) {
            const color = defaultVariant.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
            const size = defaultVariant.attributes.find((a) => a.attribute.name?.toUpperCase() === "SIZE")?.values[0]?.name;
            // const printTech = defaultVariant.attributes.find((a) => a.attribute.name?.toUpperCase() === "PRINT TECHNOLOGY")?.values[0]?.name;



            if (color) setSelectedColor(color);
            if (size) setSelectedSize(size);


            didSetDefault.current = true;
        }
    }, [defaultVariant]);

    // Set giá trị mặc định nếu chưa chọn (không có defaultVariant)
    useEffect(() => {
        if (!selectedColor && colorList.length > 0) {
            setSelectedColor(colorList[0]);
        }
    }, [colorList, selectedColor]);

    useEffect(() => {

        if (selectedPrintTech != "NONE" && selectedPrintTech) {
            localStorage.setItem("printTechOfDesign", selectedPrintTech)
            setShowDesignButton(true);
        }
        else {
            setShowDesignButton(false);
        }
    }, [selectedPrintTech, setShowDesignButton])

    console.log(variants, "🚀 ProductSelector.tsx:66 - variants:");

    const printTechList = useMemo(() => {
        if (!selectedColor || !selectedSize) return [];
        const techSet = new Set<string>();
        variants
            .filter((v) => {
                const color = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
                const size = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "SIZE")?.values[0]?.name;
                return color === selectedColor && size === selectedSize;
            })
            .forEach((v) => {
                const techAttr = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "PRINT TECHNOLOGY");
                techAttr?.values.forEach((val) => {
                    if (val?.name && val.name !== "EMB" && val.name !== "SIKK") techSet.add(val.name);
                });
            });
        const arr = Array.from(techSet);
        arr.sort((a, b) => (a === "NONE" ? -1 : b === "NONE" ? 1 : 0));
        return arr;
    }, [variants, selectedColor, selectedSize]);


    // Lấy danh sách size dựa vào selectedColor
    const sizeList = useMemo(() => {
        if (!selectedColor) return [];
        return variants
            .filter((v) => {
                const color = v.attributes.find((a) => a.attribute.name?.toUpperCase() === "COLOR")?.values[0]?.name;
                return color === selectedColor;
            })
            .map((v) => v.attributes.find((a) => a.attribute.name?.toUpperCase() === "SIZE")?.values[0]?.name)
            .filter((size): size is string => !!size);
    }, [variants, selectedColor]);

    // Nếu selectedSize không còn nằm trong sizeList thì reset lại
    useEffect(() => {
        if (selectedSize && !sizeList.includes(selectedSize)) {
            setSelectedSize(sizeList[0] ?? null);
        }
    }, [sizeList, selectedSize]);

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
        console.log('🔄 ProductSelector onChange triggered:', {
            selectedColor,
            selectedSize,
            selectedPrintTech,
            selectedVariantId,
            hasAllRequiredData: !!(selectedColor && selectedSize && selectedPrintTech)
        });

        onChange?.(
            {
                color: selectedColor,
                size: selectedSize,
                colorId: selectedColorAttributeValueId ?? null // thêm trường colorId
            },
            selectedVariantId,
            sizeList,
            selectedPrintTech,
            selectedColorAttributeValueId,
            selectedVariant
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedColor,
        selectedSize,
        selectedPrintTech, // Ensure printing technology changes trigger immediately
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

            {printTechList.length > 0 && (
                <ProductAttributeSelector
                    name="PRINT TECHNOLOGY"
                    values={printTechList}
                    selectedValue={selectedPrintTech}
                    onSelect={(printTech) => setSelectedPrintTech(printTech)}
                    loading={loading}
                />
            )}

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

// eslint-disable-next-line import/no-default-export
export default ProductSelector;
