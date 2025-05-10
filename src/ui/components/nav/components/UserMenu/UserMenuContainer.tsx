"use client";

import { useEffect, useState } from "react";
import { UserIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { getUser } from "@/actions/user";
import { UserDetailsFragment } from "@/gql/graphql";

export function UserMenuContainer() {
	const [user, setUser] = useState<UserDetailsFragment>();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			setIsLoading(true);
			try {
				const data = await getUser();
				setUser(data as UserDetailsFragment);
			} catch (e) {
				console.error("Failed to fetch user", e);
			} finally {
				setIsLoading(false);
			}
		};
		fetchUser();
	}, []);

	if (isLoading) {
		return <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900" />;
	}

	if (user) {
		return <UserMenu user={user} />;
	}

	return (
		<LinkWithChannel href="/login" className="flex items-center justify-center rounded-md p-2">
			<UserIcon className="h-6 w-6" aria-hidden="true" />
			<span className="sr-only">Log in</span>
		</LinkWithChannel>
	);
}
