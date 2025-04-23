"use client";

import { Suspense, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signInAction } from "@/actions/login";
import "react-toastify/dist/ReactToastify.css";

const validationSchema = Yup.object({
	email: Yup.string().email("Invalid email").required("Email is required"),
	password: Yup.string().required("Password is required"),
});

function LoginFormContent() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			try {
				const result = await signInAction(values);

				if (result.success) {
					toast.success("Login successful!");
					router.push("/");
				} else if (result.errors && result.errors.length > 0) {
					result.errors.forEach((error: { message: string }) => {
						toast.error(error.message);
					});
				}
			} catch (error) {
				console.error("Login error:", error);
				toast.error("Something went wrong. Please try again.");
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<div className="mx-auto mt-16 flex h-[60vh] w-full max-w-lg flex-col items-center justify-center">
			<ToastContainer />
			<form className="w-full max-w-5xl rounded border p-8 shadow-md" onSubmit={formik.handleSubmit}>
				<h1 className="mb-6 text-2xl font-bold text-neutral-800">Login</h1>

				<div className="mb-2">
					<input
						type="email"
						placeholder="Email"
						{...formik.getFieldProps("email")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2",
							formik.touched.email && formik.errors.email && "border-red-500",
						)}
					/>
					{formik.touched.email && formik.errors.email && (
						<div className="mt-1 text-sm text-red-500">{formik.errors.email}</div>
					)}
				</div>

				<div className="mb-4 relative">
					<input
						type={showPassword ? "text" : "password"}
						placeholder="Password"
						autoCapitalize="off"
						autoComplete="off"
						{...formik.getFieldProps("password")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2 pr-10",
							formik.touched.password && formik.errors.password && "border-red-500",
						)}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
					>
						{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
					{formik.touched.password && formik.errors.password && (
						<div className="mt-1 text-sm text-red-500">{formik.errors.password}</div>
					)}
				</div>

				<Link
					href={"/default-channel/reset-password"}
					className="mt-4 text-sm font-medium text-neutral-800 underline hover:text-neutral-600"
				>
					Forgot your password?
				</Link>

				<button
					type="submit"
					disabled={formik.isSubmitting}
					className="mt-4 flex w-full items-center justify-center rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{formik.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Logging in...
						</>
					) : (
						"Log In"
					)}
				</button>

				<div className="mt-4 text-center">
					<p className="text-sm text-neutral-500">
						Don&apos;t have an account?{" "}
						<Link
							href="/default-channel/register"
							className="font-medium text-neutral-800 underline hover:text-neutral-600"
						>
							Register
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
}

export function LoginForm() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-col items-center justify-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
				</div>
			}
		>
			<LoginFormContent />
		</Suspense>
	);
}
