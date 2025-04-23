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
					isActive
						? "rounded-md bg-slate-300/80 px-4 py-2 text-black"
						: "border-transparent text-black",
					"inline-flex items-center  text-sm font-medium",
				)}
			>
				{children}
			</LinkWithChannel>
		</li>
	);
}
