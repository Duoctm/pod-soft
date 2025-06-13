import { Suspense, useState, useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { EmptyCartPage } from "../EmptyCartPage";
import { PageNotFound } from "../PageNotFound";
import { Summary, SummarySkeleton } from "@/checkout/sections/Summary";
import { CheckoutSkeleton } from "@/checkout/views/Checkout/CheckoutSkeleton";
import { getUserServer, type User, type Address as ApiAddress } from "@/checkout/hooks/useUserServer";
import { getCheckoutServer } from "@/checkout/hooks/useCheckoutServer";
import {
	LanguageCodeEnum,
	type CheckoutShippingAddressUpdateMutation,
	type CheckoutBillingAddressUpdateMutation,
	type AddressInput,
	type CountryCode,
	type CheckoutError,
} from "@/gql/graphql";
import { extractCheckoutIdFromUrl } from "@/checkout/lib/utils/url";
import { type Checkout as CheckoutType } from "@/checkout/graphql";
import { AddressCheckoutForm } from "@/checkout/sections/CheckoutForm";
import { type Country, type UseCountryListOptions, getCountryList } from "@/checkout/hooks/useCountryList";
import { Contact } from "@/checkout/sections/Contact";
import { Divider } from "@/checkout/components";
import { updateShippingAddress } from "@/checkout/hooks/useShippingAddressUpdate";
import { updateBillingAddress } from "@/checkout/hooks/useBillingAddressUpdate";
import { checkoutCompleteServerFunc } from "@/checkout/hooks/useCheckoutCompleteServer";
import { AddressSchema } from "@/checkout/lib/utils/validate";
import { type Address, type FormValues } from "@/checkout/lib/utils/type";
import AddressEditDialogForm from "@/checkout/sections/AddressEditForm/AddressEditDialogForm";
import CustomerAddressInfo from "@/checkout/sections/CustomerAddressInfo/CustomerAddressInfo";
import { DeliveryMethods } from "@/checkout/sections/CheckoutForm/DeliveryMethodsSection";
import { checkoutValidate } from "../../../app/checkoutValidate";
import { ErrorDialogPlaceOrder } from "../../../app/ErrorDialogPlaceOrder";
//import { GetItemToServerCookie } from "../../../app/actions";
//import { callRefreshToken } from "../../../app/callRefreshToken";
// import { DeliveryMethods } from "@/checkout/sections/DeliveryMethods";
// Define the shape for the entire checkout form
const CheckoutSchema = Yup.object().shape({
	shippingAddress: AddressSchema.required(),
	useShippingAsBilling: Yup.boolean().required(),
	billingAddress: Yup.object().when("useShippingAsBilling", {
		is: false,
		then: () => AddressSchema.required("Billing address is required when not using shipping address"),
		otherwise: (schema) => schema.nullable(),
	}),
});

const mapFormDataToApiAddress = (address: Address): AddressInput => {
	return {
		firstName: address.firstName,
		lastName: address.lastName,
		streetAddress1: address.streetAddress1,
		streetAddress2: address.streetAddress2 || null,
		city: address.city,
		postalCode: address.zipCode,
		country: address.country as CountryCode,
		countryArea: address.countryArea,
		phone: address.phoneNumber,
		companyName: address.company,
	};
};

const mapApiFieldToFormikField = (apiField: string, addressType: "shipping" | "billing"): string => {
	const prefix = addressType === "shipping" ? "shippingAddress" : "billingAddress";
	switch (apiField) {
		case "firstName":
			return `${prefix}.firstName`;
		case "lastName":
			return `${prefix}.lastName`;
		case "streetAddress1":
			return `${prefix}.streetAddress1`;
		case "streetAddress2":
			return `${prefix}.streetAddress2`;
		case "city":
			return `${prefix}.city`;
		case "postalCode":
			return `${prefix}.zipCode`;
		case "country":
			return `${prefix}.country`;
		case "phone":
			return `${prefix}.phoneNumber`;
		case "companyName":
			return `${prefix}.company`;
		case "countryArea":
			return `${prefix}.countryArea`;
		default:
			console.warn(`Unknown API field mapping: ${apiField}`);
			return `${prefix}.${apiField}`;
	}
};

const compareAddress = (shippingAddress: ApiAddress, billingAddress: ApiAddress): boolean => {
	return (
		shippingAddress.firstName === billingAddress.firstName &&
		shippingAddress.lastName === billingAddress.lastName &&
		shippingAddress.streetAddress1 === billingAddress.streetAddress1 &&
		shippingAddress.streetAddress2 === billingAddress.streetAddress2 &&
		shippingAddress.city === billingAddress.city &&
		shippingAddress.postalCode === billingAddress.postalCode &&
		shippingAddress.country.code === billingAddress.country.code &&
		shippingAddress.phone === billingAddress.phone &&
		shippingAddress.companyName === billingAddress.companyName &&
		shippingAddress.countryArea === billingAddress.countryArea
	);
};

export const Checkout = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loadingUser, setLoadingUser] = useState(true);
	const [checkout, setCheckout] = useState<CheckoutType | null>(null);
	const [loadingCheckout, setLoadingCheckout] = useState(true);
	const checkoutId = useMemo(() => extractCheckoutIdFromUrl(), []);
	const [date, setDate] = useState(() => new Date().toLocaleString());
	const [isLoadingPlaceOrder, setIsLoadingPlaceOrder] = useState(false);
	const [channel, setChannel] = useState("");


	const [isOpenAddressEditDialog, setIsOpenAddressEditDialog] = useState(false);

	const update = () => {
		setDate(() => new Date().toLocaleString());
	};

	const isCheckoutInvalid = !loadingCheckout && !checkout && !loadingUser && !user;
	const isInitiallyLoading = loadingUser || loadingCheckout;
	const isEmptyCart = checkout && checkout.lines && checkout.lines.length === 0;

	const [countries, setCountries] = useState<{ code: string; country: string }[]>([]);


	const [errorDialogOpenLimit, setErrorDialogOpenLimit] = useState(false);
	const [errorMessageLimit, setErrorMessageLimit] = useState("");

	useEffect(() => {
		if (channel != undefined) {
			setChannel(checkout?.channel.slug || "");
		}
	}, [checkout]);

	useEffect(() => {
		let isMounted = true;
		setLoadingUser(true);
		const fetchUser = async () => {
			try {
				const data = (await getUserServer()).user;
				if (isMounted) {
					if (data != null) {
						setUser(data);
					}
				}
			} catch (error) {
				window.location.href = "/";
			} finally {
				if (isMounted) {
					setLoadingUser(false);
				}
			}
		};
		void fetchUser();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		setLoadingCheckout(true);

		const fetchCheckout = async () => {
			try {
				const data = await getCheckoutServer({ id: checkoutId, languageCode: LanguageCodeEnum.EnUs });
				console.log(data);
				if (isMounted) {
					setCheckout(data.checkout as CheckoutType);
				}
			} catch (error) {
				update();
			} finally {
				if (isMounted) {
					setLoadingCheckout(false);
				}
			}
		};
		void fetchCheckout();
		return () => {
			isMounted = false;
		};
	}, [checkoutId, date]);

	useEffect(() => {
		let isMounted = true;
		if (checkout?.channel?.slug) {
			const fetchCountries = async ({ slug }: UseCountryListOptions) => {
				try {
					const data = await getCountryList({ slug });
					if (isMounted) {
						setCountries(data.map(({ country, code }) => ({ code, country })));
					}
				} catch (error) {
					console.error("Failed to fetch countries:", error);
					if (isMounted) setCountries([]);
				}
			};
			void fetchCountries({ slug: checkout?.channel?.slug || "" });
		}
		return () => {
			isMounted = false;
		};
	}, [checkout?.channel?.slug]);

	const getDefaultAddressFormData = (countriesData: Country[] | null): Address => {
		const defaultCountryCode = countriesData && countriesData.length > 0 ? "US" : "US";
		return {
			country: defaultCountryCode,
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			company: "",
			streetAddress1: "",
			streetAddress2: "",
			city: "",
			zipCode: "",
			phoneNumber: "",
			countryArea: "",
		};
	};

	const mapApiAddressToFormData = (
		address: ApiAddress | null | undefined,
		countriesData: Country[] | null,
	): Address => {
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
			countryArea: address.countryArea || defaults.countryArea,
		};
	};

	const initialValues = useMemo(() => {
		const defaultShippingAddress = user?.defaultShippingAddress;
		const defaultBillingAddress = user?.defaultBillingAddress;
		let useShippingAsBilling = true;

		if (!defaultShippingAddress && !defaultBillingAddress) {
			useShippingAsBilling = true;
		} else if (
			defaultShippingAddress &&
			defaultBillingAddress &&
			compareAddress(defaultShippingAddress, defaultBillingAddress)
		) {
			useShippingAsBilling = true;
		} else if (!defaultBillingAddress) {
			useShippingAsBilling = true;
		} else {
			useShippingAsBilling = false;
		}

		const initialValues: FormValues = {
			shippingAddress: mapApiAddressToFormData(
				checkout?.shippingAddress,
				countries?.map(({ code, country }) => ({ code: code, name: country })) || [],
			),
			billingAddress: mapApiAddressToFormData(
				checkout?.billingAddress,
				countries?.map(({ code, country }) => ({ code: code, name: country })) || [],
			),
			useShippingAsBilling,
		};
		return initialValues;
	}, [checkout?.shippingAddress, checkout?.billingAddress, user, countries]);

	const handleSubmit = async (
		values: FormValues,
		{ setSubmitting, setFieldError }: FormikHelpers<FormValues>,
	) => {
		setSubmitting(true);
		let hasErrors = false;
		console.log(mapFormDataToApiAddress(values.shippingAddress))


		const shippingAddressUpdateResult: CheckoutShippingAddressUpdateMutation = await updateShippingAddress({
			checkoutId: checkoutId,
			shippingAddress: mapFormDataToApiAddress(values.shippingAddress),
		});
		const shippingErrors: readonly CheckoutError[] | null | undefined =
			shippingAddressUpdateResult?.checkoutShippingAddressUpdate?.errors;
		if (shippingErrors && shippingErrors.length > 0) {
			hasErrors = true;
			shippingErrors.forEach((error: CheckoutError) => {
				if (error.field && error.message) {
					const formikField = mapApiFieldToFormikField(error.field, "shipping");
					setFieldError(formikField, error.message);
				} else if (error.message) {
					toast.error(error.message);
				}
			});
		}

		const billingAddressInput = values.useShippingAsBilling
			? mapFormDataToApiAddress(values.shippingAddress)
			: mapFormDataToApiAddress(values.billingAddress);

		const billingAddressUpdateResult: CheckoutBillingAddressUpdateMutation = await updateBillingAddress({
			checkoutId: checkoutId,
			billingAddress: billingAddressInput,
		});

		const billingErrors: readonly CheckoutError[] | null | undefined =
			billingAddressUpdateResult?.checkoutBillingAddressUpdate?.errors;
		if (billingErrors && billingErrors.length > 0) {
			hasErrors = true;
			billingErrors.forEach((error: CheckoutError) => {
				if (error.field && error.message) {
					const addressType = values.useShippingAsBilling ? "shipping" : "billing";
					const formikField = mapApiFieldToFormikField(error.field, addressType);
					setFieldError(formikField, error.message);

					if (values.useShippingAsBilling) {
						const billingFormikField = mapApiFieldToFormikField(error.field, "billing");
						if (formikField !== billingFormikField) {
							setFieldError(formikField, `${error.message}`);
						}
					}
				} else if (error.message) {
					toast.error(error.message);
				}
			});
		}

		if (!hasErrors) {
			update();
			handleOpenAddressEditDialog();
		}

		setSubmitting(false);
	};

	const handlePlaceOrder = async () => {

		//const refreshTokenKey = `${process.env.NEXT_PUBLIC_SALEOR_API_URL}+saleor_auth_module_refresh_token`;
		//const refreshToken = await GetItemToServerCookie(refreshTokenKey);
		//await callRefreshToken(refreshTokenKey, refreshToken || "");


		const response = await checkoutValidate(checkoutId || "");

		const invalidError = Array.isArray(response.checkoutValidate?.errors)
			? response.checkoutValidate.errors.find((error) => error.code === "INVALID")
			: undefined;

		if (invalidError) {
			setErrorMessageLimit(invalidError.message || "");
			setErrorDialogOpenLimit(true);
		}




		setIsLoadingPlaceOrder(true);
		const dataCheckout = await getCheckoutServer({ id: checkoutId, languageCode: LanguageCodeEnum.EnUs });

		if (!dataCheckout.checkout?.shippingMethods || dataCheckout.checkout.shippingMethods.length === 0) {
			toast.error("Please type shipping address");
			return;
		}

		// await updateDeliveryMethod({
		// 	id: dataCheckout.checkout?.id || "",
		// 	deliveryMethodId: dataCheckout.checkout?.shippingMethods[0].id || "",
		// });

		if (!dataCheckout.checkout) {
			toast.error("Checkout is not available");
			return;
		} else {
			const completeResult = await checkoutCompleteServerFunc({
				checkoutId: dataCheckout.checkout?.id || "",
			});

			const completeCheckoutErrors: readonly CheckoutError[] | null | undefined =
				completeResult.checkoutComplete?.errors;
			if (completeCheckoutErrors && completeCheckoutErrors.length > 0) {
				console.log(completeCheckoutErrors)

				// completeCheckoutErrors.forEach((error: CheckoutError) => {
				// 	toast.error(error.message);
				// 	setIsLoadingPlaceOrder(false);
				// });
			} else {
				const notification = (message: string) => {
					toast.success(message, {
						position: "top-right",
					});
					setTimeout(function () {
						window.location.href = `/${dataCheckout.checkout?.channel.slug}/orders`;
					}, 2500);
				};
				notification("The order has been placed successfully!");
				setIsLoadingPlaceOrder(false);
			}
		}
	};

	const handleOpenAddressEditDialog = () => {
		setIsOpenAddressEditDialog(!isOpenAddressEditDialog);
	};

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
							<Divider />
							<Contact user={user} />
							<Divider />
							<div className="mt-2">
								{checkout?.shippingAddress ? (
									<>
										<CustomerAddressInfo shippingAddress={checkout.shippingAddress} openDialog={handleOpenAddressEditDialog} />
										<DeliveryMethods checkout={checkout} update={update} />

									</>
								) : (
									<>
										<button
											className="block rounded-full bg-[#8C3859]  px-4 py-2 text-white hover:bg-[#8C3859]/70"
											onClick={handleOpenAddressEditDialog}
										>
											Add a new delivery address
										</button>
									</>
								)}
							</div>


						</div>

						<div className="order-1 bg-gray-50 px-4 py-10 lg:order-2 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:px-10 lg:py-16">
							<Suspense fallback={<SummarySkeleton />}>
								{checkout && <Summary {...checkout} update={update} onPlaceOrder={handlePlaceOrder} show={Boolean(checkout.shippingAddress)} loading={isLoadingPlaceOrder} />}
							</Suspense>
						</div>
					</div>
				)}

			</div>

			<AddressEditDialogForm onClose={handleOpenAddressEditDialog} open={isOpenAddressEditDialog}>
				<Formik initialValues={initialValues} validationSchema={CheckoutSchema} onSubmit={handleSubmit}>
					<div>
						<AddressCheckoutForm slug={checkout?.channel.slug || ""} />
					</div>
				</Formik>
			</AddressEditDialogForm>
			<ErrorDialogPlaceOrder
				message={errorMessageLimit}
				open={errorDialogOpenLimit}
				channel={channel}
				onClose={() => setErrorDialogOpenLimit(false)}
				onConfirm={() => {
					setErrorDialogOpenLimit(false);
				}}
			/>
		</ErrorBoundary>

	);
};
