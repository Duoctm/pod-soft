"use client";

import { Suspense, useEffect, useState } from "react";
import { getUser } from "@/actions/user";
import { useNavigateLogin } from "@/hooks/useNavigateLogin";
import { useRouter } from "next/navigation";

// Define types for the GraphQL response
export interface ErrorDetail {
	field?: string | null;
	message?: string | null;
	code?: string | null;
	[key: string]: any;
}

export interface ExternalAuthUrlData {
	authenticationData?: string | null;
	errors?: ErrorDetail[] | null;
}

export interface ExternalAuthUrlResponse {
	data?: {
		externalAuthenticationUrl?: ExternalAuthUrlData | null;
	} | null;
	errors?: Array<{ message: string;[key: string]: any }> | null;
}

export interface ParsedAuthData {
	authorizationUrl?: string;
	[key: string]: any;
}

// const validationSchema = Yup.object({
// 	email: Yup.string().email("Invalid email").required("Email is required"),
// 	password: Yup.string().required("Password is required"),
// });

// function LoginFormContent({ params }: { params?: { channel: string } }) {
// 	const router = useRouter();
// 	const [showPassword, setShowPassword] = useState(false);
// 	const [isRedirectingToKeycloak, setIsRedirectingToKeycloak] = useState(false);
// 	const searchParams = useSearchParams();
// 	const email = searchParams.get("email") || "";

// 	const formik = useFormik({
// 		initialValues: {
// 			email: email,
// 			password: "",
// 		},
// 		validationSchema,
// 		onSubmit: async (values, { setSubmitting }) => {
// 			try {
// 				const result = await signInAction(values);

// 				if (result.success) {
// 					toast.success("Login successful!");
// 					if (params?.channel) {
// 						await getCheckoutDetail(params?.channel);
// 					}
// 					const redirectUrl = searchParams.get('redirect') || '/'
// 					router.push(redirectUrl);
// 				} else {
// 					toast.error("Email or password is incorrect");
// 				}
// 			} catch (error) {
// 				console.error("Login error:", error);
// 			} finally {
// 				setSubmitting(false);
// 			}
// 		},
// 	});

// 	const handleKeycloakLogin = async () => {
// 		setIsRedirectingToKeycloak(true);
// 		localStorage.setItem("channel", params?.channel || "default-channel");
// 		try {
// 			// 1. Xác định URL callback trên Storefront
// 			const storefrontBaseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";
// 			const channelFromParams = params?.channel || "default-channel";
// 			const storefrontCallbackUrl = `${storefrontBaseUrl}/${channelFromParams}/auth/keycloak-callback`;

// 			console.log("Storefront callback URL for Keycloak redirect:", storefrontCallbackUrl);

// 			const saleorApiGraphqlEndpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL;
// 			if (!saleorApiGraphqlEndpoint) {
// 				toast.error("Saleor API URL is not configured. Please set NEXT_PUBLIC_SALEOR_API_URL.");
// 				setIsRedirectingToKeycloak(false);
// 				console.error("Error: NEXT_PUBLIC_SALEOR_API_URL is not set.");
// 				return;
// 			}

// 			// 2. Gọi externalAuthenticationUrl với redirectUri là storefrontCallbackUrl
// 			const response = await fetch(saleorApiGraphqlEndpoint, {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json',
// 				},
// 				body: JSON.stringify({
// 					query: `
// 						mutation ExternalAuthenticationUrl($pluginId: String!, $input: JSONString!) {
// 							externalAuthenticationUrl(pluginId: $pluginId, input: $input) {
// 								authenticationData
// 								errors {
// 									field
// 									message
// 									code
// 								}
// 							}
// 						}
// 					`,
// 					variables: {
// 						pluginId: "mirumee.authentication.openidconnect",
// 						input: JSON.stringify({ redirectUri: storefrontCallbackUrl })
// 					}
// 				}),
// 			});

// 			const result = await response.json() as ExternalAuthUrlResponse;

// 			if (result.data?.externalAuthenticationUrl?.authenticationData) {
// 				const authData = JSON.parse(result.data.externalAuthenticationUrl.authenticationData) as ParsedAuthData;
// 				if (authData.authorizationUrl) {
// 					window.location.href = authData.authorizationUrl;
// 				} else {
// 					toast.error("Could not get authorization URL from Keycloak.");
// 					setIsRedirectingToKeycloak(false);
// 				}
// 			} else {
// 				let errorMessages = "Failed to initiate Keycloak login.";
// 				if (result.data?.externalAuthenticationUrl?.errors && result.data.externalAuthenticationUrl.errors.length > 0) {
// 					errorMessages = result.data.externalAuthenticationUrl.errors.map((e: ErrorDetail) => e.message || 'Unknown error').join(", ");
// 				} else if (result.errors && result.errors.length > 0) {
// 					errorMessages = result.errors.map((e: { message: string }) => e.message).join(", ");
// 				}
// 				toast.error(`Error: ${errorMessages}`);
// 				setIsRedirectingToKeycloak(false);
// 			}
// 		} catch (error) {
// 			console.error("Keycloak login initiation error:", error);
// 			toast.error("An unexpected error occurred while trying to log in with Keycloak.");
// 			setIsRedirectingToKeycloak(false);
// 		}
// 	};

