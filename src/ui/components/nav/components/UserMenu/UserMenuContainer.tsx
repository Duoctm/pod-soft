"use client";

import { useEffect, useState } from "react";
import { UserIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { getUser } from "@/actions/user";
import { UserDetailsFragment } from "@/gql/graphql";

export function UserMenuContainer() {
	const [user, setUser] = useState<UserDetailsFragment>();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const data = await getUser();
				setUser(data as UserDetailsFragment);
			} catch (e) {
				console.error("Failed to fetch user", e);
			}
		};
		fetchUser();
	}, []);

	if (user) return <UserMenu user={user} />;

	return (
		<LinkWithChannel href="/login" className="flex items-center justify-center rounded-md p-2">
			<UserIcon className="h-6 w-6" aria-hidden="true" />
			<span className="sr-only">Log in</span>
		</LinkWithChannel>
	);
}
