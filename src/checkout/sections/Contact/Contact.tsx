import { User } from "@/checkout/hooks/useUserServer";

interface ContactProps {
	user: User | null | undefined;
}


export const Contact = ({ user }: ContactProps) => {

	return (
		<div className="w-full rounded-lg bg-white py-2">
			<div id="user-info">
				<div className="mb-3">
					<p className="text-sm font-medium text-gray-500">User name:</p>
					<p className="text-lg text-gray-900">
						{user?.lastName} {user?.firstName}
					</p>
				</div>
				<div>
					<p className="text-sm font-medium text-gray-500">Email:</p>
					<p className="text-lg text-gray-900">{user?.email}</p>
				</div>
			</div>
		</div>

	);
};