// 	return (
// 		<div className="mx-auto mt-16 flex h-[60vh] w-full max-w-lg flex-col items-center justify-center">
// 			<ToastContainer />
// 			<form className="w-full max-w-5xl rounded border p-8 shadow-md" onSubmit={formik.handleSubmit}>
// 				<h1 className="mb-6 text-2xl font-bold text-neutral-800">Login</h1>

// 				<div className="mb-2">
// 					<input
// 						type="email"
// 						placeholder="Email"
// 						{...formik.getFieldProps("email")}
// 						className={clsx(
// 							"w-full rounded border bg-neutral-50 px-4 py-2",
// 							formik.touched.email && formik.errors.email && "border-red-500",
// 						)}
// 					/>
// 					{formik.touched.email && formik.errors.email && (
// 						<div className="mt-1 text-sm text-red-500">{formik.errors.email}</div>
// 					)}
// 				</div>

// 				<div className="relative">
// 					<input
// 						type={showPassword ? "text" : "password"}
// 						placeholder="Password"
// 						autoCapitalize="off"
// 						autoComplete="off"
// 						{...formik.getFieldProps("password")}
// 						className={clsx(
// 							"w-full rounded border bg-neutral-50 px-4 py-2 pr-10",
// 							formik.touched.password && formik.errors.password && "border-red-500",
// 						)}
// 					/>
// 					<button
// 						type="button"
// 						onClick={() => setShowPassword(!showPassword)}
// 						className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
// 					>
// 						{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// 					</button>
// 				</div>
// 				{formik.touched.password && formik.errors.password && (
// 					<div className="mt-1 text-sm text-red-500">{formik.errors.password}</div>
// 				)}
// 				<div>
// 					<div className="my-4">
// 						<div>
// 							<Link
// 								href={`/${params?.channel}/reset-password`}
// 								className="block text-sm font-medium text-neutral-800 underline hover:text-neutral-600"
// 							>
// 								Forgot your password?
// 							</Link>
// 						</div>
// 						{/* <div className="mt-2">
// 							<Link
// 								href={`/${params?.channel}/request-email-confirmation`}
// 								className="block text-sm font-medium text-neutral-800 underline hover:text-neutral-600"
// 							>
// 								Didn&apos;t receive your confirmation email?
// 							</Link>
// 						</div> */}
// 					</div>
// 				</div>
// 				<button
// 					type="submit"
// 					disabled={formik.isSubmitting}
// 					className="mt-4 flex w-full items-center justify-center rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-70"
// 				>
// 					{formik.isSubmitting ? (
// 						<>
// 							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 							Logging in...
// 						</>
// 					) : (
// 						"Log In"
// 					)}
// 				</button>

// 				<button
// 					type="button"
// 					onClick={handleKeycloakLogin}
// 					disabled={isRedirectingToKeycloak}
// 					className="mt-4 flex w-full items-center justify-center rounded bg-blue-600 px-4 py-2 text-neutral-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
// 				>
// 					{isRedirectingToKeycloak ? (
// 						<>
// 							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 							Redirecting to Keycloak...
// 						</>
// 					) : (
// 						<>
// 							<LogIn className="mr-2 h-4 w-4" />
// 							Login With Keycloak
// 						</>
// 					)}
// 				</button>

// 				<div className="mt-4 text-center">
// 					<p className="text-sm text-neutral-500">
// 						Don&apos;t have an account?{" "}
// 						<Link
// 							href={`/${params?.channel}/register`}
// 							className="font-medium text-neutral-800 underline hover:text-neutral-600"
// 						>
// 							Register
// 						</Link>
// 					</p>
// 				</div>
// 			</form>
// 		</div>
// 	);
// }

export function LoginForm({ params }: { params?: { channel: string } }) {
	const [loading, setLoading] = useState(true);
	const router = useRouter();


	useEffect(() => {
		const fetchUser = async () => {

			const user = await getUser();
			if (!user) {
				useNavigateLogin(params?.channel as string);
				setLoading(false);
			} else {
				router.push(`/`);
				setLoading(false);
				return;
			}

		};
		void fetchUser();


		return () => {
			setLoading(false);
		};

	}, []);
	if (loading) {
		return (
			<div className="fixed top-0 left-0 bg-black/20 right-0 bottom-0
			 z-50 pointer-events-none">
				<div className="absolute top-1/2 left-1/2 -translate-y-1/2">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
				</div>
			</div>
		);
	}





	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-col items-center justify-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
				</div>
			}
		>
			{/* <LoginFormContent params={params} /> */}
		</Suspense>
	);
}
