"use client";

import { useTransition } from "react";
import { deleteLineFromCheckout } from "./actions";
import { Trash ,Loader} from "lucide-react";
 

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
			className="text-sm text-neutral-500 hover:text-neutral-900 "
			onClick={() => {
				if (isPending) return;
				startTransition(() => {
					deleteLineFromCheckout({ lineId, checkoutId })
					onRemove?.();
				});
			}}
			aria-disabled={isPending}
		>
			{isPending ? <Loader className="w-10 h-10 spin" /> : <Trash  className="w-7 h-7 text-red-500"/>}
			<span className="sr-only">line from cart</span>
		</button>
	);
};
