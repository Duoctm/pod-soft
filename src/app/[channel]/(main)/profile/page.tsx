"use client";

import React, { Fragment, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Dialog, Tab, Transition } from "@headlessui/react";

import {
	currentUser,
	updateAddress,
	updateCurentAddress,
	updatePassword,
	type UpdatePassWordType,
	updateUser,
} from "./actions/update-profile";
import { type CustomUserQuery } from "@/gql/graphql";
import "react-toastify/dist/ReactToastify.css";
import { getCountryList } from "@/checkout/hooks/useCountryList";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import Wrapper from "@/ui/components/wrapper";
import { cn } from "@/lib/utils";

type UserType = CustomUserQuery["me"];
type Address = NonNullable<CustomUserQuery["me"]>["addresses"][number];

const ProfilePage = ({ params }: { params: { channel: string } }) => {
	const { channel } = params;

	const [user, setUser] = React.useState<UserType | null>(null);
	const [address, setAddress] = React.useState<Address | null>(null);
	const [showNewPassword, setShowNewPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const [countries, setCountries] = React.useState<{ code: string; country: string }[]>([]);
	const [country, setCountry] = React.useState<{ country: string; code: string }>({ country: "", code: "" });
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isOpenEditProfile, setIsOpenEditProfile] = useState<boolean>(false);
	const [isOpenEditAddress, setIsOpenAddress] = useState<boolean>(false);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await currentUser();
			const data = await getCountryList({ slug: channel });
			if (data) {
				setCountries(data.map(({ country, code }) => ({ code, country })));
			}

			if (user) {
				console.log(user);
				setUser(user as unknown as UserType);
				setAddress(user?.addresses[0] as unknown as Address);
				if (user.addresses.length > 0)
					setCountry((user?.addresses[0]?.country as { country: string; code: string }) || country);
			}
		};
		void fetchUser();
	}, []);

	const handleChange = (event: SelectChangeEvent) => {
		const selectedCode = event.target.value;
		const selectedCountry = countries.find((c) => c.code === selectedCode) || { country: "", code: "" };
		setCountry(selectedCountry);
	};

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
			const res = await updatePassword(values as unknown as UpdatePassWordType);
			if (res) {
				toast.success("Password updated successfully");
				formik.resetForm();
				setIsOpen(false);
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
			const addressID = address?.id;
			const payload = {
				firstName: user?.firstName || "",
				lastName: user?.lastName || "",
				companyName: values.companyName,
				city: values.city,
				streetAddress1: values.streetAddress1,
				country: country,
			};
			if (addressID) {
				const res = await updateCurentAddress(addressID, payload);
				if (res) {
					toast.success("Company info updated successfully");
					setAddress((prev) => (prev ? { ...prev, ...payload } : prev));
					resetForm();
				}
			} else {
				const res = await updateAddress(payload);
				if (res) {
					toast.success("Company info updated successfully");
					setAddress((prev) => (prev ? { ...prev, ...payload } : prev));
					resetForm();
				}
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
			setIsOpenEditProfile(false);
			setSubmitting(false);
		},
	});

	const closeModal = () => {
		setIsOpen(false);
	};

	return (
		<>
			<Wrapper className="min-h-[80vh]">
				<ToastContainer />
				<Tab.Group>
					<div className="flex md:flex-row flex-col gap-4">
						<Tab.List className="flex flex-row space-x-2 overflow-x-auto md:flex-col md:space-x-0 md:space-y-2 md:w-1/4">
							<Tab
								className={({ selected }) =>
									cn(
										"px-4 py-2.5 text-left text-sm font-medium leading-5 whitespace-nowrap",
										"ring-white/60 focus:outline-none",
										selected
											? "border-b-4 md:border-b-0 md:border-l-4 border-blue-700 bg-blue-50 text-blue-700"
											: "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
									)
								}
							>
								User Information
							</Tab>

							<Tab
								className={({ selected }) =>
									cn(
										"px-4 py-2.5 text-left text-sm font-medium leading-5 whitespace-nowrap",
										"ring-white/60 focus:outline-none",
										selected
											? "border-b-4 md:border-b-0 md:border-l-4 border-blue-700 bg-blue-50 text-blue-700"
											: "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
									)
								}
							>
								Address Information
							</Tab>
						</Tab.List>

						<Tab.Panels className="flex-1">
							<Tab.Panel>
								<div className="w-full rounded-lg bg-white p-4 md:p-8 shadow-lg">
									<div className="space-y-4">
										{/* Profile Header */}
										<div className="flex items-center justify-between">
											<h2 className="text-xl md:text-2xl font-bold text-gray-900">Profile Information</h2>
											<button
												onClick={() => setIsOpenEditProfile(true)}
												className="rounded-full bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
											>
												<Pencil className="h-5 w-5" />
											</button>
										</div>

										<div className="flex gap-4 md:gap-8">
											{/* Profile Info List */}
											<div className="flex-1 space-y-4 md:space-y-6">
												<div className="flex flex-col border-b border-gray-200 pb-4">
													<span className="text-sm text-gray-500">Full Name</span>
													<span className="mt-1 text-base font-medium text-gray-900">
														{user?.firstName && user?.lastName
															? `${user.firstName} ${user.lastName}`
															: "Not set"}
													</span>
												</div>

												<div className="flex flex-col border-b border-gray-200 pb-4">
													<span className="text-sm text-gray-500">Email</span>
													<span className="mt-1 text-base font-medium text-gray-900">
														{user?.email || "Not set"}
													</span>
												</div>

												<div className="flex flex-col border-b border-gray-200 pb-4">
													<span className="text-sm text-gray-500">Address</span>
													<span className="mt-1 text-base font-medium text-gray-900">
														{address ? (
															<>
																{address.streetAddress1}
																{address.city && `, ${address.city}`}
																{address.country?.country && `, ${address.country.country}`}
															</>
														) : (
															"Not set"
														)}
													</span>
												</div>
											</div>
										</div>

										{/* Actions */}
										<div className="flex items-center justify-between">
											<button
												type="button"
												onClick={() => setIsOpen(!isOpen)}
												className="text-sm font-medium italic text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
											>
												Change Password
											</button>
										</div>
									</div>
								</div>
							</Tab.Panel>

							<Tab.Panel>
								<div className="w-full rounded-lg bg-white p-4 md:p-8 shadow-lg">
									<div className="space-y-4">
										{/* Address Header */}
										<div className="flex items-center justify-between">
											<h2 className="text-xl md:text-2xl font-bold text-gray-900">Address Information</h2>
											<button
												onClick={() => setIsOpenAddress(true)}
												className="rounded-full bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
											>
												<Pencil className="h-5 w-5" />
											</button>
										</div>

										{/* Address Info List */}
										<div className="flex-1 space-y-4 md:space-y-6">
											<div className="flex flex-col border-b border-gray-200 pb-4">
												<span className="text-sm text-gray-500">Company Name</span>
												<span className="mt-1 text-base font-medium text-gray-900">
													{address?.companyName || "Not set"}
												</span>
											</div>

											<div className="flex flex-col border-b border-gray-200 pb-4">
												<span className="text-sm text-gray-500">Country</span>
												<span className="mt-1 text-base font-medium text-gray-900">
													{address?.country?.country || "Not set"}
												</span>
											</div>

											<div className="flex flex-col border-b border-gray-200 pb-4">
												<span className="text-sm text-gray-500">City</span>
												<span className="mt-1 text-base font-medium text-gray-900">
													{address?.city || "Not set"}
												</span>
											</div>

											<div className="flex flex-col border-b border-gray-200 pb-4">
												<span className="text-sm text-gray-500">Street Address</span>
												<span className="mt-1 text-base font-medium text-gray-900">
													{address?.streetAddress1 || "Not set"}
												</span>
											</div>
										</div>
									</div>
								</div>
							</Tab.Panel>
						</Tab.Panels>
					</div>
				</Tab.Group>
			</Wrapper>

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={closeModal}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
										Change Passwords
									</Dialog.Title>
									<div className="mb-6 h-px bg-gray-200"></div>
									<form className="space-y-4" onSubmit={formik.handleSubmit}>
										<div className="relative">
											<label className="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
											<input
												type="password"
												placeholder="Current Password"
												name="oldPassword"
												value={formik.values.oldPassword}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												required
												className={`peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0  ${
													formik.touched.oldPassword && formik.errors.oldPassword
														? "border-red-500"
														: "border-gray-300"
												}`}
											/>
											{formik.touched.oldPassword && formik.errors.oldPassword && (
												<p className="mt-1 text-sm text-red-600">{formik.errors.oldPassword}</p>
											)}
										</div>
										<div className="relative">
											<label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
											<input
												placeholder="New Password"
												type={showNewPassword ? "text" : "password"}
												name="newPassword"
												value={formik.values.newPassword}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												required
												className={`peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 pr-10 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0  ${
													formik.touched.newPassword && formik.errors.newPassword
														? "border-red-500"
														: "border-gray-300"
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
											<label className="mb-1 block text-sm font-medium text-gray-700">
												Confirm New Password
											</label>
											<input
												placeholder="Confirm New Password"
												type={showConfirmPassword ? "text" : "password"}
												name="confirmPassword"
												value={formik.values.confirmPassword}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												required
												className={`peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 pr-10 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0  ${
													formik.touched.confirmPassword && formik.errors.confirmPassword
														? "border-red-500"
														: "border-gray-300"
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
										<div className="flex justify-end gap-2 pt-2">
											<button
												type="button"
												onClick={() => {
													formik.resetForm();
													closeModal();
												}}
												disabled={formik.isSubmitting}
												className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
											>
												Cancel
											</button>
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
													"Save Changes"
												)}
											</button>
										</div>
									</form>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>

			{/* Edit Profile Modal */}
			<Transition appear show={isOpenEditProfile} as={Fragment}>
				<Dialog as="div" className="relative z-50" onClose={() => setIsOpenEditProfile(false)}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/30" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
									<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
										Edit Profile
									</Dialog.Title>

									<form onSubmit={userFormik.handleSubmit} className="mt-4">
										<div className="space-y-4">
											<div>
												<label className="text-sm font-medium text-gray-700">First Name</label>
												<input
													type="text"
													name="firstName"
													value={userFormik.values.firstName}
													onChange={userFormik.handleChange}
													className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
												/>
											</div>

											<div>
												<label className="text-sm font-medium text-gray-700">Last Name</label>
												<input
													type="text"
													name="lastName"
													value={userFormik.values.lastName}
													onChange={userFormik.handleChange}
													className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
												/>
											</div>
										</div>

										<div className="mt-6 flex justify-end gap-3">
											<button
												type="button"
												onClick={() => setIsOpenEditProfile(false)}
												className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
											>
												Cancel
											</button>
											<button
												type="submit"
												disabled={!userFormik.dirty || userFormik.isSubmitting}
												className={`flex items-center rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 ${
													!userFormik.dirty || userFormik.isSubmitting ? "cursor-not-allowed opacity-70" : ""
												}`}
											>
												{userFormik.isSubmitting ? (
													<>
														<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
														Saving...
													</>
												) : (
													"Save Changes"
												)}
											</button>
										</div>
									</form>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>

			{/* Edit Address Dialog */}
			<Transition appear show={isOpenEditAddress} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={() => setIsOpenAddress(false)}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
										Edit Address Information
									</Dialog.Title>
									<div className="mt-4">
										<form className="space-y-4" onSubmit={companyFormik.handleSubmit}>
											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-700">Company Name</label>
													<input
														type="text"
														name="companyName"
														value={companyFormik.values.companyName}
														onChange={companyFormik.handleChange}
														className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
													/>
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700">Country</label>
													<Select
														value={country.code}
														onChange={handleChange}
														className="mt-1 block h-10 w-full rounded-md border-gray-300"
														variant="outlined"
													>
														{countries.map((option) => (
															<MenuItem key={option.code} value={option.code}>
																{option.country}
															</MenuItem>
														))}
													</Select>
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700">City</label>
													<input
														type="text"
														name="city"
														value={companyFormik.values.city}
														onChange={companyFormik.handleChange}
														className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
													/>
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700">Street Address</label>
													<input
														type="text"
														name="streetAddress1"
														value={companyFormik.values.streetAddress1}
														onChange={companyFormik.handleChange}
														className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
													/>
												</div>
											</div>

											<div className="mt-6 flex justify-end gap-3">
												<button
													type="button"
													onClick={() => {
														companyFormik.resetForm();
														setIsOpenAddress(false);
													}}
													className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
												>
													Cancel
												</button>
												<button
													type="submit"
													disabled={!companyFormik.dirty || companyFormik.isSubmitting}
													className={`flex items-center rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 ${
														!companyFormik.dirty || companyFormik.isSubmitting
															? "cursor-not-allowed opacity-70"
															: ""
													}`}
												>
													{companyFormik.isSubmitting ? (
														<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
													) : null}
													Save Changes
												</button>
											</div>
										</form>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
};

