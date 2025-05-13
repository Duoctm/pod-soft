import React from "react";
import Link from "next/link";
import Image from "next/image";
import { executeGraphQL } from "@/lib/graphql";
import { CategoryListDocument } from "@/gql/graphql";
import Wrapper from "@/ui/components/wrapper";

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
		<>
			<Wrapper>
				<div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8">
					<div className="mt-[68px] flex flex-col items-start justify-start gap-2 py-8 text-left md:h-auto md:w-auto md:gap-[16px]">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-[#EF816B] sm:text-sm md:text-[18px] md:leading-none md:tracking-[0.16em]">
							ZOOMPRINTS PRODUCTS
						</h2>
						<h1 className="text-3xl font-bold leading-tight text-[#212131] sm:text-4xl md:text-[50px] md:leading-[1.2] md:tracking-normal">
							Select your product
						</h1>
					</div>
					<div className="my-16 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
						{categories.edges.map((collection) => (
							<Link
								key={collection.node.id}
								href={`/${channel}/catalog/${collection.node.slug}`}
								className="group block"
							>
								<div className="relative flex h-auto w-full flex-col overflow-hidden rounded-lg bg-gray-100 shadow-lg sm:rounded-2xl">
									<div className="relative aspect-[4/3] sm:aspect-square">
										{collection.node.backgroundImage?.url ? (
											<>
												<Image
													src={collection.node.backgroundImage.url}
													// src={`/images/Fleece.png`}
													alt={collection.node.backgroundImage.alt || collection.node.name}
													fill
													className="object-cover brightness-90 transition-all duration-700 group-hover:scale-110 group-hover:brightness-100"
													sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 25vw"
													priority={true}
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
											</>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
												<span className="text-lg text-gray-500 sm:text-xl">No image available</span>
											</div>
										)}
									</div>
									<div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
										<h2 className="text-lg font-bold text-white sm:text-xl md:text-2xl">
											{collection.node.name}
										</h2>
										<div className="mt-1 h-1 w-10 bg-emerald-400 transition-all duration-300 group-hover:w-16 sm:mt-2 sm:w-12 sm:group-hover:w-24" />
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</Wrapper>
			{/* <div className="flex h-[196px] w-full flex-col gap-[10px] bg-[#263246] pb-[64px] pl-[120px] pr-[120px] pt-[64px]">
				<Wrapper>
					<div className="flex w-full flex-row items-center justify-between">
						<h2 className="h-[68px] w-[327px] font-bold text-[24px] leading-[1.4] tracking-normal text-white">
							Join Our{" "}
							<span className="font-bold text-[24px] leading-[1.4] tracking-normal text-[#FD8C6F]">
								Newsletter
							</span>{" "}
							to Keep Up To Date With Us!
						</h2>
						<div className="flex items-center gap-2 justify-between">
							<input
								placeholder="Enter your Email"
								className="w-[324px] h-[50px] gap-[10px] pt-[10px] pr-[32px] pb-[10px] pl-[32px] rounded-[8px] bg-white"
							/>
							<button
								className="w-[183px] h-[49px] gap-[10px] pt-[20px] pr-[38px] pb-[20px] pl-[38px] rounded-[8px] bg-[#8B3958] flex items-center justify-center shadow-[0px_8px_24px_0px_#FD8C6F40]"
							>
								Subscribe
							</button>
						</div>
					</div>
				</Wrapper>
			</div> */}
		</>
	);
}

export default CatalogPage;
