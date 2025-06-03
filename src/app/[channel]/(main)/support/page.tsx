import React, { Suspense } from "react";
import { SupportPage } from "./SupportPage";

export default function Page() {
	return (
		<Suspense fallback={<div></div>}>
			<SupportPage />
		</Suspense>
	);
}
