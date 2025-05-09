import { Suspense } from "react";
import { Loader } from "@/ui/atoms/Loader";
import { LoginForm } from "@/ui/components/LoginForm";

export default function LoginPage({ params }: { params: { channel: string } }) {
	return (
		<Suspense fallback={<Loader />}>
			<section className="mx-auto max-w-7xl p-8">
				<LoginForm params={params} />
			</section>
		</Suspense>
	);
}
