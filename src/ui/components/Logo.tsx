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
			<LinkWithChannel aria-label="homepage" href="/" className="flex items-center gap-2">
				<Image src="/images/main-bg.png"  alt="SwiftPod Logo" width={100} height={100} priority />
			</LinkWithChannel>
		</div>
	);
};
