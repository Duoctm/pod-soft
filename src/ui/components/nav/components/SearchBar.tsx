import { redirect } from "next/navigation";
import { SearchIcon } from "lucide-react";

export const SearchBar = ({ channel }: { channel: string }) => {
	async function onSubmit(formData: FormData) {
		"use server";
		const search = formData.get("search") as string;
		if (search && search.trim().length > 0) {
			redirect(`/${encodeURIComponent(channel)}/search?query=${encodeURIComponent(search)}`);
		}
	}

	return (
		<form
			action={onSubmit}
			className="group relative my-2 hidden sm:flex w-full items-center justify-center text-sm"
		>
			<button
				type="submit"
				className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-500 hover:text-neutral-700 focus:text-neutral-700"
				aria-label="search for products"
			>
				<SearchIcon className="h-5 w-5" />
			</button>
			<input 
				type="text" 
				name="search" 
				className="hidden" 
				defaultValue=" " 
				required
			/>
		</form>
	);
};
