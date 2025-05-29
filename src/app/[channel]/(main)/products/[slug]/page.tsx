"use client";

import edjsHTML from "editorjs-html";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { notFound } from "next/navigation";
import xss from "xss";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { getProductDetails } from "./actions/getProductDetails";
import { addCart } from "./actions/addCart";

import { ProductTitle } from "./_components/ProductTitle";
import { ProductDescription } from "./_components/ProductDescription";
import { ProductAttributeSelector } from "./_components/ProductAttributeSelector";
import "react-toastify/dist/ReactToastify.css";
import { formatMoney } from "@/lib/utils";
import { Product, ProductVariant, TaxedMoney } from "@/gql/graphql";
import Swipper from "./_components/Swipper";
import { Ruler } from "lucide-react";
import SizeGuideModal from "./guide";
import { useNavigateLogin } from "@/hooks/useNavigateLogin";

// Initialize the parser once
const parser = edjsHTML();

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

interface GetProductDetailsQueryResult {
	product: Product | null;
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

	const { slug, channel } = params;
	const [productData, setProductData] = useState<ProductDetailsState | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
	const [opstions, setOptions] = useState<{ [key: string]: string }>({});
	const [quantity, _setQuantity] = useState(1);
	const [selectColorAttributeValueId, setSelectColorAttributeValueId] = useState<string | null>(null);
	const attributeValueIds = useRef<Map<string, string>>(new Map());
	const attributeValueIdMetadata = useRef<Set<string>>(new Set());
	const [sizeQuantities, setSizeQuantities] = useState<{ [size: string]: number }>({});
	const [sizeQuantitie, setSizeQuantitie] = useState<number>(1);
	const [variantIds, setVariantIds] = useState<{ [size: string]: string }>({});
	const [isCustomDesign, setIsCustomDesign] = useState<boolean>(true);

	const imageAttributeValueId = useRef<Map<string, string>>(new Map());
	const [imageSlider, setImageSlider] = useState<string[]>([""]);
	const [defaultPricing, setDefaultPricing] = useState<TaxedMoney | null>(null);
	const [showSizeGuide, setShowSizeGuide] = useState(false);
	// const sizeValues = Array.from(
	// 	new Set(
	// 		productData?.product?.variants?.flatMap((variant) =>
	// 			variant.attributes
	// 				.filter((attr) => attr.attribute?.name?.toLocaleUpperCase() === "SIZE")
	// 				.flatMap((attr) => attr.values.map((v) => v.name)),
	// 		),
	// 	),
	// );

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
				if (data.product == null) {
					notFound()
				}

