import { ErrorDetail, ExternalAuthUrlResponse, ParsedAuthData } from "@/ui/components/LoginForm";

export const useNavigateLogin = async (channel: string) => {
    let errorMessages = "Failed to initiate Keycloak login.";
    localStorage.setItem("channel", channel || "default-channel");
    try {

        // 1. Xác định URL callback trên Storefront
        const storefrontBaseUrl = window.location
            .origin || "http://localhost:3001";
        const channelFromParams = channel || "default-channel";
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
            if (result.data?.externalAuthenticationUrl?.errors && result.data.externalAuthenticationUrl.errors.length > 0) {
                errorMessages = result.data.externalAuthenticationUrl.errors.map((e: ErrorDetail) => e.message || 'Unknown error').join(", ");
            } else if (result.errors && result.errors.length > 0) {
                errorMessages = result.errors.map((e: { message: string }) => e.message).join(", ");
            }
        }


    } catch (error) {
        throw new Error(errorMessages)
    }
}