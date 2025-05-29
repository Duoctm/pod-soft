"use client";

import { useEffect, useState } from "react";
import { UserIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { getUser } from "@/actions/user";
import { UserDetailsFragment } from "@/gql/graphql";
import { ErrorDetail, ExternalAuthUrlResponse, ParsedAuthData } from "@/ui/components/LoginForm";

export function UserMenuContainer({ params }: { params?: { channel: string } }) {
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


	const handleLogin = async () => {
		localStorage.setItem("channel", params?.channel || "default-channel");
		try {

			// 1. Xác định URL callback trên Storefront
			const storefrontBaseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";
			const channelFromParams = params?.channel || "default-channel";
			const storefrontCallbackUrl = `${storefrontBaseUrl}/${channelFromParams}/auth/keycloak-callback`;


			const saleorApiGraphqlEndpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL;
			if (!saleorApiGraphqlEndpoint) {
				console.error("Error: NEXT_PUBLIC_SALEOR_API_URL is not set.");
				return;
			}

			// 2. Gọi externalAuthenticationUrl với redirectUri là storefrontCallbackUrl
			const response = await fetch(saleorApiGraphqlEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: `
									mutation ExternalAuthenticationUrl($pluginId: String!, $input: JSONString!) {
										externalAuthenticationUrl(pluginId: $pluginId, input: $input) {
											authenticationData
											errors {
												field
												message
												code
											}
										}
									}
								`,
					variables: {
						pluginId: "mirumee.authentication.openidconnect",
						input: JSON.stringify({ redirectUri: storefrontCallbackUrl })
					}
				}),
			});


			const result = await response.json() as ExternalAuthUrlResponse;
			if (result.data?.externalAuthenticationUrl?.authenticationData) {
				const authData = JSON.parse(result.data.externalAuthenticationUrl.authenticationData) as ParsedAuthData;
				if (authData.authorizationUrl) {
					window.location.href = authData.authorizationUrl;
				} else {
					return;
				}
			} else {
				let errorMessages = "Failed to initiate Keycloak login.";
				if (result.data?.externalAuthenticationUrl?.errors && result.data.externalAuthenticationUrl.errors.length > 0) {
					errorMessages = result.data.externalAuthenticationUrl.errors.map((e: ErrorDetail) => e.message || 'Unknown error').join(", ");
				} else if (result.errors && result.errors.length > 0) {
					errorMessages = result.errors.map((e: { message: string }) => e.message).join(", ");
				}
			}


		} catch (error) {
			throw new Error("Some thing wrong")
		}
	}



	if (isLoading) {
		return <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900" />;
	}

	if (user) {
		return <UserMenu user={user} />;
	}

	return (
		<div onClick={handleLogin} className="flex items-center justify-center rounded-md p-2">
			<UserIcon className="h-6 w-6" aria-hidden="true" />
			<span className="sr-only">Log in</span>
		</div>
	);
}
