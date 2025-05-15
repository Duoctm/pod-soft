"use client";

import { ProductCountableConnection } from "@/gql/graphql";
import React, { useEffect, useState, useCallback } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { getProductList } from "../../app/[channel]/(main)/products/[slug]/actions/getProductList";
import { ProductList } from "@/ui/components/ProductList"; // nếu bạn có component hiển thị
import { FilterSidebarProps } from "@/app/[channel]/(main)/catalog/[slug]/types";
import { getAttributes } from "@/app/[channel]/(main)/catalog/[slug]/actions/attributes";
import { Disclosure } from "@headlessui/react";
import { FilterOption } from "@/app/[channel]/(main)/catalog/[slug]/_components/filter-options";
import { ShowMoreOptions } from "@/app/[channel]/(main)/catalog/[slug]/_components/filter-sidebar";
import { ChevronDownIcon, FilterIcon, XIcon } from "lucide-react";

type InfiniteProductListProps = {
	channel: string;
	first: number;
};

const MAX_VISIBLE_OPTIONS = 6;

const InfiniteProductList = ({ channel, first }: InfiniteProductListProps) => {
	const [loading, setLoading] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [products, setProducts] = useState<ProductCountableConnection | null>(null);
	const [cursor, setCursor] = useState<string | null | undefined>(null);
	const [attributes, setAttributes] = useState<FilterSidebarProps["attributes"]>();

	const [setRef, isIntersecting] = useIntersectionObserver({
		threshold: 1,
		freezeOnceVisible: false,
	});

	const fetchAttributes = useCallback(async () => {
		const attrs = await getAttributes();
		setAttributes(attrs);
	}, []);

	const fetchData = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		const newData = await getProductList({
			first: first,
			after: cursor,
			channel: channel,
		});

		if (newData && newData.edges) {
			setProducts((prev) => {
				if (!prev) return newData as ProductCountableConnection;
				return {
					...newData,
					edges: [...prev.edges, ...newData.edges],
				} as ProductCountableConnection;
			});

			setCursor(newData.pageInfo.endCursor);
		}

		setLoading(false);
	}, [cursor, channel, first, loading]);

	useEffect(() => {
		void fetchAttributes();
		if (isIntersecting && !loading && (products?.pageInfo.hasNextPage ?? true)) {
			fetchData();
		}
	}, [isIntersecting, loading, fetchData, products?.pageInfo.hasNextPage]);

	console.log(products);

	return (
		<div className="flex min-h-screen w-full flex-col md:flex-row">
			{/* Mobile Filter Button */}
			<button
				className="fixed bottom-4 right-4 z-50 rounded-full bg-black p-4 text-white shadow-lg md:hidden"
				onClick={() => setIsFilterOpen(true)}
			>
				<FilterIcon className="h-6 w-6" />
			</button>

			{/* Sidebar Filter - Mobile Popup */}
			<div
				className={`fixed inset-0 z-50 transform bg-white transition-transform duration-300 ease-in-out md:hidden ${
					isFilterOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex h-full flex-col overflow-y-auto p-4">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-semibold capitalize text-gray-800">Filters</h2>
						<button className="rounded-full p-2 hover:bg-gray-100" onClick={() => setIsFilterOpen(false)}>
							<XIcon className="h-6 w-6" />
						</button>
					</div>
					{attributes &&
						attributes.edges
							.filter((attribute) => ["SIZE", "COLOR", "GENDER"].includes(attribute.node.name?.toUpperCase()))
							.map((attribute) => {
								const { slug, name, choices } = attribute.node;
								const options = choices?.edges || [];
								return (
									<Disclosure key={slug} defaultOpen>
										<div className="mb-6">
											<Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-3 text-lg font-semibold capitalize text-gray-800 hover:bg-gray-50">
												<span>{name}</span>
												<ChevronDownIcon className="ui-open:rotate-180 h-5 w-5 transition-transform duration-200" />
											</Disclosure.Button>
											<Disclosure.Panel className="mt-2">
												<div className="flex flex-wrap gap-3">
													{options
														.slice(0, MAX_VISIBLE_OPTIONS)
														.filter((choice) => !!choice.node.name)
														.map((choice) => (
															<FilterOption
															setIsFilterOpen={setIsFilterOpen}
																after={cursor as string | ""}
																paramName={name?.toLocaleLowerCase() as string}
																channel={channel}
																slug={choice.node.slug as string}
																setCategory={setProducts as any}
																key={choice.node.name}
																attributeName={choice.node.name as unknown as string}
																paramValue={choice.node.slug as string}
																isColor={name === "COLOR"}
															/>
														))}
													{options.length > MAX_VISIBLE_OPTIONS && (
														<ShowMoreOptions
															after={cursor as string | ""}
															paramName={name?.toLocaleLowerCase() as string}
															options={options}
															isColor={name === "COLOR"}
															channel={channel}
															slug={"tee"}
															setCategory={setProducts as any}
														/>
													)}
												</div>
											</Disclosure.Panel>
										</div>
									</Disclosure>
								);
							})}
				</div>
			</div>

			{/* Sidebar Filter - Desktop */}
			<div className="sticky top-0 hidden h-screen max-w-[330px] overflow-auto bg-white md:block">
				<h2 className="mb-6 text-xl font-semibold capitalize text-gray-800 md:text-2xl lg:text-3xl">
					Orders
				</h2>
				{/* Same filter content as mobile */}
				{attributes &&
					attributes.edges
						.filter((attribute) => ["SIZE", "COLOR", "GENDER"].includes(attribute.node.name?.toUpperCase()))
						.map((attribute) => {
							const { slug, name, choices } = attribute.node;
							const options = choices?.edges || [];
							return (
								<Disclosure key={slug} defaultOpen>
									<div className="mb-6">
										<Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-3 text-lg font-semibold capitalize text-gray-800 hover:bg-gray-50">
											<span>{name}</span>
											<ChevronDownIcon className="ui-open:rotate-180 h-5 w-5 transition-transform duration-200" />
										</Disclosure.Button>
										<Disclosure.Panel className="mt-2">
											<div className="flex flex-wrap gap-3">
												{options
													.slice(0, MAX_VISIBLE_OPTIONS)
													.filter((choice) => !!choice.node.name)
													.map((choice) => (
														<FilterOption
														setIsFilterOpen={setIsFilterOpen}
															 
															after={cursor as string | ""}
															paramName={name?.toLocaleLowerCase() as string}
															channel={channel}
															slug={choice.node.slug as string}
															setCategory={setProducts as any}
															key={choice.node.name}
															attributeName={choice.node.name as unknown as string}
															paramValue={choice.node.slug as string}
															isColor={name === "COLOR"}
														/>
													))}
												{options.length > MAX_VISIBLE_OPTIONS && (
													<ShowMoreOptions
														after={cursor as string | ""}
														paramName={name?.toLocaleLowerCase() as string}
														options={options}
														isColor={name === "COLOR"}
														channel={channel}
														slug={"tee"}
														setCategory={setProducts as any}
													/>
												)}
											</div>
										</Disclosure.Panel>
									</div>
								</Disclosure>
							);
						})}
			</div>

			{/* Product Grid */}
			<div className="flex-1 p-4 md:p-6">
				{products && <ProductList products={products.edges.map((e) => e.node)} />}
				{loading && (
					<div className="w-full">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{[1, 2, 3, 4, 5, 6].map((item) => (
								<div key={item} className="animate-pulse">
									<div className="mb-3 aspect-square rounded-lg bg-gray-200"></div>
									<div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
									<div className="h-4 w-1/2 rounded bg-gray-200"></div>
								</div>
							))}
						</div>
					</div>
				)}
				<div ref={setRef} className="h-10"></div>
			</div>
		</div>
	);
};

export default InfiniteProductList;
