import { type ReactNode } from "react";
import { AuthProvider } from "@/ui/components/AuthProvider";

export const metadata = {
	title: "ZoomPrint",
	description: "ZoomPrint is your gateway to rapid fast fulfillment minus the steep investment.",
};

export default function RootLayout(props: { children: ReactNode }) {
	return (
		<main>
			<AuthProvider>{props.children}</AuthProvider>
		</main>
	);
}
