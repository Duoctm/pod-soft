// "use client";

// import edjsHTML from "editorjs-html";
// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { notFound } from "next/navigation";
// import xss from "xss";
// import { toast, ToastContainer } from "react-toastify";
// import Link from "next/link";
// import { getProductDetails } from "./actions/getProductDetails";
// import { addCart } from "./actions/addCart";

// import { ProductTitle } from "./_components/ProductTitle";
// import { ProductDescription } from "./_components/ProductDescription";
// import "react-toastify/dist/ReactToastify.css";
// import { cn, formatMoney } from "@/lib/utils";
// import { Product, ProductVariant, TaxedMoney } from "@/gql/graphql";
// import Swipper from "./_components/Swipper";
// import { Ruler } from "lucide-react";
// import SizeGuideModal from "./guide";
// import { useNavigateLogin } from "@/hooks/useNavigateLogin";
// // import ProductColorSizeSelector from "./_components/ProductColorSizeSelector";
// import ProductSizeQuantityInputs from "./_components/ProductSizeQuantityInputs";
// import AddToCardLoading from "./_components/AddToCardLoading";
// // Initialize the parser once
// const parser = edjsHTML();

// interface AttributeValue {
// 	id: string;
// 	name: string;
// }
// interface AttributeRef {
// 	id: string;
// 	name: string;
// }
// interface Attribute {
// 	attribute: AttributeRef;
// 	values: AttributeValue[];
// }

// interface GetProductDetailsQueryResult {
// 	product: Product | null;
// }
// interface ProductDetailsState extends GetProductDetailsQueryResult {
// 	seachKey: { [key: string]: string };
// }

// interface PageProps {
// 	params: {
// 		slug: string;
// 		channel: string;
// 	};
// }

// interface BlockProps {
// 	id: string;
// 	type: string;
// 	data: {
// 		text: string;
// 	};
// }

// interface BlocksProps {
// 	timne: number;
// 	version: string;
// 	blocks: BlockProps[];
// }

// const getSearchKey = (attributes: Attribute[]): string => {
// 	return [...attributes]
// 		.sort((a, b) => a.attribute.name.localeCompare(b.attribute.name))
// 		.map((attr) => attr.values.map((v) => v.name).join(""))
// 		.join("_");
// };

// // function getVariantsToAdd(
// // 	variantIds: { [size: string]: string },
// // 	sizeQuantities: { [size: string]: number },
// // ): { variantId: string; quantity: number }[] {
// // 	return Object.entries(sizeQuantities)
// // 		.filter(([_, quantity]) => quantity > 0)
// // 		.map(([size, quantity]) => ({
// // 			variantId: variantIds[size],
// // 			quantity,
// // 		}))
// // 		.filter((item) => !!item.variantId); // Bỏ các item không có variantId
// // }

// export default function Page({ params }: PageProps) {
// 	const { slug, channel } = params;
// 	const [productData, setProductData] = useState<ProductDetailsState | null>(null);
// 	const [loading, setLoading] = useState<boolean>(true);
// 	const [error, setError] = useState<Error | null>(null);
// 	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
// 	const [opstions, setOptions] = useState<{ [key: string]: string }>({});
// 	const [quantity, _setQuantity] = useState(1);
// 	const [selectColorAttributeValueId, setSelectColorAttributeValueId] = useState<string | null>(null);
// 	const attributeValueIds = useRef<Map<string, string>>(new Map());
// 	const attributeValueIdMetadata = useRef<Set<string>>(new Set());
// 	const [sizeQuantities, setSizeQuantities] = useState<{
// 		[size: string]: { quantity: number; variantId: string };
// 	}>({});
// 	const [variantIds, setVariantIds] = useState<{ [size: string]: string }>({});
// 	const [isCustomDesign, setIsCustomDesign] = useState<boolean>(true);

// 	const imageAttributeValueId = useRef<Map<string, string>>(new Map());
// 	const [imageSlider, setImageSlider] = useState<string[]>([""]);
// 	const [defaultPricing, setDefaultPricing] = useState<TaxedMoney | null>(null);
// 	const [showSizeGuide, setShowSizeGuide] = useState(false);
// 	const [_defaultVariant, setDefaultVariant] = useState<ProductVariant | null>(null);
// 	const [sizeList, setSizeList] = useState<string[]>([]);

