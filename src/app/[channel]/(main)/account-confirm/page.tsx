"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmAccountOnServer } from "./actions/confirm";

function ConfirmContent() {
	const [secondsLeft, setSecondsLeft] = useState(10);
	const [confirmStatus, setConfirmStatus] = useState<"loading" | "success" | "error">("loading");
	const [errorMessage, setErrorMessage] = useState("");

	const router = useRouter();
	const searchParams = useSearchParams();

	const email = searchParams.get("email");
	const token = searchParams.get("token");

	useEffect(() => {
		if (!email || !token) return;

		(async () => {
			try {
				const res = await confirmAccountOnServer(decodeURIComponent(email), token);
				if (res.errors.length === 0) {
					setConfirmStatus("success");
				} else {
					setConfirmStatus("error");
					setErrorMessage(res.errors.map((e: any) => e.message).join(", "));
				}
			} catch (err) {
				setConfirmStatus("error");
				setErrorMessage("Server error");
			}
		})();
	}, [searchParams]);

	// Countdown & redirect
	useEffect(() => {
		if (secondsLeft === 0 && confirmStatus === "success") {
			router.push("/default-channel/login");
		}

		const timer = setTimeout(() => {
			setSecondsLeft((prev) => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [secondsLeft, confirmStatus, router]);

	const handleImmediateRedirect = () => {
		router.push("/default-channel/login");
	};

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
				{confirmStatus === "loading" && (
					<div className="flex flex-col items-center justify-center">
						<div className="mb-6">
							{/* Spinner xoay */}
							<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
						</div>
						<h1 className="text-2xl font-semibold text-gray-600">Verifying your account...</h1>
					</div>
				)}

				{confirmStatus === "success" && (
					<>
						<h1 className="mb-6 text-2xl font-bold text-green-600">Account confirmed successfully!</h1>
						<div className="relative h-32 w-32">
							<svg className="absolute left-0 top-0 h-full w-full" viewBox="0 0 36 36">
								<path
									className="text-gray-300"
									stroke="currentColor"
									strokeWidth="3"
									fill="none"
									d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
								/>
								<path
									className="text-green-500"
									stroke="currentColor"
									strokeWidth="3"
									fill="none"
									strokeDasharray={`${(secondsLeft / 10) * 100}, 100`}
									d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-gray-700">
								{secondsLeft}
							</div>
						</div>
						<p className="mt-4 text-gray-500">Redirecting to login page in {secondsLeft} seconds...</p>
						<button
							onClick={handleImmediateRedirect}
							className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Back to Login
						</button>
					</>
				)}

				{confirmStatus === "error" && (
					<>
						<h1 className="mb-4 text-2xl font-bold text-red-600">Account confirmation failed</h1>
						<p className="text-red-500">{errorMessage}</p>
						<button
							onClick={handleImmediateRedirect}
							className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Back to Login
						</button>
					</>
				)}
			</div>
		</Suspense>
	);
}

export default function ConfirmPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-col items-center justify-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
				</div>
			}
		>
			<ConfirmContent />
		</Suspense>
	);
}