{
	/* <form className="space-y-6" onSubmit={userFormik.handleSubmit}>
<div className="relative">
	<label className="mb-2 block text-base font-semibold text-gray-800">
		Email Address
	</label>
	<input
		type="email"
		value={user?.email || ""}
		disabled
		className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-gray-500"
	/>
</div>

<div className="relative">
	<label className="mb-2 block text-base font-semibold text-gray-800">First Name</label>
	<input
		type="text"
		name="firstName"
		value={userFormik.values.firstName}
		onChange={userFormik.handleChange}
		onBlur={userFormik.handleBlur}
		placeholder="Enter first name"
		className={`peer block w-full rounded-md border px-4 py-3 text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
			userFormik.touched.firstName && userFormik.errors.firstName
				? "border-red-500"
				: "border-gray-300"
		}`}
	/>
	{userFormik.touched.firstName && userFormik.errors.firstName && (
		<p className="mt-2 text-sm text-red-600">{userFormik.errors.firstName}</p>
	)}
</div>

<div className="relative">
	<label className="mb-2 block text-base font-semibold text-gray-800">Last Name</label>
	<input
		type="text"
		name="lastName"
		value={userFormik.values.lastName}
		onChange={userFormik.handleChange}
		onBlur={userFormik.handleBlur}
		placeholder="Enter last name"
		className={`peer block w-full rounded-md border px-4 py-3 text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
			userFormik.touched.lastName && userFormik.errors.lastName
				? "border-red-500"
				: "border-gray-300"
		}`}
	/>
	{userFormik.touched.lastName && userFormik.errors.lastName && (
		<p className="mt-2 text-sm text-red-600">{userFormik.errors.lastName}</p>
	)}
</div>

<div className="flex items-center justify-between pt-4">
	<button
		type="button"
		onClick={() => setIsOpen(!isOpen)}
		className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
	>
		Change Password
	</button>
	<div className="flex items-center gap-3">
		<button
			type="button"
			onClick={() => userFormik.resetForm()}
			disabled={userFormik.isSubmitting}
			className="rounded-md bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
		>
			Cancel
		</button>
		<button
			type="submit"
			disabled={!userFormik.dirty || userFormik.isSubmitting}
			className={`flex items-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
				!userFormik.dirty || userFormik.isSubmitting
					? "cursor-not-allowed opacity-60"
					: ""
			}`}
		>
			{userFormik.isSubmitting ? (
				<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
			) : null}
			Save Changes
		</button>
	</div>
</div>
</form> */
}
export default ProfilePage;