// 	const [selectedSize, setSelectedSize] = useState<string | null>(null);
// 	const [variant, setVariant] = useState<string | null>(null);
// 	const [addtoCartLoading, setAddToCartLoading] = useState(false);

// 	const updateSizeQuantity = (sizeOfSelect: string, quantity: number) => {
// 		// for (const [size, variantId] of Object.entries(variantIds)) {
// 		for (const [size] of Object.entries(variantIds)) {
// 			if (size != sizeOfSelect) {
// 				setSizeQuantities((prev) => ({
// 					...prev,
// 					[size]: {
// 						quantity: 0,
// 						variantId: variantIds[size] || "",
// 					},
// 				}));
// 			}
// 		}
// 		setSizeQuantities((prev) => ({
// 			...prev,
// 			[sizeOfSelect]: {
// 				quantity,
// 				variantId: variantIds[sizeOfSelect] || "",
// 			},
// 		}));
// 	};

// 	useEffect(() => {
// 		const fetchData = async () => {
// 			setLoading(true);
// 			setError(null);
// 			try {
// 				const data = await getProductDetails(slug, channel);
// 				if (data.product == null) {
// 					notFound();
// 				}

// 				if (data.product && data.product.variants != null) {
// 					for (const item of data.product.variants) {
// 						const variant = item as typeof item & { metadata?: { key: string; value: string }[] };

// 						if (!variant.metadata || variant.metadata.length === 0) continue;

// 						const customJsonEntry = variant.metadata.find((i) => i.key === "custom_json");
// 						if (!customJsonEntry) continue;

// 						attributeValueIdMetadata.current.add(variant.attributes[0].values[0].id);
// 					}
// 				}

// 				const searchKey: { [key: string]: string } = {};
// 				const variants = data.product?.variants;

// 				variants?.forEach((variant) => {
// 					const variantId = variant.id;

// 					const attribute_standarn = [];
// 					for (const attr of variant.attributes) {
// 						if (attr.attribute.name == "COLOR" || attr.attribute.name == "SIZE") {
// 							attribute_standarn.push(attr);
// 						}
// 					}
// 					const value = getSearchKey(attribute_standarn.reverse() as Attribute[]);
// 					searchKey[value] = variantId;
// 				});

// 				setProductData({
// 					product: data.product as Product,
// 					seachKey: searchKey,
// 				});

// 				let defaultVariant: ProductVariant | null = null;
// 				if (data.product?.defaultVariant) {
// 					defaultVariant = data.product.defaultVariant as ProductVariant;

// 					const defaultImageSelected = defaultVariant.media?.map((media) => media.url) || [];
// 					setImageSlider(defaultImageSelected);
// 					const defaultPricing = defaultVariant.pricing?.price;
// 					setDefaultPricing(defaultPricing as TaxedMoney);
// 				} else if (data.product?.variants && data.product.variants.length > 0) {
// 					defaultVariant = data.product.variants[0] as ProductVariant;
// 				}

// 				if (defaultVariant?.attributes != null) {
// 					for (const atr of defaultVariant?.attributes) {
// 						if (atr.attribute.name == "SIZE") {
// 							updateSizeQuantity(atr.values[0].name as string, 0);
// 							break;
// 						}
// 					}
// 				}

// 				setSelectedVariantId(() => defaultVariant?.id || null);
// 				setSelectColorAttributeValueId(defaultVariant?.attributes[0].values[0].id ?? null);
// 				if (
// 					defaultVariant?.attributes[0].values[0].id != null &&
// 					attributeValueIdMetadata.current.has(defaultVariant?.attributes[0].values[0].id)
// 				) {
// 					setIsCustomDesign(true);
// 				} else {
// 					setIsCustomDesign(false);
// 				}

// 				const optionValue: { [key: string]: string } = {};
// 				defaultVariant?.attributes.sort().map((attr) => {
// 					const key = attr?.attribute?.name?.toUpperCase() as string;
// 					const value = attr.values.map((v) => v.name).join("");
// 					optionValue[key] = value;
// 					//atrrubuteValueIds.current.set(value, attr.values[0].id)
// 				});

