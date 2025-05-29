import { type ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export const ErrorContentWrapper = ({ children }: Props) => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			{children}
		</div>
	);
};
