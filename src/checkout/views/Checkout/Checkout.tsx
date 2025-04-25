import { Suspense, useState, useCallback, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EmptyCartPage } from "../EmptyCartPage";
import { PageNotFound } from "../PageNotFound";
import { Summary, SummarySkeleton } from "@/checkout/sections/Summary";
import { CheckoutForm, CheckoutFormSkeleton } from "@/checkout/sections/CheckoutForm";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { CheckoutSkeleton } from "@/checkout/views/Checkout/CheckoutSkeleton";
import { getUserServer, type User, type Country } from "@/checkout/hooks/useUserServer";
import { useCountryList as fetchCountryList } from "@/checkout/hooks/useCountryList";
import { useShippingMethodList as fetchShippingMethodList } from "@/checkout/hooks/useShippingMethods";
import { type AddressInput, type CountryCode, LanguageCodeEnum, type CheckoutError } from "@/gql/graphql";
import {
	useCheckoutShippingAddressUpdateMutation,
	useCheckoutBillingAddressUpdateMutation,
	useCheckoutDeliveryMethodUpdateMutation,
	CheckoutShippingAddressUpdateMutation,
	CheckoutBillingAddressUpdateMutation,
} from "@/checkout/graphql";
import { getAddressValidationRulesVariables } from "@/checkout/components/AddressForm/utils";
import { createDummyPaymentServerFunc } from "@/checkout/hooks/createDummyPayment";
import { checkoutCompleteServerFunc } from "@/checkout/hooks/useCheckoutCompleteServer";

export interface AddressFormData {
	firstName: string;
	lastName: string;
	streetAddress1: string;
	streetAddress2: string | null;
	city: string;
	zipCode: string;
	country: string;
	phoneNumber: string | null;
	company: string | null;
}

interface ApiAddress {
	id?: string;
	firstName?: string | null;
	lastName?: string | null;
	streetAddress1?: string | null;
	streetAddress2?: string | null;
	city?: string | null;
	postalCode?: string | null;
	country?: {
		code?: string | null;
	} | null;
	phone?: string | null;
	companyName?: string | null;
}

interface ShippingMethod {
	id: string;
	active: boolean;
	description: string | null;
	name: string;
	price: {
		amount: number;
		currency: string;
	};
}

interface ApiError {
	field?: string | null;
	message?: string | null;
}

const getDefaultAddressFormData = (countriesData: Country[] | null): AddressFormData => {
	const defaultCountryCode = countriesData && countriesData.length > 0 ? countriesData[0].code : "";
	return {
		country: defaultCountryCode,
		firstName: "",
		lastName: "",
		company: "",
		streetAddress1: "",
		streetAddress2: "",
		city: "",
		zipCode: "",
		phoneNumber: "",
	};
};

const mapApiAddressToFormData = (
	address: ApiAddress | null | undefined,
	countriesData: Country[] | null,
): AddressFormData => {
	const defaults = getDefaultAddressFormData(countriesData);
	if (!address) return defaults;

	return {
		country: address.country?.code || defaults.country,
		firstName: address.firstName || defaults.firstName,
		lastName: address.lastName || defaults.lastName,
		company: address.companyName || defaults.company,
		streetAddress1: address.streetAddress1 || defaults.streetAddress1,
		streetAddress2: address.streetAddress2 || defaults.streetAddress2,
		city: address.city || defaults.city,
		zipCode: address.postalCode || defaults.zipCode,
		phoneNumber: address.phone || defaults.phoneNumber,
	};
};

const mapFormDataToAddressInput = (formData: AddressFormData | null | undefined): AddressInput | null => {
	if (!formData) return null;
	return {
		firstName: formData.firstName,
		lastName: formData.lastName,
		companyName: formData.company || "",
		streetAddress1: formData.streetAddress1,
		streetAddress2: formData.streetAddress2 || null,
		city: formData.city,
		postalCode: formData.zipCode,
		country: formData.country as CountryCode,
		phone: formData.phoneNumber || null,
	};
};

