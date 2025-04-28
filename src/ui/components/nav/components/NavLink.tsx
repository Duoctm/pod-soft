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
				className={clsx(
					"inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
					isActive
						? "bg-[#FD8C6E] text-white" // Active link: Coral background, white text
						: "text-back hover:text-[#FD8C6E]", // Inactive: white text, coral on hover
				)}
			>
				{children}
			</LinkWithChannel>
		</li>
	);
}
