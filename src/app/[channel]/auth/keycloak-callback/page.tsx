"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
//import { serverCookieStorage } from './StorageRepository '; // Adjust the import path as necessary
import { SetItemToServerCookie } from '../../../actions'
import { getCheckoutDetail } from "./checkoutdata"
// Define types for the GraphQL response from externalObtainAccessTokens
interface SaleorUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isStaff?: boolean;
    isActive?: boolean;
    // Add other user fields you might need
}

interface AccountError {
    field?: string | null;
    message?: string | null;
    code?: string | null;
}

interface ObtainTokensData {
    token?: string | null;
    refreshToken?: string | null;
    csrfToken?: string | null;
    user?: SaleorUser | null;
    accountErrors?: AccountError[] | null;
    errors?: AccountError[] | null; // General errors
}

interface ObtainTokensResponse {
    data?: {
        externalObtainAccessTokens?: ObtainTokensData | null;
    } | null;
    // Top-level errors for GraphQL execution issues
    errors?: Array<{ message: string;[key: string]: any }> | null;
}


function KeycloakCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    //onst [accessToken, setAccessToken] = useState<string | null>(null);

    // useEffect(() => {
    //     SetToken("saleorToken", accessToken || "");
    //     //serverCookieStorage.setItem("saleorToken", accessToken || "");
    // }, [accessToken]);

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
            toast.error(`Keycloak OIDC Error: ${errorDescription || error}`);
            console.error(`Keycloak OIDC Error: ${error}, Description: ${errorDescription}`);
            // Redirect to login or home page after a delay
            setTimeout(() => router.push("/login"), 3000); // Adjust path as needed
            return;
        }

        if (code && state) {
            const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
            if (!saleorApiUrl) {
                toast.error("Zoomprints API URL is not configured!");
                console.error("Error: NEXT_PUBLIC_SALEOR_API_URL is not set for callback page.");
                setTimeout(() => router.push("/login"), 3000);
                return;
            }

            const obtainTokens = async () => {
                try {
                    const response = await fetch(saleorApiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            query: `
                                mutation ExternalObtainAccessTokens($pluginId: String!, $input: JSONString!) {
                                    externalObtainAccessTokens(pluginId: $pluginId, input: $input) {
                                        token
                                        refreshToken
                                        csrfToken
                                        user {
                                            id
                                            email
                                            firstName
                                            lastName
                                            isStaff
                                            isActive
                                        }
                                        accountErrors {
                                            field
                                            message
                                            code
                                        }
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
                                input: JSON.stringify({ code, state })
                            }
                        })
                    });

                    const result = await response.json() as ObtainTokensResponse;
                    //console.log("externalObtainAccessTokens response:", result);

                    const tokenData = result.data?.externalObtainAccessTokens;

                    //setAccessToken(tokenData?.token || null);

                    if (tokenData?.token && tokenData?.user) {
                        // SUCCESS: Store tokens and user info
                        // For Next.js App Router, using server actions to set httpOnly cookies for tokens is recommended.
                        // For simplicity here, we'll use localStorage (less secure for tokens).
                        // localStorage.setItem("saleorToken", tokenData.token);
                        const accessToken = `${saleorApiUrl}+saleor_auth_access_token`;
                        const refreshToken = `${saleorApiUrl}+saleor_auth_module_refresh_token`;
                        const statusSignedIn = `${saleorApiUrl}+saleor_auth_module_auth_state`;
                        await SetItemToServerCookie(accessToken, tokenData.token);
                        if (tokenData.refreshToken) {
                            localStorage.setItem("saleorRefreshToken", tokenData.refreshToken);
                            await SetItemToServerCookie(refreshToken, tokenData.refreshToken);
                        }
                        //localStorage.setItem("saleorUserInfo", JSON.stringify(tokenData.user));
                        //await SetItemToServerCookie("saleorUserInfo", JSON.stringify(tokenData.user));


                        toast.success("Login successful! Redirecting...");
                        await SetItemToServerCookie(statusSignedIn, 'signedIn');
                        await SetItemToServerCookie("SignInMethod", 'keycloak');
                        const channel = localStorage.getItem("channel");
                        await getCheckoutDetail(channel || "default-channel");
                        localStorage.removeItem("channel");

                        // TODO: Trigger a global state update if necessary (e.g., React Context, Zustand)
                        // to reflect login status across the app immediately.

                        // Redirect to home page or user dashboard
                        router.push("/");
                    } else {
                        let errorMessages = "Failed to obtain Zoomprints tokens.";
                        if (tokenData?.accountErrors && tokenData.accountErrors.length > 0) {
                            errorMessages = tokenData.accountErrors.map(e => e.message || "Account error").join(", ");
                        } else if (tokenData?.errors && tokenData.errors.length > 0) {
                            errorMessages = tokenData.errors.map(e => e.message || "General error").join(", ");
                        } else if (result.errors && result.errors.length > 0) {
                            errorMessages = result.errors.map(e => e.message || "GraphQL error").join(", ");
                        }
                        toast.error(`Login failed: ${errorMessages}`);
                        console.error("externalObtainAccessTokens error:", errorMessages, result);
                        setTimeout(() => router.push("/login"), 3000);
                    }
                } catch (fetchError) {
                    toast.error("Error connecting to Zoomprints API during token exchange.");
                    console.error("Fetch Error for externalObtainAccessTokens:", fetchError);
                    setTimeout(() => router.push("/login"), 3000);
                }
            };

            obtainTokens();
        } else if (!error) { // No error, but also no code/state - might be direct access
            toast.warn("Invalid callback parameters.");
            setTimeout(() => router.push("/login"), 3000);
        }
    }, [searchParams, router]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

// Wrap with Suspense because useSearchParams() needs it
export default function KeycloakCallbackPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>Loading callback...</p>
            </div>
        }>
            <KeycloakCallbackContent />
        </Suspense>
    );
} 