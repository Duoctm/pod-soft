"use client";

import edjsHTML from "editorjs-html";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";

import xss from "xss";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { getProductDetails } from "./actions/getProductDetails";
import { addCart } from "./actions/addCart";

import { NavigationButton } from "./_components/NavigationButton";
import { ThumbnailGallery } from "./_components/ThumbnailGallery";
import { ProductTitle } from "./_components/ProductTitle";
import { ProductDescription } from "./_components/ProductDescription";
import { ProductAttributeSelector } from "./_components/ProductAttributeSelector";
// import {Breadcrumb} from "./Breadcrumb"
import { Loader } from "@/ui/atoms/Loader";
// import { useBreadcrumb } from "@/ui/components/BreadcrumbProvider";
import "react-toastify/dist/ReactToastify.css";
import { formatMoney } from "@/lib/utils";

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
interface Category {
	id: string;
	name: string;
	slug: string;
}
interface ProductDetails {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	category: Category;
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

interface BlockProps {
	id: string;
	type: string;
	data: {
		text: string;
	};
}

interface BlocksProps {
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
	// const { setBreadcrumb } = useBreadcrumb();
	const { slug, channel } = params;
	// const [productSlug, setProductSlug] = useState<string | null>(null);
	// const [productName, setProductName] = useState<string | null>(null);
	// const [catalogSlug, setCatalogSlug] = useState<string | null>(null);
	// const [catalogName, setCatalogName] = useState<string | null>(null);

	const [productData, setProductData] = useState<ProductDetailsState | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [opstions, setOptions] = useState<{ [key: string]: string }>({});
	const [quantity, _setQuantity] = useState(1);
	const [selectColorAttributeValueId, setSelectColorAttributeValueId] = useState<string | null>(null);
	const attributeValueIds = useRef<Map<string, string>>(new Map());
	const attributeValueIdMetadata = useRef<Set<string>>(new Set());
	const [sizeQuantities, setSizeQuantities] = useState<{ [size: string]: number }>({});
	const [variantIds, setVariantIds] = useState<{ [size: string]: string }>({});
	const [isCustomDesign, setIsCustomDesign] = useState<boolean>(true);
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

