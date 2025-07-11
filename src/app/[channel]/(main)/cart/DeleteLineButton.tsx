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
			onClick={() => {
				if (isPending) return;
				startTransition(() => {
					void deleteLineFromCheckout({ lineId, checkoutId });
					onRemove?.();
				});
			}}
			className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			aria-disabled={isPending}
		>
			{isPending ? (
				<Loader className="w-4 h-4 animate-spin" />
			) : (
				"Delete"
			)}
			<span className="sr-only">line from cart</span>
		</button>
	);
};
