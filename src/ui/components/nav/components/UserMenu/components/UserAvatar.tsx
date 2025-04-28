import Image from "next/image";
import { type UserDetailsFragment } from "@/gql/graphql";

type Props = {
	user: UserDetailsFragment;
};

export const UserAvatar = ({ user }: Props) => {
	const label =
		user.firstName && user.lastName
			? `${user.firstName.slice(0, 1)}${user.lastName.slice(0, 1)}`
			: user.email.slice(0, 2);

	if (user.avatar) {
		return (
			<Image
				className="h-8 w-8 rounded-full border border-[#E5E7EB] object-cover"
				src={user.avatar.url}
				width={32}
				height={32}
				alt="User avatar"
				aria-hidden="true"
			/>
		);
	}

	return (
		<span
			className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#FD8C6E] text-xs font-bold uppercase text-white"
			aria-hidden="true"
		>
			{label}
		</span>
	);
};
