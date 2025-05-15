"use client";

import React, { useState } from "react";
import { FilterOption } from "./filter-options";

const MAX_VISIBLE_OPTIONS = 6;


interface ShowMoreOptionsProps {
	options: Array<{
		node: {
			name?: string | null;
			slug?: string | null;
		};
	}>;
	isColor: boolean;
	paramName: string;
	channel: string;
	slug: string;
	after: string;
 
	setCategory: (value: string) => void;
}

export function ShowMoreOptions({
	options,
	isColor,
	channel,
	slug,
	setCategory,
 
	paramName,
	after,
}: ShowMoreOptionsProps) {
	const [showAll, setShowAll] = useState(false);

	return (
		<>
			{showAll &&
				options
					.slice(MAX_VISIBLE_OPTIONS)
					.map((choice) => (
						<FilterOption
							setIsFilterOpen={()=>{}}
							paramValue={choice.node.slug as string}
							after={after}
							paramName={paramName as string}
							key={choice.node.name}
							attributeName={choice.node.name as unknown as string}
							isColor={isColor}
							channel={channel}
							slug={slug}
							setCategory={setCategory as any}
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
