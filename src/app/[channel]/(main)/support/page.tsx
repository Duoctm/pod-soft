import React, { Suspense } from "react";
import { SupportPage } from "./SupportPage";

export default function Page({
	params,
}: {
	params: {
		channel: string;
	};
}) {
	return (
		<Suspense fallback={<div></div>}>
			<SupportPage channel={params.channel} />
		</Suspense>
	);
}