// 				setDefaultVariant(defaultVariant);
// 				setOptions(() => optionValue);
// 			} catch (err: any) {
// 				setError(err instanceof Error ? err : new Error("An unknown error occurred fetching product data"));
// 			} finally {
// 				setLoading(false);
// 			}
// 		};
// 		void fetchData();
// 	}, [channel, slug]);

// 	if (error) {
// 		// throw new Error("Error fetching product data:", error);
// 		notFound();
// 	}

// 	const descriptionHtml = useMemo(() => {
// 		if (!productData?.product?.description) return null;
// 		try {
// 			const newData = productData?.product?.description;
// 			const parsedData = JSON.parse(newData) as BlocksProps;

// 			parsedData.blocks.map((block: { data: { text: string } }) => {
// 				const removeText = block.data.text.split("\n")[0];
// 				block.data.text = removeText;
// 			});

// 			return parser.parse(parsedData);
// 		} catch (parseError) {
// 			console.error("Error parsing product description:", parseError);
// 			return [xss(productData?.product.description)];
// 		}
// 	}, [productData?.product?.description]);

// 	const features = useMemo(() => {
// 		if (!productData?.product?.description) return null;
// 		try {
// 			const newData = productData?.product?.description;
// 			const parsedData = JSON.parse(newData) as BlocksProps;

// 			parsedData.blocks.map((block: { data: { text: string } }) => {
// 				const removeText = block.data.text.split("\n")[3];
// 				block.data.text = removeText;
// 			});

// 			return parser.parse(parsedData);
// 		} catch (parseError) {
// 			console.error("Error parsing product description:", parseError);
// 			return [xss(productData?.product.description)];
// 		}
// 	}, [productData?.product?.description]);

// 	const selectedVariant = useMemo(() => {
// 		if (!productData?.product?.variants || !selectedVariantId) {
// 			return null;
// 		}
// 		return productData?.product.variants.find((v) => v.id === selectedVariantId);
// 	}, [productData?.product?.variants, selectedVariantId]);

// 	const quantityLimitPerCustomer = useMemo(() => {
// 		return selectedVariant?.quantityLimitPerCustomer || 5000;
// 	}, [selectedVariant]);

// 	const extractAttributes = (variants: ProductVariant[]) => {
// 		const map = new Map<string, Set<string>>();
// 		variants.map((variant: ProductVariant) => {
// 			variant.attributes.forEach(({ attribute, values }) => {
// 				if (attribute.name) {
// 					const key = attribute?.name.toUpperCase();
// 					if (!map.has(key)) map.set(key, new Set());

// 					if (values) {
// 						values.map((v) => map.get(key)?.add(v.name as string));
// 					}
// 					if (key == "COLOR") {
// 						values.map((v) => imageAttributeValueId.current.set(v.name as string, variant.id));
// 						values.map((v) => attributeValueIds.current.set(v.name as string, v.id));
// 					}
// 				}
// 			});
// 		});
// 		return Array.from(map.entries()).map(([name, valueSet]) => ({
// 			name,
// 			values: Array.from(valueSet.values()),
// 		}));
// 	};

// 	const optionList = useMemo(() => {
// 		const attributes = extractAttributes(productData?.product?.variants || []);

// 		return [...attributes];
// 	}, [productData?.product?.variants]);
// 	useEffect(() => {
// 		const searchKeyList: string[] = [];
// 		optionList.forEach((option) => {
// 			if (option.name == "COLOR" || option.name == "SIZE") {
// 				searchKeyList.push(opstions[option.name]);
// 			}
// 		});
// 		const searchKey = searchKeyList.join("_");

// 		setVariantIds((prev) => {
// 			const updated = {
// 				...prev,
// 				[searchKey.split("_")[1]]: productData?.seachKey[searchKey] ?? "",
// 			};

// 			// Xóa key 'undefined' nếu tồn tại
// 			const { undefined: _omit, ...rest } = updated;

// 			return rest;
// 		});

// 		setSelectedVariantId((prev) => {
// 			return productData?.seachKey[searchKey] || prev;
// 		});
// 	}, [opstions, optionList, productData?.seachKey]);

