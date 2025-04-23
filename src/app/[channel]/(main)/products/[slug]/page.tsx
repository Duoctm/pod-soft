"use client";

import edjsHTML from "editorjs-html";
import React, { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import xss from "xss";
import Image from "next/image";
import { QuantityInput } from "./QuantityInput";
import { Loader } from "@/ui/atoms/Loader";
import { addItem } from "./checkout";
import { executeGraphQL } from "@/lib/graphql";
import { GetProductDetailsDocument } from "@/gql/graphql";

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

interface GetProductDetailsQueryVariables {
	channel: string;
	slug: string;
}

// Define props for the component
interface PageProps {
	params: {
		slug: string;
		channel: string;
	};
}

export default function Page({ params }: PageProps) {
	// Get slug and channel from params
	const { slug, channel } = params;

	// State for fetched data
	const [productData, setProductData] = useState<ProductDetailsState | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	// State for UI interaction
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// State for selected options (attributes)
	const [opstions, setOptions] = useState<{ [key: string]: string }>({});
	const [quantity, setQuantity] = useState(1);

	// Function to compare attributes for sorting by name
	const commpareFunc = (attr1: Attribute, attr2: Attribute) => {
		const name1 = attr1.attribute.name.toLowerCase();
		const name2 = attr2.attribute.name.toLowerCase();
		return name1.localeCompare(name2);
	};

	const getSearchKey = (attributes: Attribute[]): string => {
		return attributes
			.sort(commpareFunc) // Sort attributes by name
			.map((item) => {
				return item.values
					.map((value) => {
						return value.name;
					})
					.join("");
			})
			.join("_");
	};

	// Fetch data from API when component mounts
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				// const data = await request<GetProductDetailsQueryResult, GetProductDetailsQueryVariables>(
				// 	endpoint,
				// 	GetProductDetailsQuery,
				// 	variables,

				// );

				const data = await executeGraphQL(GetProductDetailsDocument, {
					variables: {
						channel: channel,
						slug: slug,
					},
					revalidate: 60,
				});

				if (!data.product) {
					notFound();
				}

				// Create search keys for variants
				const searchKey: { [key: string]: string } = {};
				const variants = data.product?.variants;

				variants?.forEach((variant) => {
					const variantId = variant.id;
					const value = getSearchKey(variant.attributes as Attribute[]);
					searchKey[value] = variantId;
				});

				// Set product data to state
				setProductData({
					product: data.product as ProductDetails,
					seachKey: searchKey,
				});

				let defaultVariant: ProductVariant | null = null;
				// Initialize the initially selected variant
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

	// Safely parse description
	const descriptionHtml = useMemo(() => {
		if (!productData?.product?.description) return null;
		try {
			const parsedData = JSON.parse(productData?.product.description);
			return parser.parse(parsedData);
		} catch (parseError) {
			console.error("Error parsing product description:", parseError);
			return [productData?.product.description];
		}
	}, [productData?.product?.description]);

	// Get the full variant object based on selected ID
	const selectedVariant = useMemo(() => {
		if (!productData?.product?.variants || !selectedVariantId) {
			return null;
		}
		return productData?.product.variants.find((v) => v.id === selectedVariantId);
	}, [productData?.product?.variants, selectedVariantId]);

	// DEFAULT QUANTITY: 5000
	const quantityLimitPerCustomer = useMemo(() => {
		return selectedVariant?.quantityLimitPerCustomer || 5000;
	}, [selectedVariant]);

	// Get image array from the selected variant or fallback to thumbnail
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

	// Reset the image index when the variant changes
	useEffect(() => {
		setCurrentImageIndex(0);
	}, [selectedVariantId]);

	const handleThumbnailClick = (index: number) => {
		setCurrentImageIndex(index);
	};

	// Function to handle attribute selection
	const handleAttributeSelect = (attributeName: string, attributeValue: string) => {
		setOptions((prev) => {
			prev[attributeName] = attributeValue;
			return { ...prev };
		});
	};

	// Function to get unique attribute names from the variants list
	const getUniqueAttributeNames = (variants: ProductVariant[]): string[] => {
		const attributeNamesSet = new Set<string>();
		variants.forEach((variant) => {
			variant.attributes.forEach((attr) => {
				attributeNamesSet.add(attr.attribute.name.toUpperCase());
			});
		});
		return Array.from(attributeNamesSet).sort((a, b) => a.localeCompare(b)); // Sắp xếp theo thứ tự chữ cái
	};

	// --- Function to get unique attribute values ---
	const getUniqueAttributeValues = (attributeName: string, variants: ProductVariant[]): string[] => {
		const values = new Set<string>();
		variants?.forEach((variant) => {
			variant.attributes.forEach((attr) => {
				if (attr.attribute.name.toUpperCase() === attributeName.toUpperCase()) {
					attr.values.forEach((value) => {
						values.add(value.name);
					});
				}
			});
		});
		return Array.from(values.values());
	};

	const optionList = useMemo(() => {
		return getUniqueAttributeNames(productData?.product?.variants || []).map((name) => {
			return {
				name: name,
				values: getUniqueAttributeValues(name, productData?.product?.variants || []),
			};
		});
	}, [productData?.product?.variants]);

	useEffect(() => {
		const searchKeyList: string[] = [];
		optionList.forEach((option) => {
			searchKeyList.push(opstions[option.name]);
		});
		const searchKey = searchKeyList.join("_");
		setSelectedVariantId((prev) => {
			return productData?.seachKey[searchKey] || prev; // Lấy variantId từ đối tượng tìm kiếm
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
								<button
									onClick={handlePrev}
									aria-label="Previous image"
									className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/70 text-xl text-gray-700 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 md:h-12 md:w-12"
								>
									&#x276E;
								</button>
								<button
									onClick={handleNext}
									aria-label="Next image"
									className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/70 text-xl text-gray-700 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 md:h-12 md:w-12"
								>
									&#x276F;
								</button>
							</>
						)}
					</div>
					{/* Thumbnail section */}
					<div className="mt-4 flex flex-wrap justify-center gap-2">
						{currentImages.length > 1 &&
							currentImages
								.slice(0, 4)
								.map((img, index) => (
									<Image
										width={100}
										height={100}
										key={img.id || img.url + index}
										src={img.url}
										alt={img.alt ? `Thumbnail ${index + 1} - ${img.alt}` : `Thumbnail ${index + 1}`}
										onClick={() => handleThumbnailClick(index)}
										className={`h-14 w-14 cursor-pointer rounded-md border-2 object-cover md:h-16 md:w-16 ${currentImageIndex === index ? "border-black" : "border-transparent"
											} hover:border-gray-400`}
									/>
								))}
					</div>
				</div>

				{/* Details Section */}
				<div className="relative flex w-full flex-col rounded-lg bg-[#f6ede8] px-2 text-gray-800 md:w-1/2 md:px-4 lg:w-2/5">
					{/* Content Wrapper */}
					<div className="mb-24 flex-grow">
						<h1 className="mb-4 text-2xl font-bold">{productData?.product?.name}</h1>

						<div className="mb-6 mt-6">
							<h2 className="mb-2 text-sm font-semibold">Feartures</h2>
							{descriptionHtml && descriptionHtml.length > 0 ? (
								<div className="prose prose-sm prose-stone max-w-none space-y-3 text-neutral-600">
									{" "}
									{descriptionHtml.map((content, index) => (
										<div key={index} dangerouslySetInnerHTML={{ __html: xss(content) }} />
									))}
								</div>
							) : (
								<p className="text-sm italic text-neutral-500">No description available.</p>
							)}
						</div>

						{optionList.map((option) => {
							const isColor = option.name.toUpperCase() === "COLOR";
							return (
								<div key={option.name} className="mb-6 mt-6">
									<h2 className="mb-2 text-sm font-semibold">{option.name}</h2>
									<div className="flex flex-wrap gap-2">
										{option.values.map((value) => {
											let colorCode = null;
											if (isColor) {
												const color = value.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
												colorCode = color ? color[0] : null;
											}

											const isSelected = opstions[option.name] === value;

											return (
												<button
													key={value}
													className={`
                                            flex h-9 min-w-[2.5rem] items-center justify-center rounded-md border px-3 text-sm transition-all duration-150 ease-in-out
                                            ${isColor ? "w-9 p-0" : ""}
                                            ${isSelected
															? "border-black ring-1 ring-black ring-offset-1"
															: "border-gray-300"
														}
                                            hover:border-gray-500
                                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
                                            ${isColor && isSelected ? "ring-offset-2" : ""}
                                            text-[#000000]
                                        `}
													style={isColor ? { backgroundColor: colorCode || "#f9fafb" } : {}}
													onClick={() => {
														handleAttributeSelect(option.name, value);
													}}
													title={value}
												>
													{isColor ? (isSelected ? "" : "") : value}
													{isColor && (
														<span className="sr-only">
															{value.replace(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "").trim()}
														</span>
													)}
												</button>
											);
										})}
									</div>
								</div>
							);
						})}

						<div className="flex items-center justify-between">
							{/* quantityAvailable ? */}
							<QuantityInput
								limit={quantityLimitPerCustomer}
								quantityAvailable={quantityLimitPerCustomer}
								quantity={quantity}
								setQuantity={setQuantity}
							/>
						</div>
					</div>
					{/* Action Buttons Container */}
					<div className="absolute bottom-4 right-4 flex items-center justify-end gap-4 rounded">
						<button
							className="rounded-lg bg-[#39377a] px-6 py-3 text-center font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#39377a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!selectedVariant || selectedVariant.quantityAvailable === 0}
							onClick={() => {
								addItem(params, selectedVariantId, quantity);
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
