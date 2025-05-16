"use client";

import clsx from "clsx";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import useSelectedPathname from "@/hooks/useSelectedPathname";

export function NavLink({ href, children }: { href: string; children: JSX.Element | string }) {
	const pathname = useSelectedPathname();
	const isActive = pathname === href;

	return (
		<li className="flex items-center justify-center">
			<LinkWithChannel
				href={href}
				scroll={false}
				className={clsx(
					"space-x-[2%] text-sm leading-[100%] text-[#424255]",
					isActive
						? "font-bold text-[#ED806B]" // Active link: Coral background, white text
						: "font-medium text-[#424255]", // Inactive: white text, coral on hover
				)}
			>
				{children}
			</LinkWithChannel>
		</li>
	);
}