// 	return (
// 		<div className="flex min-h-screen flex-col items-center py-8 font-sans">
// 			{/* <SizeGuideModal catalog={productData?.product?.category?.name  === "tee" || productData?.product?.category?.name === "fleece" ? productData?.product?.category?.name : "tee"} /> */}

// 			<ToastContainer position="top-center" />
// 			<ProductTitle name={productData?.product?.name} isLoading={loading} className="mb-7 px-4 md:hidden" />
// 			<div className="relative flex w-full max-w-7xl flex-col gap-2 rounded-lg px-4 md:flex-row md:gap-8">
// 				{/* Image Section */}
// 				<div className="w-full md:w-1/2 lg:w-[35%]">
// 					<Swipper images={imageSlider} loading={loading} />
// 					<div className="hidden w-full md:block">
// 						<ProductDescription descriptionHtml={descriptionHtml} title="Descriptions" />
// 					</div>
// 				</div>

// 				{/* Product Details Section */}
// 				<div className="relative flex w-full flex-col rounded-lg md:w-1/2 md:px-6 lg:w-[65%]">
// 					<div className="mb-24 flex-grow space-y-6">
// 						<ProductTitle name={productData?.product?.name} isLoading={loading} className="hidden md:flex" />
// 						{/* <ProductDescription descriptionHtml={features} isLoading={loading} /> */}

// 						<div className="mt-4 w-full">
// 							<div className="flex flex-row items-center justify-between">
// 								<div className="ml-2 text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
// 									{loading || !defaultPricing ? (
// 										<div className="h-6 w-24 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-28 md:h-8 md:w-32"></div>
// 									) : (
// 										formatMoney(
// 											defaultPricing.gross.amount as number,
// 											defaultPricing.gross.currency as string,
// 										)
// 									)}
// 								</div>
// 								<div className="flex flex-1 items-center justify-end">
// 									{loading ? (
// 										<div className="flex items-center gap-x-2">
// 											<div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
// 											<div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
// 										</div>
// 									) : (
// 										<button className="flex items-center gap-x-2" onClick={() => setShowSizeGuide(true)}>
// 											<Ruler />
// 											<span className="underline">Size Guide</span>
// 										</button>
// 									)}

// 									{showSizeGuide && (
// 										<SizeGuideModal
// 											setShowSizeGuide={setShowSizeGuide}
// 											catalog={
// 												productData?.product?.category?.slug === "tee" ||
// 													productData?.product?.category?.slug === "fleece"
// 													? productData?.product?.category?.slug
// 													: "tee"
// 											}
// 										/>
// 									)}
// 								</div>
// 							</div>
// 						</div>

// 						{/* <ProductColorSizeSelector
// 							variants={productData?.product?.variants || []}
// 							loading={loading}
// 							defaultColor={defaultVariant?.name.split(" / ")[0] || ""}
// 							defaultSize={defaultVariant?.name.split(" / ")[1] || ""}
// 							onChange={(selected, variantId, sizeList) => {
// 								setSizeList(sizeList);
// 								setSelectedSize(selected.size);
// 								setVariant(variantId);
// 								setSelectedVariantId(variantId);
// 							}}
// 						/> */}

// 						<ProductSizeQuantityInputs
// 							sizeList={sizeList}
// 							sizeQuantities={sizeQuantities}
// 							onChange={(size, quantity) => {
// 								setSizeQuantities((prev) => ({
// 									...prev,
// 									[size]: {
// 										quantity,
// 										variantId: variant || "", // lấy variantId từ variantIds theo size
// 									},
// 								}));
// 							}}
// 							selectedSize={selectedSize}
// 							onSelectSize={setSelectedSize}
// 							min={0}
// 							max={quantityLimitPerCustomer}
// 						/>
// 						<div className="flex flex-col gap-2 sm:flex-row sm:justify-start">
// 							{loading ? (
// 								<>
// 									<div className="h-14 w-full animate-pulse rounded-lg bg-gray-200 md:w-48"></div>
// 									<div className="flex w-full flex-row  gap-4">
// 										<div className="h-14 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
// 										<div className="h-14 w-full animate-pulse rounded-lg bg-gray-200 sm:w-48"></div>
// 									</div>
// 								</>
// 							) : (
// 								<>
// 									<div className="flex flex-row-reverse gap-2 ">
// 										<button
// 											id="add-to-cart-button "
// 											className={cn(
// 												"flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#8B3958] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#8B3958]/90 focus:outline-none focus:ring-2 focus:ring-[#8B3958] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
// 												addtoCartLoading ? "cursor-not-allowed opacity-50" : "",
// 											)}
// 											onClick={async () => {
// 												setAddToCartLoading(true);
// 												const items = Object.values(sizeQuantities)
// 													.filter((v) => v.quantity > 0 && v.variantId) // chỉ lấy những item có quantity > 0 và có variantId
// 													.map(({ variantId, quantity }) => ({ variantId, quantity }));

