"use client";

import { useTransition } from "react";
import { Loader } from "lucide-react";
import { deleteLineFromCheckout } from "./actions";

type Props = {
	lineId: string;
	checkoutId: string;
	onRemove?: () => void;
};

export const DeleteLineButton = ({ lineId, checkoutId, onRemove }: Props) => {
	const [isPending, startTransition] = useTransition();

	return (
		<button
			type="button"
			disabled={isPending}
			// className="flex text-sm font-semibold bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded-md"
			onClick={() => {
				if (isPending) return;
				startTransition(() => {
					void deleteLineFromCheckout({ lineId, checkoutId });
					onRemove?.();
				});
			}}
			aria-disabled={isPending}
		>
			{isPending ? (
				<Loader className="spin h-10 w-10" />
			) : (
				<span
		 			className="text-sm md:text-blue-500 md:underline md:font-medium  border md:border-none py-1 border-black bg-white  px-2 rounded-full"
					// className="flex text-sm font-semibold bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded-md"
				>
					Delete
				</span>
			)}
			<span className="sr-only">line from cart</span>
		</button>
	);
};
