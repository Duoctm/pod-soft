"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { requestPasswordResetOnServer } from "./actions/reset";

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Please enter your email"),
  });

  const handleSubmit = async (values: { email: string }) => {
    setIsSubmitting(true);
    try {
      const redirectUrl = `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/default-channel/confirm-password`;
      
      const result = await requestPasswordResetOnServer(
        values.email,
        params.channel as string,
        redirectUrl
      );

      const errors = result.errors;
      if (errors && errors.length > 0) {
        errors.forEach((error: { message: string }) => {
          toast.error(error.message);
        });
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      toast.success("Password reset email has been sent!");
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Forgot Password</h2>

        {submitted ? (
          <p className="text-center text-green-600">
            If the email exists in our system, you will receive instructions to reset your password.
          </p>
        ) : (
          <Formik initialValues={{ email: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {() => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={clsx(
                      "mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1",
                      "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}
