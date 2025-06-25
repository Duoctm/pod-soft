import clsx from "clsx";
import { MenuIcon } from "lucide-react";
import { type HTMLAttributes } from "react";

type Props = {
	onClick: () => void;
} & Pick<HTMLAttributes<HTMLButtonElement>, "aria-controls">;

const version = process.env.NEXT_PUBLIC_UI_VERSION;


export const OpenButton = (props: Props) => {
	return (
		<button
			className={clsx(
				"flex h-8 w-8 flex-col items-center justify-center gap-1.5  self-center md:hidden",
				{
					"text-black": version === "1",
					"text-white": version === "2",
				},
			)}
			aria-controls={props["aria-controls"]}
			aria-expanded={false}
			aria-label="Open menu"
			onClick={props.onClick}
		>
			<MenuIcon className="h-6 w-6 shrink-0" aria-hidden />
		</button>
	);
};