// 												if (items.length === 0) {
// 													toast.error("Please select at least one size and quantity");
// 													setAddToCartLoading(false);
// 													return;
// 												}

// 												const result = await addCart(params, items);

// 												if (result?.error?.error == 2) {
// 													result.error.messages.forEach((item) => {
// 														toast.error(item.message);
// 													});
// 												} else if (result?.error?.error == 1) {
// 													// window.location.replace(`/${params.channel}/login`);
// 													// router.push(`/${params.channel}/login?redirect=${encodeURIComponent(pathname)}`)
// 													useNavigateLogin(channel);
// 												} else if (result?.error?.error == 3) {
// 													toast.error("Something went wrong. Please try again later");
// 												} else {
// 													toast.success("Product added to cart");
// 												}

// 												setSizeQuantities({});
// 												setAddToCartLoading(false);
// 											}}
// 										>
// 											{addtoCartLoading ? (
// 												<svg
// 													className="h-5 w-5 animate-spin"
// 													xmlns="http://www.w3.org/2000/svg"
// 													fill="none"
// 													viewBox="0 0 24 24"
// 												>
// 													<circle
// 														className="opacity-25"
// 														cx="12"
// 														cy="12"
// 														r="10"
// 														stroke="currentColor"
// 														strokeWidth="4"
// 													></circle>
// 													<path
// 														className="opacity-75"
// 														fill="currentColor"
// 														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.293-6.707A8.003 8.003 0 0012 20v4c-6.627 0-12-5.373-12-12h4a8.003 8.003 0 006.707-3.293l-2.414-2.414z"
// 													></path>
// 												</svg>
// 											) : (
// 												<>
// 													<svg
// 														xmlns="http://www.w3.org/2000/svg"
// 														className="h-5 w-5"
// 														viewBox="0 0 20 20"
// 														fill="currentColor"
// 													>
// 														<path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
// 													</svg>
// 													<p>Add to Cart</p>
// 												</>
// 											)}
// 										</button>

// 										{isCustomDesign == true && (
// 											<Link
// 												href={`/${channel}/design/1/${productData?.product?.id}/${selectColorAttributeValueId}/${selectedVariantId}`}
// 												className="w-full sm:w-auto"
// 											>
// 												<button
// 													className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#8B3958] px-5 
// 														py-2 text-sm font-semibold text-white shadow-lg 
// 														transition-all duration-300 hover:scale-105 hover:bg-[#8B3958]/90 
// 														focus:outline-none focus:ring-2
// 														focus:ring-[#8B3958] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
// 													onClick={() => {
// 														localStorage.setItem(
// 															"cart",
// 															JSON.stringify({
// 																params: params,
// 																selectedVariantId: selectedVariantId,
// 																quantity: quantity,
// 															}),
// 														);
// 													}}
// 												>
// 													<svg
// 														xmlns="http://www.w3.org/2000/svg"
// 														className="h-5 w-5"
// 														viewBox="0 0 20 20"
// 														fill="currentColor"
// 													>
// 														<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
// 													</svg>
// 													Design
// 												</button>
// 											</Link>
// 										)}
// 									</div>
// 								</>
// 							)}
// 						</div>
// 						{/* Action Buttons */}
// 						<ProductDescription descriptionHtml={features} isLoading={loading} />
// 						<div className="block w-full md:hidden">
// 							<ProductDescription descriptionHtml={descriptionHtml} title="Descriptions" />
// 						</div>
// 					</div>
// 				</div>
// 			</div>

// 			{addtoCartLoading && <AddToCardLoading />}
// 		</div>
// 	);
// }
