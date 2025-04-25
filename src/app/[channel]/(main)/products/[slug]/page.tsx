"use client";

import edjsHTML from "editorjs-html";
import React, { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";

import { Loader } from "@/ui/atoms/Loader";
import { addItem } from "./checkout";
import { getProductDetails } from "./getProductDetails";
import { NavigationButton } from "./_components/NavigationButton";
import { ThumbnailGallery } from "./_components/ThumbnailGallery";
import { ProductTitle } from "./_components/ProductTitle";
import { ProductDescription } from "./_components/ProductDescription";
import { ProductAttributeSelector } from "./_components/ProductAttributeSelector";
import xss from "xss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Initialize the parser once
const parser = edjsHTML();

//  Define interfaces for the data returned from the API
interface Money {
	currency: string;
	amount: number;
}
interface Media {
	id: string;
	alt: string;
	url: string;
}
interface Thumbnail {
	alt: string;
	url: string;
}
interface Price {
	gross: Money;
}
interface PriceRange {
	start: Money | null;
	stop: Money | null;
}
interface VariantPricing {
	price: Price | null;
}
interface ProductPricing {
	priceRange: PriceRange | null;
}
interface AttributeValue {
	id: string;
	name: string;
}
interface AttributeRef {
	id: string;
	name: string;
}
interface Attribute {
	attribute: AttributeRef;
	values: AttributeValue[];
}
interface ProductVariant {
	id: string;
	sku: string | null;
	name: string;
	media: Media[];
	quantityAvailable: number;
	pricing: VariantPricing | null;
	attributes: Attribute[];
	quantityLimitPerCustomer: number | null;
}
interface ProductDetails {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	defaultVariant: ProductVariant | null;
	seoTitle: string | null;
	seoDescription: string | null;
	variants: ProductVariant[] | null;
	thumbnail: Thumbnail | null;
	pricing: ProductPricing | null;
}
interface GetProductDetailsQueryResult {
	product: ProductDetails | null;
}
interface ProductDetailsState extends GetProductDetailsQueryResult {
	seachKey: { [key: string]: string };
}

interface PageProps {
	params: {
		slug: string;
		channel: string;
	};
}

const getSearchKey = (attributes: Attribute[]): string => {
	return [...attributes]
		.sort((a, b) => a.attribute.name.localeCompare(b.attribute.name))
		.map((attr) => attr.values.map((v) => v.name).join(""))
		.join("_");
};

function getVariantsToAdd(
	variantIds: { [size: string]: string },
	sizeQuantities: { [size: string]: number },
): { variantId: string; quantity: number }[] {
	return Object.entries(sizeQuantities)
		.filter(([_, quantity]) => quantity > 0)
		.map(([size, quantity]) => ({
			variantId: variantIds[size],
			quantity,
		}))
		.filter((item) => !!item.variantId); // Bỏ các item không có variantId
}

export default function Page({ params }: PageProps) {
	const { slug, channel } = params;

	const [productData, setProductData] = useState<ProductDetailsState | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [opstions, setOptions] = useState<{ [key: string]: string }>({});
	const [quantity, setQuantity] = useState(1);
	const [sizeQuantities, setSizeQuantities] = useState<{ [size: string]: number }>({});
	const [variantIds, setVariantIds] = useState<{ [size: string]: string }>({});
	const sizeValues = Array.from(
		new Set(
			productData?.product?.variants?.flatMap((variant) =>
				variant.attributes
					.filter((attr) => attr.attribute.name.toLowerCase() === "size")
					.flatMap((attr) => attr.values.map((v) => v.name)),
			),
		),
	);

	const commpareFunc = (attr1: Attribute, attr2: Attribute) => {
		const name1 = attr1.attribute.name.toLowerCase();
		const name2 = attr2.attribute.name.toLowerCase();
		return name1.localeCompare(name2);
	};

	const updateSizeQuantity = (size: string, quantity: number) => {
		setSizeQuantities((prev) => ({
			...prev,
			[size]: quantity,
		}));
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await getProductDetails(slug, channel);

				if (!data.product) {
					notFound();
				}

				const searchKey: { [key: string]: string } = {};
				const variants = data.product?.variants;

				variants?.forEach((variant) => {
					const variantId = variant.id;
					const value = getSearchKey(variant.attributes as Attribute[]);
					searchKey[value] = variantId;
				});

				setProductData({
					product: data.product as ProductDetails,
					seachKey: searchKey,
				});

				let defaultVariant: ProductVariant | null = null;
				if (data.product?.defaultVariant) {
					defaultVariant = data.product.defaultVariant as ProductVariant;
				} else if (data.product?.variants && data.product.variants.length > 0) {
					defaultVariant = data.product.variants[0] as ProductVariant;
				}
				setSelectedVariantId(() => defaultVariant?.id || null);
				const optionValue: { [key: string]: string } = {};
				defaultVariant?.attributes.sort(commpareFunc).map((attr) => {
					const key = attr.attribute.name.toUpperCase();
					const value = attr.values.map((v) => v.name).join("");
					optionValue[key] = value;
				});
				setOptions(() => optionValue);
			} catch (err: any) {
				setError(err instanceof Error ? err : new Error("An unknown error occurred fetching product data"));
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [channel, slug]);

	if (error) {
		console.error("Error fetching product data:", error);
	}

	const descriptionHtml = useMemo(() => {
		if (!productData?.product?.description) return null;
		try {
			const parsedData = JSON.parse(productData?.product.description);
			return parser.parse(parsedData);
		} catch (parseError) {
			console.error("Error parsing product description:", parseError);
			return [xss(productData?.product.description)];
		}
	}, [productData?.product?.description]);

	const selectedVariant = useMemo(() => {
		if (!productData?.product?.variants || !selectedVariantId) {
			return null;
		}
		return productData?.product.variants.find((v) => v.id === selectedVariantId);
	}, [productData?.product?.variants, selectedVariantId]);

	const quantityLimitPerCustomer = useMemo(() => {
		return selectedVariant?.quantityLimitPerCustomer || 5000;
	}, [selectedVariant]);

	const currentImages: Media[] = useMemo(() => {
		if (selectedVariant?.media && selectedVariant.media.length > 0) {
			return selectedVariant.media;
		}
		if (productData?.product?.thumbnail) {
			return [
				{
					id: `thumbnail-${productData?.product.id}`,
					url: productData?.product.thumbnail.url,
					alt: productData?.product.thumbnail.alt,
				},
			];
		}
		return [];
	}, [selectedVariant, productData?.product?.thumbnail, productData?.product?.id]);

	useEffect(() => {
		setCurrentImageIndex(0);
	}, [selectedVariantId]);

	const handleThumbnailClick = (index: number) => {
		setCurrentImageIndex(index);
	};

	const handleAttributeSelect = (attributeName: string, attributeValue: string) => {
		setOptions((prev) => ({
			...prev,
			[attributeName]: attributeValue,
		}));
	};

	const extractAttributes = (variants: ProductVariant[]): { name: string; values: string[] }[] => {
		const map = new Map<string, Set<string>>();

		variants.forEach((variant) => {
			variant.attributes.forEach(({ attribute, values }) => {
				const key = attribute.name.toUpperCase();
				if (!map.has(key)) map.set(key, new Set());
				values.forEach((v) => map.get(key)?.add(v.name));
			});
		});

		return Array.from(map.entries()).map(([name, valueSet]) => ({
			name,
			values: Array.from(valueSet.values()),
		}));
	};

	const optionList = useMemo(() => {
		return extractAttributes(productData?.product?.variants || []);
	}, [productData?.product?.variants]);

	useEffect(() => {
		const searchKeyList: string[] = [];
		optionList.forEach((option) => {
			searchKeyList.push(opstions[option.name]);
		});
		const searchKey = searchKeyList.join("_");

		setVariantIds((prev) => {
			const updated = {
				...prev,
				[searchKey.split("_")[1]]: productData?.seachKey[searchKey] ?? "",
			};

			// Xóa key 'undefined' nếu tồn tại
			const { undefined: _omit, ...rest } = updated;
			return rest;
		});

		setSelectedVariantId((prev) => {
			return productData?.seachKey[searchKey] || prev;
		});
	}, [opstions, optionList, productData?.seachKey]);

	const handlePrev = () => {
		if (currentImages.length === 0) return;
		setCurrentImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
	};

	const handleNext = () => {
		if (currentImages.length === 0) return;
		setCurrentImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center bg-[#f6ede8] py-8">
			<ToastContainer position="top-center" />
			<div className="relative flex w-[90%] max-w-6xl flex-col gap-8 bg-[#f6ede8] p-4 md:flex-row md:p-8">
				{/* Image Section */}
				<div className="w-full md:w-1/2 lg:w-3/5">
					<div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-lg bg-[#f1edfb]">
						{currentImages.length > 0 ? (
							<Image
								width={1080}
								height={1080}
								src={currentImages[currentImageIndex]?.url}
								alt={currentImages[currentImageIndex]?.alt ?? productData?.product?.name}
								className="h-full w-full object-contain"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200 text-gray-500">
								No Image
							</div>
						)}
						{currentImages.length > 1 && (
							<>
								<NavigationButton direction="prev" onClick={handlePrev} />
								<NavigationButton direction="next" onClick={handleNext} />
							</>
						)}
					</div>
					{/* Thumbnail section */}
					<div className="mt-4 flex flex-wrap justify-center gap-2">
						<ThumbnailGallery
							images={currentImages}
							currentIndex={currentImageIndex}
							onThumbnailClick={handleThumbnailClick}
						/>
					</div>
				</div>

				{/* Details Section */}
				<div className="relative flex w-full flex-col rounded-lg bg-[#f6ede8] px-2 text-gray-800 md:w-1/2 md:px-4 lg:w-2/5">
					{/* Content Wrapper */}
					<div className="mb-24 flex-grow">
						<ProductTitle name={productData?.product?.name} />
						<ProductDescription descriptionHtml={descriptionHtml} />

						{optionList.map((option) => {
							return (
								<ProductAttributeSelector
									key={option.name}
									name={option.name}
									values={option.values}
									selectedValue={opstions[option.name]}
									onSelect={(value) => {
										return handleAttributeSelect(option.name, value);
									}}
								/>
							);
						})}
						<div className="flex flex-wrap gap-2">
							{sizeValues.map((size) => {
								const isSelected = opstions["SIZE"] === size;
								const baseClasses =
									"flex h-9 max-w-[2.5rem] items-center justify-center rounded-md border px-3 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 text-black";
								const stateClasses = isSelected
									? "border-blue-500 ring-1 ring-blue ring-offset-2 bg-white"
									: "border-gray-300 hover:border-gray-500 cursor-not-allowed";
								const extraClasses = isSelected ? "ring-offset-2" : "";

								return (
									<input
										disabled={!isSelected}
										value={sizeQuantities[size] ?? 0}
										onChange={(e) => updateSizeQuantity(size, parseInt(e.target.value) || 0)}
										max={quantityLimitPerCustomer}
										className={`${baseClasses} ${stateClasses} ${extraClasses}`}
									/>
								);
							})}
						</div>

						{/* <div className="flex items-center justify-between">
							<QuantityInput
								limit={quantityLimitPerCustomer}
								quantityAvailable={quantityLimitPerCustomer}
								quantity={quantity}
								setQuantity={setQuantity}
							/>
						</div> */}
					</div>
					{/* Action Buttons Container */}
					<div className="absolute bottom-4 right-4 flex items-center justify-end gap-4 rounded">
						<button
							className="rounded-lg bg-[#39377a] px-6 py-3 text-center font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#39377a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={
								!Object.entries(sizeQuantities).some(([size, quantity]) => quantity > 0 && variantIds[size])
							}
							onClick={() => {
								const itemsToAdd = getVariantsToAdd(variantIds, sizeQuantities);
								itemsToAdd.forEach(({ variantId, quantity }) => {
									if (quantity > quantityLimitPerCustomer) {
										toast.error("Quantity exceeds available");
										return;
									}
									console.log(variantId, quantity);

									addItem(params, variantId, quantity);
									toast.success("Product added to cart");
								});
							}}
						>
							Add to Cart
						</button>
						<button className="rounded-lg bg-[#39377a] px-6 py-3 text-center font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#39377a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
							Design
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