const processApiErrors = (
	errors: ReadonlyArray<CheckoutError | ApiError> | undefined | null,
): { fieldErrors: Record<string, string>; generalError: string | null } => {
	const fieldErrors: Record<string, string> = {};
	let generalError: string | null = null;

	if (errors && errors.length > 0) {
		errors.forEach((err) => {
			if (err.field) {
				const formFieldName =
					err.field === "postalCode" ? "zipCode" : err.field === "phone" ? "phoneNumber" : err.field;
				fieldErrors[formFieldName] = err.message || "Invalid value";
			} else if (!generalError) {
				generalError = err?.message || "An error occurred.";
			}
		});
	}
	return { fieldErrors, generalError };
};

export const Checkout = () => {
	const [user, setUser] = useState<User | null | undefined>(null);
	const [loadingUser, setLoadingUser] = useState(true);
	const { checkout, fetching: fetchingCheckout } = useCheckout();
	const [countriesData, setCountriesData] = useState<Country[] | null>(null);
	const [shippingAddressData, setShippingAddressData] = useState<AddressFormData | null>(null);
	const [isShippingAddressValid, setIsShippingAddressValid] = useState<boolean>(false);
	const [billingAddressData, setBillingAddressData] = useState<AddressFormData | null>(null);
	const [isBillingAddressValid, setIsBillingAddressValid] = useState<boolean>(false);
	const [useShippingAsBilling, setUseShippingAsBilling] = useState<boolean>(true);
	const [availableShippingMethods, setAvailableShippingMethods] = useState<ShippingMethod[]>([]);
	const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null);
	const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
	const [shippingApiFieldErrors, setShippingApiFieldErrors] = useState<Record<string, string> | null>(null);
	const [billingApiFieldErrors, setBillingApiFieldErrors] = useState<Record<string, string> | null>(null);
	const [isPlacingOrder, setIsPlacingOrder] = useState(false);
	const [isAddressInitialized, setIsAddressInitialized] = useState(false);
	const [loadingShippingMethods, setLoadingShippingMethods] = useState(true);
	const [deliveryMethodApiError, setDeliveryMethodApiError] = useState<string | null>(null);

	const [, executeShippingUpdate] = useCheckoutShippingAddressUpdateMutation();
	const [, executeBillingUpdate] = useCheckoutBillingAddressUpdateMutation();
	const [, executeDeliveryMethodUpdate] = useCheckoutDeliveryMethodUpdateMutation();

	const isCheckoutInvalid = !fetchingCheckout && !checkout && !loadingUser;
	const isInitiallyLoading = loadingUser || fetchingCheckout || !isAddressInitialized;
	const isEmptyCart = checkout && checkout.lines && checkout.lines.length === 0;

	useEffect(() => {
		let isMounted = true;
		setLoadingUser(true);
		const fetchUser = async () => {
			try {
				const data = await getUserServer();
				if (isMounted) {
					setUser(data);
				}
			} catch (error) {
				console.error("Failed to fetch user:", error);
				if (isMounted) setUser(null);
			} finally {
				if (isMounted) setLoadingUser(false);
			}
		};
		void fetchUser();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		if (checkout?.channel?.slug) {
			const fetchCountries = async () => {
				try {
					const data = await fetchCountryList({ slug: checkout.channel.slug });
					if (isMounted) {
						setCountriesData(data.map(({ country, code }) => ({ code, country })));
					}
				} catch (error) {
					console.error("Failed to fetch countries:", error);
					if (isMounted) setCountriesData([]);
				}
			};
			void fetchCountries();
		}
		return () => {
			isMounted = false;
		};
	}, [checkout?.channel?.slug]);

	useEffect(() => {
		if (loadingUser || fetchingCheckout || !countriesData || isAddressInitialized) {
			return;
		}

		const shippingSource = checkout?.shippingAddress
			? checkout.shippingAddress
			: user?.defaultShippingAddress
				? user.defaultShippingAddress
				: null;

		const billingSource = checkout?.billingAddress
			? checkout.billingAddress
			: user?.defaultBillingAddress
				? user.defaultBillingAddress
				: null;

		const initialShippingFormData = mapApiAddressToFormData(shippingSource, countriesData);
		const initialBillingFormData = mapApiAddressToFormData(billingSource, countriesData);

		setShippingAddressData(initialShippingFormData);
		setBillingAddressData(initialBillingFormData);

		const isBillingSameAsShippingInitially =
			!billingSource ||
			(shippingSource && billingSource && shippingSource.id === billingSource.id) ||
			(shippingSource &&
				billingSource &&
				JSON.stringify(mapApiAddressToFormData(shippingSource, countriesData)) ===
					JSON.stringify(mapApiAddressToFormData(billingSource, countriesData)));

		setUseShippingAsBilling(!!isBillingSameAsShippingInitially);

		setIsAddressInitialized(true);
	}, [user, checkout, loadingUser, fetchingCheckout, countriesData, isAddressInitialized]);

	useEffect(() => {
		let isMounted = true;
		setLoadingShippingMethods(true);
		setDeliveryMethodApiError(null);

		if (!checkout?.channel?.slug || !shippingAddressData?.country) {
			if (isMounted) {
				setAvailableShippingMethods([]);
				setSelectedShippingMethodId(null);
				setLoadingShippingMethods(false);
			}
			return;
		}

		const countryCodeForShipping = shippingAddressData.country;

		const fetchShippingMethods = async () => {
			try {
				const result = await fetchShippingMethodList({
					slug: checkout.channel.slug,
					countries: [countryCodeForShipping as CountryCode],
				});
				if (isMounted) {
					const activeMethods = result?.shippingMethods?.filter((method) => method.active) || [];
					const mappedMethods: ShippingMethod[] = activeMethods.map((method) => ({
						id: method.id,
						active: method.active,
						description: method.description ?? null,
						name: method.name,
						price: {
							amount: method.price.amount,
							currency: method.price.currency,
						},
					}));
					setAvailableShippingMethods(mappedMethods);

					const currentCheckoutShippingId = checkout?.shippingMethod?.id;
					let newSelectedId: string | null = null;

					if (currentCheckoutShippingId && mappedMethods.some((m) => m.id === currentCheckoutShippingId)) {
						newSelectedId = currentCheckoutShippingId;
					}

					setSelectedShippingMethodId(newSelectedId);
					setPlaceOrderError(null);
				}
			} catch (error) {
				console.error("Failed to fetch shipping methods:", error);
				if (isMounted) {
					setAvailableShippingMethods([]);
					setSelectedShippingMethodId(null);
					setPlaceOrderError("Could not load delivery methods.");
				}
			} finally {
				if (isMounted) {
					setLoadingShippingMethods(false);
				}
			}
		};

		void fetchShippingMethods();

		return () => {
			isMounted = false;
		};
	}, [checkout?.id, checkout?.channel?.slug, checkout?.shippingMethod?.id, shippingAddressData?.country]);

	const handleShippingAddressChange = useCallback(
		(values: AddressFormData | null, isValid: boolean) => {
			setShippingAddressData(values);
			setIsShippingAddressValid(isValid && !!values);
			setPlaceOrderError(null);
			setShippingApiFieldErrors(null);
			if (useShippingAsBilling) {
				setBillingApiFieldErrors(null);
			}
		},
		[useShippingAsBilling],
	);

	const handleBillingAddressChange = useCallback(
		(values: AddressFormData | null, isValid: boolean) => {
			if (!useShippingAsBilling) {
				setBillingAddressData(values);
				setIsBillingAddressValid(isValid && !!values);
				setPlaceOrderError(null);
				setBillingApiFieldErrors(null);
			}
		},
		[useShippingAsBilling],
	);

	useEffect(() => {
		if (!isAddressInitialized) return;

		if (useShippingAsBilling) {
			setBillingAddressData(shippingAddressData);
			setIsBillingAddressValid(isShippingAddressValid);
		} else {
			const currentBillingIsSameAsShipping =
				JSON.stringify(billingAddressData) === JSON.stringify(shippingAddressData);

			if (currentBillingIsSameAsShipping) {
				const billingSource = checkout?.billingAddress ?? user?.defaultBillingAddress;
				const initialBilling = mapApiAddressToFormData(billingSource, countriesData);
				setBillingAddressData(initialBilling);
				setIsBillingAddressValid(false);
			}
		}
		setPlaceOrderError(null);
		setShippingApiFieldErrors(null);
		setBillingApiFieldErrors(null);
	}, [
		useShippingAsBilling,
		shippingAddressData,
		isShippingAddressValid,
		isAddressInitialized,
		user,
		checkout,
		countriesData,
	]);

	const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setUseShippingAsBilling(event.target.checked);
		setPlaceOrderError(null);
		setShippingApiFieldErrors(null);
		setBillingApiFieldErrors(null);
		setDeliveryMethodApiError(null);
	}, []);

	console.log(checkout)

	const handleShippingMethodSelect = useCallback(async (methodId: string) => {
		setSelectedShippingMethodId(methodId);
		setPlaceOrderError(null);
		setShippingApiFieldErrors(null);
		setBillingApiFieldErrors(null);
		setDeliveryMethodApiError(null);
	}, []);

	useEffect(() => {
		const updateInfo = async () => {
			await updateAddressesAndDeliveryMethod();
			if (checkout?.isShippingRequired && selectedShippingMethodId) {
				await executeDeliveryMethodUpdate({
					languageCode: LanguageCodeEnum.En,
					checkoutId: checkout?.id || "",
					deliveryMethodId: selectedShippingMethodId,
				})
			}
		}
		updateInfo()
	}, [selectedShippingMethodId])

	const updateAddressesAndDeliveryMethod = async (): Promise<{
		success: boolean;
		errors?: {
			shipping?: Record<string, string> | null;
			billing?: Record<string, string> | null;
			delivery?: string | null;
			general?: string | null;
		};
	}> => {
		const finalBillingAddressData = useShippingAsBilling ? shippingAddressData : billingAddressData;
		const methodIdToUse = selectedShippingMethodId;

		let isDataValid = true;
		const validationErrorMessages: string[] = [];
		let deliveryMethodError: string | null = null;

		if (!shippingAddressData || !isShippingAddressValid) {
			isDataValid = false;
			validationErrorMessages.push("Shipping address is incomplete or invalid.");
		}
		if (!useShippingAsBilling && (!finalBillingAddressData || !isBillingAddressValid)) {
			isDataValid = false;
			validationErrorMessages.push("Billing address is incomplete or invalid.");
		}
		if (checkout?.isShippingRequired && !methodIdToUse) {
			isDataValid = false;
			validationErrorMessages.push("Please select a delivery method.");
			deliveryMethodError = "Delivery method is required.";
		}

		if (!isDataValid) {
			return {
				success: false,
				errors: {
					general: validationErrorMessages.join(" "),
					delivery: deliveryMethodError,
				},
			};
		}

		const shippingAddressForApi = mapFormDataToAddressInput(shippingAddressData);
		const billingAddressForApi = mapFormDataToAddressInput(finalBillingAddressData);

		if (!shippingAddressForApi || !billingAddressForApi) {
			return {
				success: false,
				errors: {
					general: "Failed to prepare address data for submission.",
				},
			};
		}

		try {
			const updatePromises = [
				executeShippingUpdate({
					languageCode: LanguageCodeEnum.En,
					checkoutId: checkout?.id || "",
					shippingAddress: shippingAddressForApi,
					validationRules: getAddressValidationRulesVariables({ autoSave: false }),
				}),
				executeBillingUpdate({
					languageCode: LanguageCodeEnum.En,
					checkoutId: checkout?.id || "",
					billingAddress: billingAddressForApi,
					validationRules: getAddressValidationRulesVariables({ autoSave: false }),
				}),
			];

			const results = await Promise.all(updatePromises);

			const updateShippingResult = results[0];
			const updateBillingResult = results[1];
			// const updateDeliveryResult = checkout?.isShippingRequired && methodIdToUse ? results[2] : null;

			const shippingApiErrors : CheckoutShippingAddressUpdateMutation | undefined = updateShippingResult.data;
			const { fieldErrors: processedShippingErrors, generalError: generalShippingError } =
				processApiErrors(shippingApiErrors?.checkoutShippingAddressUpdate?.errors);

			const billingApiErrors : CheckoutBillingAddressUpdateMutation | undefined = updateBillingResult.data;
			const { fieldErrors: processedBillingErrors, generalError: generalBillingError } =
				processApiErrors(billingApiErrors?.checkoutBillingAddressUpdate?.errors);

			// let deliveryApiErrors: readonly CheckoutError[] | undefined | null = null;
			let generalDeliveryError: string | null = null;
			// if (updateDeliveryResult) {
			// 	deliveryApiErrors = updateDeliveryResult.data?.checkoutDeliveryMethodUpdate?.errors;
			// 	const { generalError: processedGeneralDeliveryError } = processApiErrors(deliveryApiErrors);
			// 	generalDeliveryError = processedGeneralDeliveryError;
			// }

			let combinedShippingFieldErrors = { ...processedShippingErrors };
			const combinedBillingFieldErrors = { ...processedBillingErrors };

			if (useShippingAsBilling && Object.keys(processedBillingErrors).length > 0) {
				combinedShippingFieldErrors = { ...combinedShippingFieldErrors, ...processedBillingErrors };
			}

			const hasShippingFieldErrors = Object.keys(combinedShippingFieldErrors).length > 0;
			const hasBillingFieldErrors =
				!useShippingAsBilling && Object.keys(combinedBillingFieldErrors).length > 0;
			const hasDeliveryError = !!generalDeliveryError;
			const finalGeneralError = generalShippingError || generalBillingError || generalDeliveryError;

			if (finalGeneralError || hasShippingFieldErrors || hasBillingFieldErrors || hasDeliveryError) {
				return {
					success: false,
					errors: {
						shipping: hasShippingFieldErrors ? combinedShippingFieldErrors : null,
						billing: hasBillingFieldErrors ? combinedBillingFieldErrors : null,
						delivery: hasDeliveryError ? generalDeliveryError : null,
						general: finalGeneralError || "Please check the form for errors.",
					},
				};
			}

			return { success: true };
		} catch (error: any) {
			console.error("Error updating addresses/delivery:", error);
			return {
				success: false,
				errors: {
					general: "An unexpected error occurred while updating your details. Please try again.",
				},
			};
		}
	};

	const processPaymentAndCompleteOrder = async (): Promise<{
		success: boolean;
		error?: string | null;
	}> => {
		try {
			const paymentResult = await createDummyPaymentServerFunc({
				checkoutId: checkout?.id || "",
				amount: checkout?.totalPrice?.gross.amount || 0,
				gateway: checkout.availablePaymentGateways?.[0]?.id || "dummy",
			});

			// if (paymentResult.error) {
			// 	console.error("Payment initialization failed:", paymentResult.error);
			// 	return { success: false, error: `Payment failed: ${paymentResult.error}` };
			// }

			console.log("Payment result:", paymentResult);

			const completeResult = await checkoutCompleteServerFunc({
				checkoutId: checkout?.id,
			});

			// if (completeResult.errors && completeResult.errors.length > 0) {
			// 	console.error("Checkout completion failed:", completeResult.errors);
			// 	const { generalError: completionGeneralError } = processApiErrors(completeResult.errors);
			// 	return { success: false, error: completionGeneralError || "Failed to complete the order." };
			// }

			console.log("Checkout completed successfully. Order:", completeResult);
			return { success: true };
		} catch (error: any) {
			console.error("Error processing payment/completion:", error);
			return {
				success: false,
				error: "An unexpected error occurred during payment or order completion. Please try again.",
			};
		}
	};

	const handlePlaceOrder = async () => {
		setPlaceOrderError(null);
		setShippingApiFieldErrors(null);
		setBillingApiFieldErrors(null);
		setDeliveryMethodApiError(null);
		setIsPlacingOrder(true);

		// Step 1: Update Addresses and Delivery Method
		const updateResult = await updateAddressesAndDeliveryMethod();

		if (!updateResult.success) {
			setShippingApiFieldErrors(updateResult.errors?.shipping || null);
			setBillingApiFieldErrors(updateResult.errors?.billing || null);
			setDeliveryMethodApiError(updateResult.errors?.delivery || null);
			setPlaceOrderError(updateResult.errors?.general || "An error occurred. Please review your details.");
			setIsPlacingOrder(false);
			return;
		}

		// Step 2: Process Payment and Complete Order
		const paymentResult = await processPaymentAndCompleteOrder();

		if (!paymentResult.success) {
			setPlaceOrderError(paymentResult.error || "Failed to process payment or complete the order.");
			setIsPlacingOrder(false);
			return;
		}

		// Step 3: Success - Redirect or show confirmation
		setPlaceOrderError(null);
		console.log("Order placed successfully!");
		// Consider redirecting to an order confirmation page instead of home
		window.location.href = "/"; // Or navigate('/order-confirmation/ORDER_ID');

		// Note: setIsPlacingOrder(false) might not be strictly necessary here if redirecting,
		// but good practice if staying on the page for any reason.
		// setIsPlacingOrder(false);
	};

	const isPlaceOrderDisabled =
		isPlacingOrder ||
		!isAddressInitialized ||
		loadingShippingMethods ||
		!shippingAddressData ||
		!isShippingAddressValid ||
		(!useShippingAsBilling && (!billingAddressData || !isBillingAddressValid)) ||
		(checkout?.isShippingRequired && !selectedShippingMethodId);

	return isCheckoutInvalid ? (
		<PageNotFound />
	) : isInitiallyLoading ? (
		<CheckoutSkeleton />
	) : (
		<ErrorBoundary FallbackComponent={PageNotFound}>
			<div className="page">
				{isEmptyCart ? (
					<EmptyCartPage />
				) : (
					<div className="grid min-h-screen grid-cols-1 gap-x-16 lg:grid-cols-2">
						<div className="order-2 lg:order-1">
							<Suspense fallback={<CheckoutFormSkeleton />}>
								<CheckoutForm
									user={user}
									countriesData={countriesData}
									initialShippingValues={shippingAddressData}
									initialBillingValues={billingAddressData}
									useShippingAsBilling={useShippingAsBilling}
									availableShippingMethods={availableShippingMethods}
									selectedShippingMethodId={selectedShippingMethodId}
									shippingApiFieldErrors={shippingApiFieldErrors}
									billingApiFieldErrors={billingApiFieldErrors}
									deliveryMethodApiError={deliveryMethodApiError}
									onShippingAddressChange={handleShippingAddressChange}
									onBillingAddressChange={handleBillingAddressChange}
									onCheckboxChange={handleCheckboxChange}
									onShippingMethodSelect={handleShippingMethodSelect}
								/>
							</Suspense>
							<div className="mt-6 border-t p-4">
								{placeOrderError && (
									<div className="mb-4 text-center text-sm text-red-600" role="alert">
										{placeOrderError}
									</div>
								)}
								<button
									type="button"
									onClick={handlePlaceOrder}
									disabled={isPlaceOrderDisabled}
									className="w-full rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
									data-testid="place-order-button"
								>
									{isPlacingOrder ? "Processing..." : "Place Order"}
								</button>
							</div>
						</div>
						<div className="order-1 bg-gray-50 px-4 py-10 lg:order-2 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:px-10 lg:py-16">
							<Suspense fallback={<SummarySkeleton />}>{checkout && <Summary {...checkout} />}</Suspense>
						</div>
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
};
