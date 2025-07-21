import { type User } from "@/checkout/hooks/useUserServer";

interface ContactProps {
	user: User | null | undefined;
}

export const Contact = ({ user }: ContactProps) => {
	return (
		<div className="flex flex-1 flex-col gap-y-4 rounded-lg bg-white p-4 shadow-sm">
			<h3 className="font-medium text-gray-800">Contact Information</h3>

			<div className="w-full space-y-3">
				{/* Name Fields - 2 columns */}
				{(user?.firstName || user?.lastName) && (
					<div className="grid grid-cols-2 gap-3">
						{user?.firstName && (
							<div className="relative">
								<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
									First Name
								</label>
								<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
									{user.firstName}
								</div>
							</div>
						)}

						{user?.lastName && (
							<div className="relative">
								<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
									Last Name
								</label>
								<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
									{user.lastName}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Email Input Style */}
				{user?.email && (
					<div className="relative">
						<label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
							Email Address
						</label>
						<div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
							{user.email}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};