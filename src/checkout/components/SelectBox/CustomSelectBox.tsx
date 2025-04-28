import clsx from "clsx";
import { type HTMLAttributes } from "react";
import { useField } from "formik";
import { type Children, type Classes } from "@/checkout/lib/globalTypes";

export interface SelectBoxProps<TFieldName extends string>
	extends Classes,
		Children,
		Omit<HTMLAttributes<HTMLInputElement>, "children"> {
	disabled?: boolean;
	name: TFieldName;
	value: string;
    handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SelectBox = <TFieldName extends string>({
	children,
	className,
	disabled = false,
	name,
	value,
    handleChange,
}: SelectBoxProps<TFieldName>) => {
	// const { values } = useFormContext<Record<TFieldName, string>>();
	const [field] = useField(name);
	// const selected = values[name] === value;
	const selected = true;

	return (
		<label
			className={clsx(
				"relative mb-2 flex cursor-pointer flex-row items-center justify-start rounded border border-neutral-400 px-3 py-2",
				"hover:border hover:border-neutral-500",
				{ "border border-neutral-500": selected, "pointer-events-none hover:border-neutral-400": disabled },
				className,
			)}
		>
			<input
				type="radio"
				{...field}
				onChange={handleChange}
				value={value}
				checked={selected}
				className="rounded-full border-neutral-300 text-neutral-600 shadow-sm focus:border-neutral-300 focus:ring focus:ring-neutral-200 focus:ring-opacity-50 focus:ring-offset-0"
			/>
			<span className="ml-2 block w-full">{children}</span>
		</label>
	);
};
