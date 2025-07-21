import React from "react";
import { type Address } from "@/gql/graphql";

interface AddressCheckoutFormProps {
	shippingAddress: Address;
	openDialog: () => void;
}

const CustomerAddressInfo = ({ shippingAddress, openDialog }: AddressCheckoutFormProps) => {
	return (
		<div className="flex flex-1 flex-col gap-y-4 rounded-lg bg-white p-4 shadow-sm">
			<h3 className="font-medium text-gray-800">Shipping Address</h3>

			<div className="w-full space-y-3">
				{/* Company Name Input Style */}
				{shippingAddress.companyName && (
					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							Company Name
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{shippingAddress.companyName}
						</div>
					</div>
				)}

				{/* Street Address Input Style */}
				<div className="relative">
					<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
						Street Address
					</label>
					<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
						{shippingAddress.streetAddress1}
					</div>
				</div>

				{/* Street Address 2 Input Style */}
				{shippingAddress.streetAddress2 && (
					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							Street Address 2
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{shippingAddress.streetAddress2}
						</div>
					</div>
				)}

				{/* City and Postal Code - 2 columns */}
				<div className="grid grid-cols-2 gap-3">
					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							City
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{shippingAddress.city}
						</div>
					</div>

					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							Postal Code
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{shippingAddress.postalCode}
						</div>
					</div>
				</div>

				{/* City Area Input Style */}
				{shippingAddress.cityArea && (
					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							District/City Area
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{shippingAddress.cityArea}
						</div>
					</div>
				)}

				{/* Country and Country Area - 2 columns */}
				<div className="grid grid-cols-2 gap-3">
					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							Country
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{shippingAddress.country.country}
						</div>
					</div>

					{shippingAddress.countryArea && (
						<div className="relative">
							<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
								State/Province
							</label>
							<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
								{shippingAddress.countryArea}
							</div>
						</div>
					)}
				</div>

				{/* Name - 2 columns */}
				{(shippingAddress.firstName || shippingAddress.lastName) && (
					<div className="grid grid-cols-2 gap-3">
						{shippingAddress.firstName && (
							<div className="relative">
								<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
									First Name
								</label>
								<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
									{shippingAddress.firstName}
								</div>
							</div>
						)}

						{shippingAddress.lastName && (
							<div className="relative">
								<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
									Last Name
								</label>
								<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
									{shippingAddress.lastName}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Phone Input Style */}
				{shippingAddress.phone && (
					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							Phone Number
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{shippingAddress.phone}
						</div>
					</div>
				)}

				{/* Edit Button */}
				<div className="pt-2">
					<button
						className="flex items-center gap-x-2 text-blue-500 hover:text-blue-700 transition-colors duration-200 text-sm font-medium"
						onClick={openDialog}
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit address
					</button>
				</div>
			</div>
		</div>
	);
};

export default CustomerAddressInfo;