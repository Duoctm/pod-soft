"use client";

import edjsHTML from "editorjs-html";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";

import xss from "xss";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { addItem } from "./checkout";
import { getProductDetails } from "./getProductDetails";

import { NavigationButton } from "./_components/NavigationButton";
import { ThumbnailGallery } from "./_components/ThumbnailGallery";
import { ProductTitle } from "./_components/ProductTitle";
import { ProductDescription } from "./_components/ProductDescription";
import { ProductAttributeSelector } from "./_components/ProductAttributeSelector";
import { Loader } from "@/ui/atoms/Loader";
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

interface BlockProps{
	id: string;
	type: string;
	data: {
		text: string;
	};

}


interface BlocksProps{
	timne: number;
	version: string;
	blocks: BlockProps[];
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
	const [quantity, _setQuantity] = useState(1);
	const [selectColorAttributeValueId, setSelectColorAttributeValueId] = useState<string | null>(null);
	const attributeValueIds = useRef<Map<string, string>>(new Map());
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
				setSelectColorAttributeValueId(defaultVariant?.attributes[0].values[0].id ?? null)

				const optionValue: { [key: string]: string } = {};
				defaultVariant?.attributes.sort(commpareFunc).map((attr) => {
					const key = attr.attribute.name.toUpperCase();
					const value = attr.values.map((v) => v.name).join("");
					optionValue[key] = value;
					//atrrubuteValueIds.current.set(value, attr.values[0].id)
				});
				setOptions(() => optionValue);
			} catch (err: any) {
				setError(err instanceof Error ? err : new Error("An unknown error occurred fetching product data"));
			} finally {
				setLoading(false);
			}
		};
		void fetchData();
	}, [channel, slug]);

	if (error) {
		console.error("Error fetching product data:", error);
	}

	const descriptionHtml = useMemo(() => {
		if (!productData?.product?.description) return null;
		try {
			const newData = productData?.product?.description;
			const parsedData = JSON.parse(newData) as BlocksProps;

			parsedData.blocks.map((block: { data: { text: string } }) => {
				const removeText = block.data.text.split("\n")[0];
				block.data.text = removeText;
			});

			console.log(parsedData);
			return parser.parse(parsedData);
		} catch (parseError) {
			console.error("Error parsing product description:", parseError);
			return [xss(productData?.product.description)];
		}
	}, [productData?.product?.description]);

	const features = useMemo(() => {
		if (!productData?.product?.description) return null;
		try {
			const newData = productData?.product?.description;
			const parsedData = JSON.parse(newData) as BlocksProps;

			parsedData.blocks.map((block: { data: { text: string } }) => {
				const removeText = block.data.text.split("\n")[3];
				block.data.text = removeText;
			});

			console.log(parsedData);
			return parser.parse(parsedData);
		} catch (parseError) {
			console.error("Error parsing product description:", parseError);
			return [xss(productData?.product.description)];
		}
	}, [productData?.product?.description])


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
				if (key == "COLOR"){
					values.forEach((v) => attributeValueIds.current.set(v.name, v.id));
				}
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
		<div className="flex min-h-screen flex-col items-center py-8 font-sans">
			<ToastContainer position="top-center" />
			<div className="relative flex w-[95%] max-w-7xl flex-col gap-8 rounded-lg p-4 md:flex-row md:p-8">
				{/* Image Section */}
				<div className="w-full md:w-1/2 lg:w-3/5">
					<div className="group relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-lg bg-white">
						{currentImages.length > 0 ? (
							<div className="relative h-full transition-transform duration-300 hover:scale-110">
								<Image
									width={1440}
									height={1440}
									src={currentImages[currentImageIndex]?.url}
									alt={currentImages[currentImageIndex]?.alt ?? productData?.product?.name}
									className="h-full w-full object-contain"
									quality={100}
								/>
								<div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-10" />
							</div>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500">
								No Image Available
							</div>
						)}
						{currentImages.length > 1 && (
							<>
								<NavigationButton direction="prev" onClick={handlePrev} />
								<NavigationButton direction="next" onClick={handleNext} />
							</>
						)}
					</div>
					{/* Enhanced Thumbnail Gallery */}
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<ThumbnailGallery
							images={currentImages}
							currentIndex={currentImageIndex}
							onThumbnailClick={handleThumbnailClick}
						/>
					</div>
					<div className="w-full">
				<ProductDescription descriptionHtml={descriptionHtml}  title="Descriptions"/>
			</div>
				</div>

				{/* Product Details Section */}
				<div className="relative flex w-full flex-col rounded-lg px-4 md:w-1/2 md:px-6 lg:w-2/5">
					<div className="mb-24 flex-grow space-y-6">
						<ProductTitle name={productData?.product?.name} />
						<ProductDescription descriptionHtml={features} />

						{/* Interactive Product Options */}
						<div className="space-y-4">
							{optionList.map((option) => (
								<ProductAttributeSelector
									key={option.name}
									name={option.name}
									values={option.values}
									selectedValue={opstions[option.name]}
									onSelect={(value) => {
										
										setSelectColorAttributeValueId(attributeValueIds.current.get(value)|| null);
										return handleAttributeSelect(option.name, value);
									}}
								/>
							))}
						</div>

						{/* Size Selector with Quantity */}
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
							{sizeValues.map((size, index) => {
								const isSelected = opstions["SIZE"] === size;
								const baseClasses =
									"relative flex  w-full flex-col items-center justify-evenly rounded-lg border p-1 transition-all duration-200 hover:shadow-sm";
								const stateClasses = isSelected
									? "border-[4px] border-slate-600 bg-white shadow-md"
									: "border border-gray-200 bg-gray-50 opacity-60";
								return (
									<div
										key={index}
										className={`${baseClasses} ${stateClasses}`}
										aria-selected={isSelected}
										aria-disabled={!isSelected}
										role="option"
									>
										<div className="flex w-full justify-center">
											<input
												type="number"
												disabled={!isSelected}
												value={sizeQuantities[size] ?? 0}
												onChange={(e) => updateSizeQuantity(size, parseInt(e.target.value) || 0)}
												max={quantityLimitPerCustomer}
												min="0"
												className="w-[65px] appearance-none rounded-md border border-gray-200 px-2 py-1 text-center text-sm transition-all duration-200 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FD8C6E] focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
												aria-label={`Quantity for size ${size}`}
												tabIndex={isSelected ? 0 : -1}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="absolute bottom-4 right-4 flex items-center gap-4">
						<button
							className="transform rounded-lg bg-white px-6 py-3 text-base font-semibold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FD8C6E] focus:ring-offset-2 disabled:opacity-50"
							disabled={
								!Object.entries(sizeQuantities).some(([size, quantity]) => quantity > 0 && variantIds[size])
							}
							onClick={async () => {
								const itemsToAdd = getVariantsToAdd(variantIds, sizeQuantities);
								itemsToAdd.forEach(async ({ variantId, quantity }) => {
									const errorNotification = (message: string) => {
										toast.error(message);
										setTimeout(function () {
											window.location.href = `/${channel}/login`;
										}, 2000);
									};
									if (quantity > quantityLimitPerCustomer) {
										toast.error("Quantity exceeds available limit");
										return;
									}
									const result = await addItem(params, variantId, quantity);
									if (result?.error) {
										errorNotification(`Please log in to place an order.`);
										return;
									}
									toast.success("Product added to cart");
								});
							}}
						>
							Add to Cart
						</button>
						<Link href={`/${channel}/design/1/${productData?.product?.id}/${selectColorAttributeValueId}`}>
							<button
								className="transform rounded-lg bg-slate-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-[#8C3859] focus:ring-offset-2 disabled:opacity-50"
								onClick={() => {
									localStorage.setItem(
										"cart",
										JSON.stringify({
											params: params,
											selectedVariantId: selectedVariantId,
											quantity: quantity,
										}),
									);
								}}
							>
								Customize Design
							</button>
						</Link>
					</div>
				</div>

			</div>
		</div>
	);
}
