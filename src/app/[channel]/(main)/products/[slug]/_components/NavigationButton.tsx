import React from "react";

interface NavigationButtonProps {
	direction: "prev" | "next";
	onClick: () => void;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({ direction, onClick }) => {
	const label = direction === "prev" ? "Previous" : "Next";
	const icon = direction === "prev" ? "\u276E" : "\u276F";
	const position = direction === "prev" ? "left-2" : "right-2";

	return (
		<button
			onClick={onClick}
			aria-label={`${label} image`}
			className={`absolute ${position} top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/70 text-xl text-gray-700 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 md:h-12 md:w-12`}
		>
			{icon}
		</button>
	);
};
