import React from "react";
import Link from "next/link";
import Image from "next/image";
import { executeGraphQL } from "@/lib/graphql";
import { CategoryListDocument } from "@/gql/graphql";

interface CatalogPageProps {
	params: {
		channel: string;
	};
}

async function CatalogPage({ params }: CatalogPageProps) {
	const { channel } = params;

	const { categories } = await executeGraphQL(CategoryListDocument, {
		variables: {
			first: 50,
		},
		revalidate: 60,
	});

	if (!categories?.edges.length) {
		return (
			<div className="flex h-screen items-center justify-center bg-white">
				<div className="animate-bounce text-2xl text-emerald-400">Loading Collections...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white py-16">
			<div className="container mx-auto px-4">
				<h1 className="mb-16 text-center text-5xl font-extrabold text-gray-800 animate-fade-in">
					<span className="text-gray-800">
						Explore Collections
					</span>
				</h1>

				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
					{categories.edges.map((collection) => (
						<Link
							key={collection.node.id}
							href={`/${channel}/catalog/${collection.node.slug}`}
							className="group block"
						>
							<div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg transition-all duration-500 hover:scale-105">
								<div className="aspect-square relative">
									{collection.node.backgroundImage?.url ? (
										<>
											<Image
												src={collection.node.backgroundImage.url}
												alt={collection.node.backgroundImage.alt || collection.node.name}
												fill
												className="object-cover brightness-90 transition-all duration-700 group-hover:brightness-100 group-hover:scale-110"
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
												priority={true}
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
										</>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
											<span className="text-xl text-gray-500">No image available</span>
										</div>
									)}
								</div>
								<div className="absolute bottom-0 left-0 right-0 p-6">
									<h2 className="text-2xl font-bold text-white">
										{collection.node.name}
									</h2>
									<div className="mt-2 h-1 w-12 bg-emerald-400 transition-all duration-300 group-hover:w-24" />
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

export default CatalogPage;
