"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

const companyName = "ZOOM PRINT";

export const Logo = () => {
	const pathname = usePathname();

	if (pathname === "/") {
		return (
			<h1 className="flex items-center font-bold text-white" aria-label="homepage">
				{companyName}
			</h1>
		);
	}

	return (
		<div className="flex items-center font-bold">
			<LinkWithChannel aria-label="homepage" href="/" className="flex items-center gap-2 relative md:w-full">
				<Image src="/images/main-logo.webp" alt="SwiftPod Logo" width={120} height={75} />
			</LinkWithChannel>
		</div>
	);
};
