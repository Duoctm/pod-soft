"use client";
import { SearchIcon } from "lucide-react";
import { redirectSearchPage } from "@/actions/redirect";
import { useState, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";
import Image from "next/image";
import { searchProduct } from "@/app/[channel]/(main)/search/actions/search";
import { ProductsPerPage } from "@/app/config";
import { OrderDirection, ProductListItemFragment, ProductOrderField } from "@/gql/graphql";
import Link from "next/link";

export const SearchBar = ({ channel }: { channel: string }) => {
	const [searchValue, setSearchValue] = useState<string>("");
	const [debouncedValue] = useDebounceValue(searchValue, 500);
	const [isLoading, setIsLoading] = useState(false);
	const [searchResults, setSearchResults] = useState<readonly ProductListItemFragment[]>([]);

	const resetToDefault = () => {
		setSearchValue("");
		setSearchResults([]);
	};

	useEffect(() => {
		const fetchSearchResults = async () => {
			if (!debouncedValue) {
				setSearchResults([]);
				return;
			}

			setIsLoading(true);
			try {
				const products = await searchProduct({
					first: ProductsPerPage,
					after: "",
					search: debouncedValue,
					sortBy: ProductOrderField.Rating,
					sortDirection: OrderDirection.Asc,
					channel: channel,
				});
				if (!products) {
					console.log("");
				}
				const productResult = products?.edges.map((e) => e.node);

				console.log(productResult);
				// Replace with your actual API call
				setSearchResults(productResult?.slice(0, 5) as ProductListItemFragment[]);
			} catch (error) {
				console.error("Search error:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSearchResults();

		setIsLoading(true);
	}, [debouncedValue, channel]);

	async function onSubmit(formData: FormData) {
	redirectSearchPage(formData, channel);
		resetToDefault();
	}

	return (
		<form
			action={onSubmit}
			className="group relative my-2 flex w-full items-center justify-items-center text-sm lg:max-w-[335px]"
			onMouseLeave={resetToDefault}
		>
			<label className="w-full">
				<span className="sr-only">search for products</span>
				<input
					type="text"
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					name="search"
					placeholder="Search for products..."
					autoComplete="on"
					required
					className="h-12 w-full rounded-t-lg border border-[#8B3958] bg-white px-4 py-2 pr-12 text-sm text-black placeholder:text-neutral-500 focus:border-[#8B3958] focus:outline-none focus:ring-2 focus:ring-[#8B3958] focus:ring-opacity-50"
				/>
			</label>

			<div className="absolute inset-y-0 right-0">
				<button
					type="submit"
					className="inline-flex aspect-square w-12 items-center justify-center text-[#8B3958] transition-colors hover:text-[#8B3958]/80 focus:text-[#8B3958]/80 group-invalid:pointer-events-none group-invalid:opacity-80"
				>
					<span className="sr-only">search</span>
					<SearchIcon aria-hidden className="h-5 w-5" />
				</button>
			</div>

			<div className="absolute left-0 right-0 top-full z-50 max-h-[300px] overflow-y-auto rounded-b-lg border border-t-0 border-[#8B3958] bg-white shadow-lg">
				{isLoading && debouncedValue ? (
					<div className="flex items-center justify-center p-4">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8B3958] border-t-transparent"></div>
					</div>
				) : (
					<ul className="divide-y divide-gray-100">
						{searchResults.map((product) => (
							<li key={product.id} className="hover:bg-gray-50">
								<Link href={`/${channel}/search?query=${debouncedValue}`} className="flex items-center gap-4 p-4">
									<div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md relative">
										<Image
											src={product.thumbnail?.url as string}
											alt={product.name}
											fill
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-xs font-medium text-gray-900">{product.name}</p>
										{/* <p className="text-sm text-[#8B3958]">{product.thumbnail?.url}</p> */}
									</div>
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</form>
	);
};