				if (data.product && data.product.variants != null) {
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
					const value = getSearchKey(attribute_standarn.reverse() as Attribute[]);
					searchKey[value] = variantId;
				});

				setProductData({
					product: data.product as Product,
					seachKey: searchKey,
				});


				let defaultVariant: ProductVariant | null = null;
				if (data.product?.defaultVariant) {
					defaultVariant = data.product.defaultVariant as ProductVariant;

					const defaultImageSelected = defaultVariant.media?.map((media) => media.url) || [];
					setImageSlider(defaultImageSelected);
					const defaultPricing = defaultVariant.pricing?.price;
					setDefaultPricing(defaultPricing as TaxedMoney);
				} else if (data.product?.variants && data.product.variants.length > 0) {
					defaultVariant = data.product.variants[0] as ProductVariant;
				}

				if (defaultVariant?.attributes != null) {
					for (const atr of defaultVariant?.attributes) {
						if (atr.attribute.name == "SIZE") {
							updateSizeQuantity(atr.values[0].name as string, 1);
							break;
						}
					}
				}

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
				defaultVariant?.attributes.sort().map((attr) => {
					const key = attr?.attribute?.name?.toUpperCase() as string;
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
		// throw new Error("Error fetching product data:", error);
		notFound()
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

	const handleAttributeSelect = (attributeName: string, attributeValue: string) => {
		setOptions((prev) => ({
			...prev,
			[attributeName]: attributeValue,
		}));
	};

	const extractAttributes = (variants: ProductVariant[]) => {
		const map = new Map<string, Set<string>>();
		variants.map((variant: ProductVariant) => {
			variant.attributes.forEach(({ attribute, values }) => {
				if (attribute.name) {
					const key = attribute?.name.toUpperCase();
					if (!map.has(key)) map.set(key, new Set());

					if (values) {
						values.map((v) => map.get(key)?.add(v.name as string));
					}
					if (key == "COLOR") {
						values.map((v) => imageAttributeValueId.current.set(v.name as string, variant.id));
						values.map((v) => attributeValueIds.current.set(v.name as string, v.id));
					}
				}
			});
		});
		return Array.from(map.entries()).map(([name, valueSet]) => ({
			name,
			values: Array.from(valueSet.values()),
		}));
	};

	const optionList = useMemo(() => {

		const attributes = extractAttributes(productData?.product?.variants || []);
		return [...attributes];
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


	return (
		<div className="flex min-h-screen flex-col items-center py-8 font-sans">
			{/* <SizeGuideModal catalog={productData?.product?.category?.name  === "tee" || productData?.product?.category?.name === "fleece" ? productData?.product?.category?.name : "tee"} /> */}

			<ToastContainer position="top-center" />
			<ProductTitle name={productData?.product?.name} isLoading={loading} className="md:hidden mb-7 px-4" />
			<div className="relative flex w-full max-w-7xl flex-col gap-2 md:gap-8 rounded-lg md:flex-row px-4">
				{/* Image Section */}
				<div className="w-full md:w-1/2 lg:w-[35%]">
					<Swipper images={imageSlider} loading={loading} />
					<div className="w-full hidden md:block">
						<ProductDescription descriptionHtml={descriptionHtml} title="Descriptions" />
					</div>
				</div>

				{/* Product Details Section */}
				<div className="relative flex w-full flex-col rounded-lg md:w-1/2 md:px-6 lg:w-[65%]">
					<div className="mb-24 flex-grow space-y-6">
						<ProductTitle name={productData?.product?.name} isLoading={loading} className="hidden md:flex" />
						{/* <ProductDescription descriptionHtml={features} isLoading={loading} /> */}

						<div className="mt-4 w-full">
							<div className="flex flex-row items-center justify-between">
								<div className="ml-2 font-extrabold text-black text-3xl md:text-4xl lg:text-5xl">
									{loading || !defaultPricing ? (
										<div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32"></div>
									) : (
										formatMoney(
											defaultPricing.gross.amount as number,
											defaultPricing.gross.currency as string,
										)
									)}
								</div>
								<div className="flex flex-1 items-center justify-end">
									{loading ? (
										<div className="flex items-center gap-x-2">
											<div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
											<div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
										</div>
									) : (
										<button className="flex items-center gap-x-2" onClick={() => setShowSizeGuide(true)}>
											<Ruler />
											<span className="underline">Size Guide</span>
										</button>
									)}

									{showSizeGuide && (
										<SizeGuideModal
											setShowSizeGuide={setShowSizeGuide}
											catalog={
												productData?.product?.category?.slug === "tee" ||
													productData?.product?.category?.slug === "fleece"
													? productData?.product?.category?.slug
													: "tee"
											}
										/>
									)}
								</div>
							</div>
						</div>
						{/* Interactive Product Options */}
						<div className="space-y-4">
							{optionList.map((option) => {
								// console.log(option)
								const isColorOrSize = option.name === "COLOR" || option.name === "SIZE";

								if (!isColorOrSize) {
									return null; // Không render ProductAttributeSelector nếu không phải 'COLOR' hoặc 'SIZE'
								}
								console.log('optin', option)
								return (
									<ProductAttributeSelector
										loading={loading}
										key={option.name}
										name={option.name}
										values={option.values}
										selectedValue={opstions[option.name]}
										onSelect={(value) => {
											// COLOR logic

											if (option.name === "COLOR") {
												const selectedId = attributeValueIds.current.get(value) || null;
												setSelectColorAttributeValueId(selectedId);

												const currentColorAttributeValueId = imageAttributeValueId.current.get(value) || null;
												const itemSelected =
													productData?.product?.variants?.find(
														(variant) => variant.id === currentColorAttributeValueId,
													) || null;
												const imageUrls = itemSelected?.media?.map((media) => media.url) || [];
												setImageSlider(imageUrls);
												const newPricing = itemSelected?.pricing?.price;
												setDefaultPricing(newPricing as TaxedMoney);

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

											const items = getVariantsToAdd(variantIds, sizeQuantities);

											console.log(items);

											const pricing = productData?.product?.variants?.find((val) => {
												return val.id === items[0].variantId;
											});
											setDefaultPricing(pricing?.pricing?.price as TaxedMoney);

											return handleAttributeSelect(option.name, value);
										}}
									/>
								);
							})}
						</div>

						{/* Size Selector with Quantity */}
						{/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
													onChange={() => updateSizeQuantity(size as string, 0)}
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
						</div> */}
						<div className="flex gap-2 flex-col sm:flex-row sm:justify-start">
							{loading ? (
								<>
									<div className="h-14 w-full animate-pulse rounded-lg bg-gray-200 md:w-48"></div>
									<div className="flex w-full gap-4  flex-row">
										<div className="h-14 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
										<div className="h-14 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
									</div>
								</>
							) : (
								<>
									<input
										type="number"
										value={sizeQuantitie}
										onChange={(e) => {
											setSizeQuantitie(parseInt(e.target.value));
										}}
										max={quantityLimitPerCustomer}
										min="1"
										className="w-28 rounded-md border border-gray-300 bg-white text-sm px-3 py-1 text-center text-gray-900 shadow-sm 
												transition duration-200 ease-in-out hover:border-[#8B3958]
												focus:border-[#8B3958] focus:outline-none focus:ring-2
												focus:ring-[#8B3958]"
									/>

									<div className="flex gap-2 flex-row-reverse ">
										<button
											id="add-to-cart-button "
											className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#8B3958] px-5 
											py-2 text-sm font-semibold text-white shadow-lg 
											transition-all duration-300 hover:scale-105 hover:bg-[#8B3958]/90 
											focus:outline-none focus:ring-2
											focus:ring-[#8B3958] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
											onClick={async () => {
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
												items.map((item) => (item.quantity = sizeQuantitie));
												const result = await addCart(params, items);
												if (result?.error?.error == 2) {
													result.error.messages.forEach((item) => {
														toast.error(item.message);
													});
												} else if (result?.error?.error == 1) {
													// window.location.replace(`/${params.channel}/login`);
													// router.push(`/${params.channel}/login?redirect=${encodeURIComponent(pathname)}`)
													useNavigateLogin(channel)
												} else if (result?.error?.error == 3) {
													toast.error("Something went wrong. Please try again later");
												} else {
													toast.success("Product added to cart");
												}
												setSizeQuantitie(1)
												setTimeout(() => {
													document.getElementById("add-to-cart-button")?.removeAttribute("disabled");
												}, 300);
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
											</svg>
											<p>

												Add to Cart
											</p>
										</button>

										{isCustomDesign == true && (
											<Link
												href={`/${channel}/design/1/${productData?.product?.id}/${selectColorAttributeValueId}/${selectedVariantId}`}
												className="w-full sm:w-auto"
											>
												<button
													className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#8B3958] px-5 
														py-2 text-sm font-semibold text-white shadow-lg 
														transition-all duration-300 hover:scale-105 hover:bg-[#8B3958]/90 
														focus:outline-none focus:ring-2
														focus:ring-[#8B3958] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
													</svg>
													Design
												</button>
											</Link>
										)}
									</div>
								</>
							)}
						</div>
						{/* Action Buttons */}
						<ProductDescription descriptionHtml={features} isLoading={loading} />
						<div className="w-full md:hidden block">
							<ProductDescription descriptionHtml={descriptionHtml} title="Descriptions" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
