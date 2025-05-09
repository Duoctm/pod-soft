"use client";

import { Suspense } from "react";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { setPasswordOnServer } from "./actions/server";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS

const validationSchema = Yup.object({
	password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password")], "Passwords must match")
		.required("Confirm password is required"),
});

function ConfirmPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const email = searchParams.get("email");
	const token = searchParams.get("token");

	if (!email || !token) {
		return (
			<div className="mx-auto mt-16 flex h-[60vh] w-full max-w-lg flex-col items-center justify-center">
				<div className="text-red-500">Invalid password reset link. Please request a new one.</div>
			</div>
		);
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const formik = useFormik({
		initialValues: {
			password: "",
			confirmPassword: "",
		},
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			try {
				const result = await setPasswordOnServer(email, token, values.password);

				const errors = result.errors;
				if (errors && errors.length > 0) {
					errors.forEach((error: { message: string }) => {
						toast.error(error.message);
					});
					return;
				}

				// Show success toast with a longer duration
				toast.success("Password updated successfully!", {
					position: "top-center",
					autoClose: 3000, // 3 seconds
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});

				// Delay redirect to allow toast to be seen
				setTimeout(() => {
					router.push("/default-channel/login");
				}, 2000);
			} catch (err) {
				toast.error("An error occurred. Please try again.");
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<div className="mx-auto mt-16 flex h-[60vh] w-full max-w-lg flex-col items-center justify-center">
			{/* Add ToastContainer to render the toasts */}
			<ToastContainer />

			<form className="w-full max-w-5xl rounded border p-8 shadow-md" onSubmit={formik.handleSubmit}>
				<h1 className="mb-6 text-2xl font-bold text-neutral-800">Set New Password</h1>

				<div className="mb-4">
					<label className="sr-only" htmlFor="password">
						New Password
					</label>
					<input
						type="password"
						id="password"
						{...formik.getFieldProps("password")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2",
							formik.touched.password && formik.errors.password && "border-red-500",
						)}
						placeholder="New Password"
					/>
					{formik.touched.password && formik.errors.password && (
						<div className="mt-1 text-sm text-red-500">{formik.errors.password}</div>
					)}
				</div>

				<div className="mb-6">
					<label className="sr-only" htmlFor="confirmPassword">
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						{...formik.getFieldProps("confirmPassword")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2",
							formik.touched.confirmPassword && formik.errors.confirmPassword && "border-red-500",
						)}
						placeholder="Confirm Password"
					/>
					{formik.touched.confirmPassword && formik.errors.confirmPassword && (
						<div className="mt-1 text-sm text-red-500">{formik.errors.confirmPassword}</div>
					)}
				</div>

				<button
					type="submit"
					disabled={formik.isSubmitting}
					className="flex w-full items-center justify-center rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{formik.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Updating...
						</>
					) : (
						"Confirm Password"
					)}
				</button>
			</form>
		</div>
	);
}

export default function ConfirmPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-col items-center justify-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
				</div>
			}
		>
			<ConfirmPasswordContent />
		</Suspense>
	);
}
