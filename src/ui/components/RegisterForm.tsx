"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import clsx from "clsx";
import { registerAccount } from "@/actions/register";
import { Loader2, Eye, EyeOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
	firstName: Yup.string().required("First name is required"),
	lastName: Yup.string().required("Last name is required"),
	email: Yup.string().email("Invalid email").required("Email is required"),
	password: Yup.string()
		.min(8, "Password must be at least 8 characters")
		.matches(/[a-z]/, "Password must contain at least one lowercase letter")
		.matches(/[A-Z]/, "Password must contain at least one uppercase letter")
		.matches(/\d/, "Password must contain at least one number")
		.required("Password is required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password")], "Passwords must match")
		.required("Confirm password is required"),
});

export default function RegisterForm() {
	const [isClient, setIsClient] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setIsClient(true);
	}, []);

	const formik = useFormik({
		initialValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validationSchema,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const { confirmPassword, ...submitValues } = values;
				const result = await registerAccount(submitValues);

				if (result.success) {
					toast.success(
						"Registration successful! Please check your email inbox or spam folder to confirm your account",
					);
					resetForm();
					setTimeout(() => {
						router.push("/default-channel/login");
					}, 1000);
				} else if (result.errors && result.errors.length > 0) {
					result.errors.forEach((error: { message: string }) => {
						toast.error(error.message);
					});
				}
			} catch (error) {
				console.error("Registration failed:", error);
				toast.error("Registration failed. Please try again.");
			} finally {
				setSubmitting(false);
			}
		},
	});

	if (!isClient) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
			</div>
		);
	}

	return (
		<div className="mx-auto mt-16 flex h-[60vh] w-full max-w-lg flex-col items-center justify-center">
			<ToastContainer position="top-right" />
			<form className="max-5xl w-full rounded border p-8 shadow-md" onSubmit={formik.handleSubmit}>
				<h1 className="mb-6 text-2xl font-bold text-neutral-800">Register</h1>

				<div className="mb-2">
					<input
						type="text"
						placeholder="First Name"
						{...formik.getFieldProps("firstName")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2",
							formik.touched.firstName && formik.errors.firstName && "border-red-500",
						)}
					/>
					{formik.touched.firstName && formik.errors.firstName && (
						<div className="mt-1 text-sm text-red-500">{formik.errors.firstName}</div>
					)}
				</div>

				<div className="mb-2">
					<input
						type="text"
						placeholder="Last Name"
						{...formik.getFieldProps("lastName")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2",
							formik.touched.lastName && formik.errors.lastName && "border-red-500",
						)}
					/>
					{formik.touched.lastName && formik.errors.lastName && (
						<div className="mt-1 text-sm text-red-500">{formik.errors.lastName}</div>
					)}
				</div>

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

				<div className="relative mb-2">
					<input
						type={showPassword ? "text" : "password"}
						placeholder="Password"
						autoCapitalize="off"
						autoComplete="off"
						{...formik.getFieldProps("password")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2",
							formik.touched.password && formik.errors.password && "border-red-500",
						)}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-3 top-2.5 text-neutral-500"
					>
						{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
					{formik.touched.password && formik.errors.password && (
						<div className="mt-1 text-sm text-red-500">{formik.errors.password}</div>
					)}
				</div>

				<div className="relative mb-4">
					<input
						type={showConfirmPassword ? "text" : "password"}
						placeholder="Confirm Password"
						autoCapitalize="off"
						autoComplete="off"
						{...formik.getFieldProps("confirmPassword")}
						className={clsx(
							"w-full rounded border bg-neutral-50 px-4 py-2",
							formik.touched.confirmPassword && formik.errors.confirmPassword && "border-red-500",
						)}
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						className="absolute right-3 top-2.5 text-neutral-500"
					>
						{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
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
							Registering...
						</>
					) : (
						"Register"
					)}
				</button>
			</form>

			<div className="mt-4 text-center">
				<p className="text-sm text-neutral-500">
					Already have an account?{" "}
					<a
						href="/default-channel/login"
						className="font-medium text-neutral-800 underline hover:text-neutral-600"
					>
						Log in
					</a>
				</p>
			</div>
		</div>
	);
}
