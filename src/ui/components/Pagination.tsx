import clsx from "clsx";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

export async function Pagination({
	pageInfo,
}: {
	pageInfo: {
		basePathname: string;
		currentPage: number;
		totalCount: number;
		itemsPerPage: number;
		urlSearchParams?: URLSearchParams;
	};
}) {
	const { basePathname, currentPage, totalCount, itemsPerPage, urlSearchParams } = pageInfo;

	const totalPages = Math.ceil(totalCount / itemsPerPage);

	
	// Tạo URL với tham số page
	const createPageUrl = (page: number) => {
		const params = new URLSearchParams(urlSearchParams?.toString() || "");
		params.set("page", page.toString());
		return `${basePathname}?${params.toString()}`;
	};
	console.log(createPageUrl(1));
	return (
		<nav className="flex items-center justify-center gap-x-2 px-4 pt-12">
			{/* Prev Button */}
			<LinkWithChannel
				href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
				className={clsx("px-3 py-2 text-sm font-medium", {
					"rounded bg-neutral-900 text-white hover:bg-neutral-800": currentPage > 1,
					"cursor-not-allowed text-neutral-400 pointer-events-none": currentPage <= 1,
				})}
				aria-disabled={currentPage <= 1}
			>
				Prev
			</LinkWithChannel>

			{/* Page Numbers */}
			{Array.from({ length: totalPages }).map((_, index) => {
				const page = index + 1;
				return (
					<LinkWithChannel
						key={page}
						href={createPageUrl(page)}
						className={clsx(
							"px-3 py-2 text-sm font-medium rounded",
							page === currentPage
								? "bg-neutral-900 text-white"
								: "text-neutral-700 hover:bg-neutral-200"
						)}
						aria-current={page === currentPage ? "page" : undefined}
					>
						{page}
					</LinkWithChannel>
				);
			})}

			{/* Next Button */}
			<LinkWithChannel
				href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
				className={clsx("px-3 py-2 text-sm font-medium", {
					"rounded bg-neutral-900 text-white hover:bg-neutral-800": currentPage < totalPages,
					"cursor-not-allowed text-neutral-400 pointer-events-none": currentPage >= totalPages,
				})}
				aria-disabled={currentPage >= totalPages}
			>
				Next
			</LinkWithChannel>
		</nav>
	);
}
