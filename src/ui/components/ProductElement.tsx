'use client';


import xss from "xss";
import { useEffect, useState } from "react";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";

import type { ProductListItemFragment } from "@/gql/graphql";
// import { formatMoneyRange } from "@/lib/utils";


type ProductDescription = {
	time: string,
	version: string,
	blocks: Array<{
		id: string,
		type: string,
		data: {
			text: string
		}
	}>
}


const splitName = (name: string) => {

	const words = name.split("-")[0];
	return words;
}

export default function ProductElement({
	product,
	loading,
	priority,
	onHandleChangeProductDesign
}: { product: ProductListItemFragment } & { loading: "eager" | "lazy"; priority?: boolean } & { onHandleChangeProductDesign?: ((productId: string) => void) | null }) {

	const parseDescription = JSON.parse(product.description as string) as ProductDescription
	const [isHandleChangeProductDesign, setIsHandleChangeProductDesign] = useState<boolean>(false);
	useEffect(() => {
		if (onHandleChangeProductDesign != null && onHandleChangeProductDesign != undefined) {
			setIsHandleChangeProductDesign(true);
		}
	}, [onHandleChangeProductDesign]);


	const handleChangeProductFromDesign = (productId: string) => {
		if (onHandleChangeProductDesign) {
			onHandleChangeProductDesign(productId);
		}
		//setIsHandleChangeProductDesign(false);
	}


	return (
		<li data-testid="ProductElement" className="group">
			{(isHandleChangeProductDesign === false) && (
				<LinkWithChannel href={`/products/${product.slug}`} key={product.id}>
					<div className="overflow-hidden rounded-lg shadow-sm  bg-[#FAFAFF] transition-transform duration-300 ease-in-out group-hover:scale-[1.02] ">
						{product?.thumbnail?.url && (
							<div className="relative">
								<ProductImageWrapper
									loading={loading}
									src={product.thumbnail.url}
									alt={product.thumbnail.alt ?? ""}
									width={512}
									height={512}
									priority={priority}
									className="transform object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
								/>
								{/* <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 ease-in-out group-hover:bg-opacity-10" /> */}
							</div>
						)}
						<div className="p-4 flex-1">
							<div className="flex flex-1 h-full flex-col gap-11">
								<div className="space-y-2 flex flex-1 flex-col gap-y-1">
									<h3 className="text-center font-bold w-full line-clamp-1 text-[26px] leading-[100%] text-[#484848]">
										{splitName(product.name)}
									</h3>


									{
										parseDescription && parseDescription.blocks ? (parseDescription.blocks.map((block) => {
											const desc = block.data.text.split("Features")[0];

											return <p key={block.id} className="text-sm text-neutral-500 line-clamp-2" data-testid="ProductElement_Category" dangerouslySetInnerHTML={{ __html: xss(desc) }} />
										})) : ""
									}


								</div>
								{/* <p className="font-bold text-base leading-[18px] " data-testid="ProductElement_PriceRange">
									From:{" "}
									{formatMoneyRange({
										start: product?.pricing?.priceRange?.start?.gross,
										stop: product?.pricing?.priceRange?.stop?.gross,
									})}
								</p> */}
							</div>
						</div>
					</div>
				</LinkWithChannel>
			)}

			{(isHandleChangeProductDesign === true) && (
				<div className="overflow-hidden rounded-lg shadow-sm  bg-[#FAFAFF] transition-transform duration-300 ease-in-out group-hover:scale-[1.02] "
					onClick={() => {
						handleChangeProductFromDesign(`${product.slug}`);
					}}>
					{product?.thumbnail?.url && (
						<div className="relative">
							<ProductImageWrapper
								loading={loading}
								src={product.thumbnail.url}
								alt={product.thumbnail.alt ?? ""}
								width={512}
								height={512}
								priority={priority}
								className="transform object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
							/>
							{/* <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 ease-in-out group-hover:bg-opacity-10" /> */}
						</div>
					)}
					<div className="p-4 flex-1">
						<div className="flex flex-1 h-full flex-col gap-11">
							<div className="space-y-2 flex flex-1 flex-col gap-y-1">
								<h3 className="text-center font-bold w-full line-clamp-1 text-[26px] leading-[100%] text-[#484848]">
									{splitName(product.name)}
								</h3>
								{
									parseDescription && parseDescription.blocks ? (parseDescription.blocks.map((block) => {
										const desc = block.data.text.split("Features")[0];

										return <p key={block.id} className="text-sm text-neutral-500 line-clamp-2" data-testid="ProductElement_Category" dangerouslySetInnerHTML={{ __html: xss(desc) }} />
									})) : ""
								}
							</div>
							{/* <p className="font-bold text-base leading-[18px] " data-testid="ProductElement_PriceRange">
								From:{" "}
								{formatMoneyRange({
									start: product?.pricing?.priceRange?.start?.gross,
									stop: product?.pricing?.priceRange?.stop?.gross,
								})}
							</p> */}
						</div>
					</div>
				</div>
			)}

		</li>
	);
}
