"use client";

import React, { useState } from "react";
import { Disclosure } from "@headlessui/react";
import type { FilterSidebarProps } from "../types";
import { FilterOption } from "./filter-options";

const MAX_VISIBLE_OPTIONS = 6;

export function FilterSidebar({ slug: slugCategory, attributes, setCategory, channel }: FilterSidebarProps) {
	return (
		<div className="sticky top-0 h-screen w-full max-w-[300px] flex-col overflow-auto">
			<h2 className="mb-4 text-xl font-semibold capitalize text-gray-800 lg:text-5xl">{slugCategory}</h2>
			<div>
				{attributes.edges.map((attribute) => {
					const { slug, name, choices } = attribute.node;
					const options = choices?.edges || [];
					return (
						<Disclosure key={slug} defaultOpen>
							<div className="mb-4">
								<Disclosure.Button className="flex w-full items-center justify-between py-2 text-xl font-semibold capitalize text-gray-800">
									<span>{name}</span>
								</Disclosure.Button>
								<Disclosure.Panel>
									<div className="flex flex-wrap gap-2">
										{options.slice(0, MAX_VISIBLE_OPTIONS)
										.filter((choice) => !!choice.node.name)
										.map((choice) => (
											<FilterOption
												channel={channel}
												slug={slugCategory}
												setCategory={setCategory}
												key={choice.node.name}
												attributeName={choice.node.name as unknown as string}
												isColor={name === "COLOR"}
												
											/>
										))}
										{options.length > MAX_VISIBLE_OPTIONS && (
											<ShowMoreOptions 
												options={options}
												isColor={name === "COLOR"} 
												channel={channel}
												slug={slugCategory}
												setCategory={setCategory as any}
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
	);
}

interface ShowMoreOptionsProps {
	options: Array<{
		node: {
			name?: string | null;
		};
	}>;
	isColor: boolean;
	channel: string;
	slug: string;
	setCategory: (value: string) => void;
}

function ShowMoreOptions({ options, isColor, channel, slug, setCategory }: ShowMoreOptionsProps) {
	const [showAll, setShowAll] = useState(false);

	return (
		<>
			{showAll &&
				options
					.slice(MAX_VISIBLE_OPTIONS)
					.map((choice) => (
						<FilterOption
							key={choice.node.name}
							attributeName={choice.node.name as unknown as string}
							isColor={isColor}
							channel={channel}
							slug={slug}
							setCategory={setCategory}
						/>
					))}
			<button
				type="button"
				className="ml-2 text-sm text-blue-600 underline"
				onClick={() => setShowAll((prev) => !prev)}
			>
				{showAll ? "Show Less" : `Show More (${options.length - MAX_VISIBLE_OPTIONS})`}
			</button>
		</>
	);
}
