"use client";
import React from "react";
import { useMutation } from "urql";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const CREATE_SUPPORT = `
  mutation CreateSupport($input: SupportInput!) {
    createSupport(input: $input) {
      success
      message
    }
  }
`;

interface FormData {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	company: string;
	address: string;
	details: string;
}

const validationSchema = Yup.object().shape({
	firstName: Yup.string().required("First name is required"),
	lastName: Yup.string().required("Last name is required"),
	email: Yup.string().email("Invalid email address").required("Email is required"),
	phoneNumber: Yup.string()
		.matches(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number")
		.required("Phone number is required"),
	company: Yup.string().required("Company name is required"),
	address: Yup.string().required("Address is required"),
	details: Yup.string().required("Details are required"),
});

const initialValues: FormData = {
	firstName: "",
	lastName: "",
	email: "",
	phoneNumber: "",
	company: "",
	address: "",
	details: ""
};

const SupportPage = () => {
	const [{ fetching }, createSupport] = useMutation(CREATE_SUPPORT);

	const handleSubmit = async (values: FormData, { resetForm }: any) => {
		try {
			console.log("Sending request with values:", values);
			const { data, error } = await createSupport({
				input: {
					firstName: values.firstName,
					lastName: values.lastName,
					email: values.email,
					phoneNumber: values.phoneNumber,
					company: values.company,
					address: values.address,
					details: values.details
				},
			});
			console.log("Response data:", data);
			console.log("Response error:", error);

			if (data?.createSupport?.success) {
				resetForm();
				alert("Your support request has been submitted successfully!");
			} else {
				alert(data?.createSupport?.message || "Failed to submit support request. Please try again.");
			}
		} catch (err) {
			console.error("Error submitting support request:", err);
			alert("An error occurred while submitting your request. Please try again.");
		}
	};

	return (
		<div className="mx-auto max-w-7xl p-8 pb-16">
			<div className="flex flex-col items-center justify-center">
				<h2 className="mb-8 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
					Support
				</h2>
				<Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
					{({ errors, touched }) => (
						<Form className="w-full max-w-2xl space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div>
									<label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
										First Name
									</label>
									<Field
										type="text"
										id="firstName"
										name="firstName"
										className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
									/>
									{errors.firstName && touched.firstName && (
										<div className="mt-1 text-sm text-red-600">{errors.firstName}</div>
									)}
								</div>
								<div>
									<label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
										Last Name
									</label>
									<Field
										type="text"
										id="lastName"
										name="lastName"
										className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
									/>
									{errors.lastName && touched.lastName && (
										<div className="mt-1 text-sm text-red-600">{errors.lastName}</div>
									)}
								</div>
							</div>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700">
									Email
								</label>
								<Field
									type="email"
									id="email"
									name="email"
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
								/>
								{errors.email && touched.email && (
									<div className="mt-1 text-sm text-red-600">{errors.email}</div>
								)}
							</div>
							<div>
								<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
									Phone Number
								</label>
								<Field
									type="text"
									id="phoneNumber"
									name="phoneNumber"
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
								/>
								{errors.phoneNumber && touched.phoneNumber && (
									<div className="mt-1 text-sm text-red-600">{errors.phoneNumber}</div>
								)}
							</div>
							<div>
								<label htmlFor="company" className="block text-sm font-medium text-gray-700">
									Company
								</label>
								<Field
									type="text"
									id="company"
									name="company"
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
								/>
								{errors.company && touched.company && (
									<div className="mt-1 text-sm text-red-600">{errors.company}</div>
								)}
							</div>
							<div>
								<label htmlFor="address" className="block text-sm font-medium text-gray-700">
									Address
								</label>
								<Field
									type="text"
									id="address"
									name="address"
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
								/>
								{errors.address && touched.address && (
									<div className="mt-1 text-sm text-red-600">{errors.address}</div>
								)}
							</div>
							<div>
								<label htmlFor="details" className="block text-sm font-medium text-gray-700">
									Details
								</label>
								<Field
									as="textarea"
									id="details"
									name="details"
									rows={4}
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
								/>
								{errors.details && touched.details && (
									<div className="mt-1 text-sm text-red-600">{errors.details}</div>
								)}
							</div>
							<div>
								<button
									type="submit"
									disabled={fetching}
									className="w-full rounded-md bg-slate-600 px-4 py-2 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
								>
									{fetching ? "Submitting..." : "Submit"}
								</button>
							</div>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
};

export default SupportPage;