	const updateSizeQuantity = (sizeOfSelect: string, quantity: number) => {
		// for (const [size, variantId] of Object.entries(variantIds)) {
		for (const [size] of Object.entries(variantIds)) {
			if (size != sizeOfSelect) {
				setSizeQuantities((prev) => ({
					...prev,
					[size]: 0,
				}));
			}
		}
		setSizeQuantities((prev) => ({
			...prev,
			[sizeOfSelect]: quantity,
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
				// const newData = data.product as ProductDetails;
				// setCatalogSlug(newData.category.slug);
				// setCatalogName(newData.category.name);
				// setProductSlug(newData.slug);
				// setProductName(newData.name);

				if (data.product.variants != null) {
					for (const item of data.product.variants) {
						const variant = item as typeof item & { metadata?: { key: string; value: string }[] };

						if (!variant.metadata || variant.metadata.length === 0) continue;

						const customJsonEntry = variant.metadata.find((i) => i.key === "custom_json");
						if (!customJsonEntry) continue;

						attributeValueIdMetadata.current.add(variant.attributes[0].values[0].id);
					}
				}

				const searchKey: { [key: string]: string } = {};
				const variants = data.product?.variants;

				variants?.forEach((variant) => {
					const variantId = variant.id;

					const attribute_standarn = [];
					for (const attr of variant.attributes) {
						if (attr.attribute.name == "COLOR" || attr.attribute.name == "SIZE") {
							attribute_standarn.push(attr);
						}
					}
					// const value = getSearchKey(variant.attributes as Attribute[]);
					const value = getSearchKey(attribute_standarn as Attribute[]);
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

				if (defaultVariant?.attributes != null) {
					for (const atr of defaultVariant?.attributes) {
						if (atr.attribute.name == "SIZE") {
							updateSizeQuantity(atr.values[0].name, 1);
							break;
						}
					}
				}

				//updateSizeQuantity(defaultVariant?.attributes[1].values[0].name, 1);
				//updateSizeQuantity(defaultVariant.)
				setSelectedVariantId(() => defaultVariant?.id || null);
				setSelectColorAttributeValueId(defaultVariant?.attributes[0].values[0].id ?? null);
				if (
					defaultVariant?.attributes[0].values[0].id != null &&
					attributeValueIdMetadata.current.has(defaultVariant?.attributes[0].values[0].id)
				) {
					setIsCustomDesign(true);
				} else {
					setIsCustomDesign(false);
				}

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

	// useEffect(() => {
	// 	if (productName != null && productSlug != null && catalogSlug != null && catalogName != null) {
	// 		setBreadcrumb(
	// 			<Breadcrumb channel={channel} catalogName={catalogName} catalogSlug={catalogSlug} productName={productName} productSlug={productSlug} />
	// 		);
	// 	}
	// 	return () => setBreadcrumb(null);
	// }, [setBreadcrumb, channel, catalogName, catalogSlug, productName, productSlug]);

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

			// console.log(parsedData);
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

			// console.log(parsedData);
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
				if (key == "COLOR") {
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
			if (option.name == "COLOR" || option.name == "SIZE") {
				searchKeyList.push(opstions[option.name]);
			}
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

	// useEffect(() => {
	// 	const shouldDisable = !Object.entries(sizeQuantities).some(
	// 		([size, quantity]) => quantity > 0 && variantIds[size]
	// 	);
	// 	const button = document.getElementById("add-to-cart-button");
	// 	if (button) {
	// 		if (!shouldDisable) {
	// 			button.setAttribute("disabled", "true");
	// 		} else {
	// 			button.removeAttribute("disabled");
	// 		}
	// 	}
	// }, [sizeQuantities, variantIds]);

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

	// console.log("Selected variant:", selectedVariant);
	console.log("Product data:", selectedVariant?.pricing?.price?.gross.currency);

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
						<ProductDescription descriptionHtml={descriptionHtml} title="Descriptions" />
					</div>
				</div>

				{/* Product Details Section */}
				<div className="relative flex w-full flex-col rounded-lg px-4 md:w-1/2 md:px-6 lg:w-2/5">
					<div className="mb-24 flex-grow space-y-6">
						<ProductTitle name={productData?.product?.name} />
						<ProductDescription descriptionHtml={features} />

						<div className="mt-4">
							<div className="flex flex-row items-center justify-between">
								<span className="text-sm font-semibold">PRICE:</span>
								<div className="ml-2 text-3xl font-bold text-slate-700">
									{formatMoney(
										selectedVariant?.pricing?.price?.gross.amount as number,
										selectedVariant?.pricing?.price?.gross.currency as string,
									)}
								</div>
							</div>
						</div>

						{/* Interactive Product Options */}
						<div className="space-y-4">
							{/* {optionList.map((option) => (
								<ProductAttributeSelector
									key={option.name}
									name={option.name}
									values={option.values}
									selectedValue={opstions[option.name]}
									onSelect={(value) => {
										//setSelectColorAttributeValueId(attributeValueIds.current.get(value)|| null);
										const selectedId = attributeValueIds.current.get(value) || null;
										setSelectColorAttributeValueId(selectedId);
										if (selectedId != null && attributeValueIdMetadata.current.has(selectedId)) {
											setIsCustomDesign(true);
										} else {
											setIsCustomDesign(false);
										}

										for (const option of optionList) {
											if (option.name == "SIZE") {
												//updateSizeQuantity(option.name, 0);
												//console.log('aaaaaaaaaaaaaaaaaaaaaaa', option.values);
												for (const i of option.values) {
													updateSizeQuantity(i, 0);
													//console.log(i);
												}
											}

										}
										updateSizeQuantity(value, 1);
										return handleAttributeSelect(option.name, value);
									}}
								/>
							))} */}
							{optionList.map((option) => {
								const isColorOrSize = option.name === "COLOR" || option.name === "SIZE";

								if (!isColorOrSize) {
									return null; // Không render ProductAttributeSelector nếu không phải 'COLOR' hoặc 'SIZE'
								}

								return (
									<ProductAttributeSelector
										key={option.name}
										name={option.name}
										values={option.values}
										selectedValue={opstions[option.name]}
										onSelect={(value) => {
											// COLOR logic
											if (option.name === "COLOR") {
												const selectedId = attributeValueIds.current.get(value) || null;
												setSelectColorAttributeValueId(selectedId);

												if (selectedId != null && attributeValueIdMetadata.current.has(selectedId)) {
													setIsCustomDesign(true);
												} else {
													setIsCustomDesign(false);
												}
											}

											// SIZE logic
											if (option.name === "SIZE") {
												// for (const i of option.values) {
												// 	updateSizeQuantity(i, 0);
												// }
												updateSizeQuantity(value, 1);
											}

											return handleAttributeSelect(option.name, value);
										}}
									/>
								);
							})}
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
											{isSelected && (
												<input
													type="number"
													disabled={!isSelected}
													value={sizeQuantities[size] ?? 0}
													onChange={(e) => {
														const rawValue = e.target.value;
														const normalized = String(Number(rawValue));

														e.target.value = normalized;
														const inputValue = parseInt(normalized);
														if (inputValue >= 0) {
															updateSizeQuantity(size, parseInt(e.target.value) || 0);
														} else {
															updateSizeQuantity(size, 0);
														}
														// else {
														// 	toast.error('Quantity cannot be less than 0');
														// }
													}}
													max={quantityLimitPerCustomer}
													min="0"
													className="input-number w-[65px] appearance-none rounded-md border border-gray-200 px-2 py-1 text-center text-sm transition-all duration-200 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FD8C6E] focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
													aria-label={`Quantity for size ${size}`}
													tabIndex={isSelected ? 0 : -1}
												/>
											)}

											{!isSelected && (
												<input
													type="number"
													disabled={!isSelected}
													value={0}
													onChange={() => updateSizeQuantity(size, 0)}
													max={quantityLimitPerCustomer}
													min="0"
													className="input-number w-[65px] appearance-none rounded-md border border-gray-200 px-2 py-1 text-center text-sm transition-all duration-200 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FD8C6E] focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
													aria-label={`Quantity for size ${size}`}
													tabIndex={isSelected ? 0 : -1}
												/>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="absolute bottom-4 right-4 flex items-center gap-4">
						<button
							id="add-to-cart-button"
							className="transform rounded-lg bg-white px-6 py-3 text-base font-semibold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FD8C6E] focus:ring-offset-2 disabled:opacity-50"
							// disabled={
							// 	!Object.entries(sizeQuantities).some(([size, quantity]) => quantity > 0 && variantIds[size])
							// }
							onClick={async () => {
								//document.getElementById("add-to-cart-button")?.setAttribute("disabled", "true");
								let totalQuanlity = 0;

								for (const size in sizeQuantities) {
									const quantity = sizeQuantities[size];
									totalQuanlity += quantity;
								}
								if (totalQuanlity == 0) {
									toast.error("Total quantity of items must be greater than 0.");

									return;
								}
								document.getElementById("add-to-cart-button")?.setAttribute("disabled", "true");
								const items = getVariantsToAdd(variantIds, sizeQuantities);
								const result = await addCart(params, items);
								if (result?.error == 2) {
									result.messages.forEach((item) => {
										toast.error(item.message);
									});
								} else if (result?.error == 1) {
									// result.messages.forEach((item) => {
									// 	//toast.error(item.message);
									// 	window.location.replace(`/${params.channel}/login`);
									// });
									window.location.replace(`/${params.channel}/login`);
								} else if (result?.error == 3) {
									toast.error("Something went wrong. Please try again later");
								} else {
									toast.success("Product added to cart");
									const inputs = document.querySelectorAll<HTMLInputElement>(".input-number");

									// for (const [size, variantId] of Object.entries(variantIds)) {
									for (const [size] of Object.entries(variantIds)) {
										updateSizeQuantity(size, 0);
									}

									inputs.forEach((input) => {
										input.value = "0";
									});
								}
								setTimeout(() => {
									document.getElementById("add-to-cart-button")?.removeAttribute("disabled");
								}, 300);
							}}
						>
							Add to Cart
						</button>
						{isCustomDesign == true && (
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
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
