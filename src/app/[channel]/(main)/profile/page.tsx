"use client";

import React, { useEffect } from "react";
import {
	currentUser,
	updateAddress,
	updatePassword,
	UpdatePassWordType,
	updateUser,
} from "./actions/update-profile";
import { CustomUserQuery } from "@/gql/graphql";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
type UserType = CustomUserQuery["me"];
type Address = NonNullable<CustomUserQuery["me"]>["addresses"][number];

const ProfilePage = () => {
	const [user, setUser] = React.useState<UserType | null>(null);
	const [address, setAddress] = React.useState<Address | null>(null);
	const [showNewPassword, setShowNewPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	useEffect(() => {
		const fetchUser = async () => {
			const user = await currentUser();
			setUser(user as unknown as UserType);
			setAddress(user?.addresses[0] as unknown as Address);
		};
		fetchUser();
	}, []);

	const formik = useFormik({
		initialValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validationSchema: Yup.object({
			oldPassword: Yup.string().required("Current password is required"),
			newPassword: Yup.string().required("New password is required"),
			confirmPassword: Yup.string()
				.oneOf([Yup.ref("newPassword")], "Passwords must match")
				.required("Confirm your new password"),
		}),
		onSubmit: async (values) => {
			console.log("Password change values:", values);
			const res = await updatePassword(values as unknown as UpdatePassWordType);
			if (res) {
				toast.success("Password updated successfully");
				formik.resetForm();
			}
		},
	});

	const companyFormik = useFormik({
		initialValues: {
			city: address?.city || "",
			companyName: address?.companyName || "",
			streetAddress1: address?.streetAddress1 || "",
			country: address?.country || { country: "", code: "" },
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			companyName: Yup.string().required("Company name is required"),
			streetAddress1: Yup.string().required("Address is required"),
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			// TODO: Implement update company logic
			const addressId = address?.id || "";
			const payload = {
				companyName: values.companyName,
				city: values.city,
				streetAddress1: values.streetAddress1,
				country: values.country,
			};
			if (!addressId || !payload) {
				toast.error("Something went wrong");
				return;
			}
			const res = await updateAddress(addressId, payload);
			if (res) {
				toast.success("Company info updated successfully");
				setAddress((prev) => (prev ? { ...prev, ...payload } : prev));
				resetForm();
			}

			setSubmitting(false);
		},
	});

	const userFormik = useFormik({
		initialValues: {
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			firstName: Yup.string().required("First name is required"),
			lastName: Yup.string().required("Last name is required"),
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			const payload = {
				email: user?.email || "",
				firstName: values.firstName,
				lastName: values.lastName,
			};
			const res = await updateUser(payload);

			if (res) {
				toast.success("User info updated successfully");
				setUser((prev) => (prev ? { ...prev, ...payload } : prev));
				resetForm();
			}

			setSubmitting(false);
		},
	});

	return (
		<div className="mx-auto flex min-h-screen flex-1 flex-col items-center px-4  py-8">
			<ToastContainer />
			<div className="mb-6 w-full rounded-lg bg-white p-6 shadow-md">
				<h2 className="mb-4 text-2xl font-semibold text-gray-800">Coparate Account Overview</h2>
				<div className="mb-6 h-px bg-gray-200"></div>
				<form className="space-y-4" onSubmit={companyFormik.handleSubmit}>
					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">Company Name</label>
						<input
							type="text"
							name="companyName"
							value={companyFormik.values.companyName}
							onChange={companyFormik.handleChange}
							onBlur={companyFormik.handleBlur}
							className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								companyFormik.touched.companyName && companyFormik.errors.companyName ? "border-red-500" : ""
							}`}
						/>
						{companyFormik.touched.companyName && companyFormik.errors.companyName && (
							<p className="mt-1 text-sm text-red-600">{companyFormik.errors.companyName}</p>
						)}
					</div>

					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">Country Name</label>
						<input
							type="text"
							name="Country"
							value={companyFormik.values.country.country}
							onChange={companyFormik.handleChange}
							onBlur={companyFormik.handleBlur}
							className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								companyFormik.touched.country?.country && companyFormik.errors.country?.country
									? "border-red-500"
									: ""
							}`}
						/>
						{companyFormik.touched.country?.country && companyFormik.errors.country?.country && (
							<p className="mt-1 text-sm text-red-600">{companyFormik.errors.country.country}</p>
						)}
					</div>

					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">City</label>
						<input
							type="text"
							name="city"
							value={companyFormik.values.city}
							onChange={companyFormik.handleChange}
							onBlur={companyFormik.handleBlur}
							className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								companyFormik.touched.city && companyFormik.errors.city ? "border-red-500" : ""
							}`}
						/>
						{companyFormik.touched.city && companyFormik.errors.city && (
							<p className="mt-1 text-sm text-red-600">{companyFormik.errors.city}</p>
						)}
					</div>

					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
						<input
							type="text"
							name="streetAddress1"
							value={companyFormik.values.streetAddress1}
							onChange={companyFormik.handleChange}
							onBlur={companyFormik.handleBlur}
							className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								companyFormik.touched.streetAddress1 && companyFormik.errors.streetAddress1
									? "border-red-500"
									: ""
							}`}
						/>
						{companyFormik.touched.streetAddress1 && companyFormik.errors.streetAddress1 && (
							<p className="mt-1 text-sm text-red-600">{companyFormik.errors.streetAddress1}</p>
						)}
					</div>
					<div className="flex gap-2 pt-2">
						<button
							type="submit"
							disabled={!companyFormik.dirty || companyFormik.isSubmitting}
							className={`flex items-center rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 ${
								!companyFormik.dirty || companyFormik.isSubmitting ? "cursor-not-allowed opacity-70" : ""
							}`}
						>
							{companyFormik.isSubmitting ? (
								<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
							) : null}
							Save
						</button>
						<button
							type="button"
							onClick={() => companyFormik.resetForm()}
							disabled={companyFormik.isSubmitting}
							className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>

			<div className="mb-6 w-full rounded-lg bg-white p-6 shadow-md">
				<h2 className="mb-4 text-2xl font-semibold text-gray-800">User Details</h2>
				<div className="mb-6 h-px bg-gray-200"></div>
				<form className="space-y-4" onSubmit={userFormik.handleSubmit}>
					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							value={user?.email || ""}
							disabled
							className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500"
						/>
					</div>
					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
						<input
							type="text"
							name="firstName"
							value={userFormik.values.firstName}
							onChange={userFormik.handleChange}
							onBlur={userFormik.handleBlur}
							className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								userFormik.touched.firstName && userFormik.errors.firstName ? "border-red-500" : ""
							}`}
						/>
						{userFormik.touched.firstName && userFormik.errors.firstName && (
							<p className="mt-1 text-sm text-red-600">{userFormik.errors.firstName}</p>
						)}
					</div>
					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
						<input
							type="text"
							name="lastName"
							value={userFormik.values.lastName}
							onChange={userFormik.handleChange}
							onBlur={userFormik.handleBlur}
							className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								userFormik.touched.lastName && userFormik.errors.lastName ? "border-red-500" : ""
							}`}
						/>
						{userFormik.touched.lastName && userFormik.errors.lastName && (
							<p className="mt-1 text-sm text-red-600">{userFormik.errors.lastName}</p>
						)}
					</div>
					<div className="flex gap-2 pt-2">
						<button
							type="submit"
							disabled={!userFormik.dirty || userFormik.isSubmitting}
							className={`flex items-center rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 ${
								!userFormik.dirty || userFormik.isSubmitting ? "cursor-not-allowed opacity-70" : ""
							}`}
						>
							{userFormik.isSubmitting ? (
								<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
							) : null}
							Save
						</button>
						<button
							type="button"
							onClick={() => userFormik.resetForm()}
							disabled={userFormik.isSubmitting}
							className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
			<div className="w-full rounded-lg bg-white p-6 shadow-md">
				<h2 className="mb-4 text-2xl font-semibold text-gray-800">Change Password</h2>
				<div className="mb-6 h-px bg-gray-200"></div>
				<form className="space-y-4" onSubmit={formik.handleSubmit}>
					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
						<input
							type="password"
							name="oldPassword"
							value={formik.values.oldPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							required
							className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								formik.touched.oldPassword && formik.errors.oldPassword ? "border-red-500" : ""
							}`}
						/>
						{formik.touched.oldPassword && formik.errors.oldPassword && (
							<p className="mt-1 text-sm text-red-600">{formik.errors.oldPassword}</p>
						)}
					</div>
					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
						<input
							type={showNewPassword ? "text" : "password"}
							name="newPassword"
							value={formik.values.newPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							required
							className={`w-full rounded-md border border-gray-300 px-4 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								formik.touched.newPassword && formik.errors.newPassword ? "border-red-500" : ""
							}`}
						/>
						<button
							type="button"
							onClick={() => setShowNewPassword((prev) => !prev)}
							className="absolute right-3 top-11 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
							tabIndex={-1}
						>
							{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
						{formik.touched.newPassword && formik.errors.newPassword && (
							<p className="mt-1 text-sm text-red-600">{formik.errors.newPassword}</p>
						)}
					</div>
					<div className="relative">
						<label className="mb-1 block text-sm font-medium text-gray-700">Confirm New Password</label>
						<input
							type={showConfirmPassword ? "text" : "password"}
							name="confirmPassword"
							value={formik.values.confirmPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							required
							className={`w-full rounded-md border border-gray-300 px-4 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
								formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : ""
							}`}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword((prev) => !prev)}
							className="absolute right-3 top-11 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
							tabIndex={-1}
						>
							{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
						{formik.touched.confirmPassword && formik.errors.confirmPassword && (
							<p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
						)}
					</div>
                    <div className="flex gap-2 pt-2">
						<button
							type="submit"
							disabled={!formik.dirty || formik.isSubmitting}
							className={`flex items-center rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 ${
								!formik.dirty || formik.isSubmitting ? "cursor-not-allowed opacity-70" : ""
							}`}
						>
							{formik.isSubmitting ? (
								<>
									<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
									Saving...
								</>
							) : (
								"Save"
							)}
						</button>
						<button
							type="button"
							onClick={() => formik.resetForm()}
							disabled={formik.isSubmitting}
							className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProfilePage;
