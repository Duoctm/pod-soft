"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { requestEmailConfirmation } from "./server-action/requestEmailConfirmation";

// Validation schema using Yup for form validation
const ResendEmailSchema = Yup.object().shape({
	email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ResendConfirmationEmailFormPage({ params }: { params: { channel: string } }) {
	const [isLoading, setIsLoading] = useState(false);
	const [serverError, setServerError] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (
		values: { email: string },
		{ setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
	) => {
		setIsLoading(true);
		setServerError("");
		setIsSuccess(false);

		try {
			const response = await requestEmailConfirmation({
				email: values.email,
				redirectUrl: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/default-channel/account-confirm`,
				channel: params.channel,
			});

			if (response.requestEmailConfirmation?.errors?.length) {
				response.requestEmailConfirmation?.errors?.forEach((error) => {
					toast.error(error.message);
				});
				throw new Error("Failed to resend email. Please try again later.");
			} else {
				setIsSuccess(true);
			}
		} catch (error: unknown) {
			setServerError(error instanceof Error ? error.message : "An unexpected error occurred");
		} finally {
			resetForm();
			setIsLoading(false);
			setSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-white p-4 font-sans">
			<div className="w-full max-w-lg space-y-6 rounded-xl bg-white p-8 shadow-2xl">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-slate-800">Resend Confirmation Email</h1>
					<p className="mt-2 text-sm text-slate-600">
						Didn&apos;t receive your email? Enter your email address below and we&apos;ll send it again.
					</p>
				</div>
				<ToastContainer
					position="top-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>
				<Formik initialValues={{ email: "" }} validationSchema={ResendEmailSchema} onSubmit={handleSubmit}>
					{({ errors, touched, isSubmitting }) => (
						<Form className="space-y-6">
							<div>
								<label htmlFor="email" className="sr-only block text-sm font-medium text-slate-700">
									Email Address
								</label>
								<div className="relative mt-1 rounded-md shadow-sm">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
									</div>
									<Field
										id="email"
										name="email"
										type="email"
										placeholder="your.email@example.com"
										className={`block w-full rounded-md border-slate-300 py-3 pl-10 text-slate-900 placeholder-slate-400 transition duration-150 ease-in-out focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
											errors.email && touched.email
												? "border-red-500 focus:border-red-500 focus:ring-red-500"
												: "border-slate-300"
										}`}
										disabled={isLoading || isSubmitting} // Disable khi isLoading hoặc Formik isSubmitting
									/>
								</div>
								<ErrorMessage name="email" component="div" className="mt-1 text-xs text-red-600" />
							</div>

							{/* Hiển thị lỗi từ server */}
							{serverError && (
								<div className="rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700">
									{serverError}
								</div>
							)}

							{/* Hiển thị thông báo thành công */}
							{isSuccess && !serverError && (
								<div className="rounded-md border border-green-200 bg-green-100 p-3 text-sm text-green-700">
									Confirmation email has been resent successfully! Please check your inbox (and spam folder).
								</div>
							)}

							<div>
								<button
									type="submit"
									disabled={isLoading || isSubmitting} // Disable khi isLoading hoặc Formik isSubmitting
									className="flex w-full items-center justify-center rounded-md border border-transparent bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{isLoading || isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										"Resend Email"
									)}
								</button>
							</div>
						</Form>
					)}
				</Formik>
				<p className="mt-6 text-center text-xs text-slate-500">
					If you still don&apos;t receive the email, please check your spam folder or contact support.
				</p>
			</div>
		</div>
	);
}
