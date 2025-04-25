import React from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { executeGraphQL } from "@/lib/graphql";
import { CategoryListDocument } from "@/gql/graphql";
interface CatalogPageProps {
	params: {
		channel: string;
	};
}

async function CatalogPage({ params }: CatalogPageProps) {
	const { channel } = params;

 
	const {categories} = await executeGraphQL(CategoryListDocument, {
		variables: {
			first: 50,
		},
		revalidate: 60, // Cache for 60 seconds
	})
	console.log(categories)


	console.log(categories?.edges)
	if (!categories?.edges.length) {
		return <div className="flex h-[50vh] items-center justify-center">loading....</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
			<h1 className="mb-6 ml-[1%] text-left text-2xl font-bold sm:mb-8 sm:text-3xl">Select your product:</h1>

			<div
				className={clsx(
					"grid justify-items-center gap-6 sm:gap-10 lg:gap-20",
					"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				)}
			>
				{categories.edges.map((collection) => (
					<Link
						key={collection.node.id}
						href={`/${channel}/catalog/${collection.node.slug}`}
						className="w-full max-w-[320px] transition-transform duration-300 hover:scale-105"
					>
						<div className="relative flex w-full cursor-pointer flex-col items-center">
							<div className="relative z-10 mx-auto h-[250px] w-full sm:h-[336px]">
								{collection.node.backgroundImage?.url ? (
									<Image
										src={collection.node.backgroundImage.url}
										alt={collection.node.backgroundImage.alt || collection.node.name}
										fill
										className="rounded-md object-cover bg-center"
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
										priority={true}
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200">
										<span className="text-gray-400">No image</span>
									</div>
								)}
							</div>

							<div className="-mt-[200px] flex h-[280px] w-full flex-col items-center justify-end rounded-lg bg-[#a2a0b8] p-4 pt-16 shadow hover:shadow-xl sm:-mt-[290px] sm:h-[360px]">
								<h2 className="text-md text-center font-semibold text-white">{collection.node.name}</h2>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

export default CatalogPage;
