"use client";
import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
// eslint-disable-next-line import/no-cycle, import/order
import { createSupport } from "./actions/create-support";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";
import { getUser } from "../../../../actions/userFullInfo"
import { getFAQ } from "./actions/get-faq";
import { SupportTypeEnum, type GetPublicSettingsQuery } from "@/gql/graphql";
export interface SupportFormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    company: string;
    address: string;
    details: string;
}

export interface FAQType {
    question: string
    result: string
    button: string
    text: string
}

const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    phoneNumber: Yup.string()
        .matches(/^\+?[0-9]{9,15}$/, "Please enter a valid phone number")
        .required("Phone number is required"),
    company: Yup.string().required("Company name is required"),
    address: Yup.string().required("Address is required"),
    details: Yup.string().required("Details are required"),
});

const defaultInitialValues: SupportFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    company: "",
    address: "",
    details: "",
};

const getUserAndSetToForm = async () => {
    const user = await getUser();
    return {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phoneNumber: user?.addresses?.[0]?.phone || "",
        company: "", // Có thể lấy từ user nếu có
        address: user?.addresses?.[0]
            ? `${user.addresses[0].streetAddress1}, ${user.addresses[0].city}, ${user.addresses[0].country.country}`
            : "",
        details: "Please grant me permission to place orders under 500",
    };
};

const requestRegisterToForm = () => ({
    ...defaultInitialValues,
    details: "I need an account to access the system. Please assist.",
});

enum RequestType {
    NORMAL = "",
    ORDER_LIMIT = "order-limit",
    REQUEST_REGISTER = "request-register",
}

const SupportPage = ({ channel }: { channel: string }) => {
    const searchParams = useSearchParams();
    const requestType = searchParams.get("request");

    const [initialValues, setInitialValues] = React.useState<SupportFormData>(defaultInitialValues);
    const [loading, setLoading] = React.useState(false);
    const [faq, setFaq] = React.useState<GetPublicSettingsQuery["publicSettingsByKeys"] | null>(null); // Adjust type as needed
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const [supportType, setSupportType] = useState<SupportTypeEnum>(SupportTypeEnum.Normal);

    const fetchInitialValues = async () => {
        if (requestType === RequestType.ORDER_LIMIT) {
            setSupportType(SupportTypeEnum.PermissionRequired)
            const values = await getUserAndSetToForm();
            setInitialValues(values);
        } else if (requestType === RequestType.REQUEST_REGISTER) {
            setInitialValues(requestRegisterToForm());
            setSupportType(SupportTypeEnum.AccountCreation);
        } else {
            setInitialValues(defaultInitialValues);
            setSupportType(SupportTypeEnum.Normal);
        }
    };

    const fetchFAQ = async () => {
        // Implement the logic to fetch FAQ if needed
        const res = await getFAQ({
            keys: ["REQUEST_REGISTER"],
            channel: channel,
        });
        console.log(res)
        setFaq(res as GetPublicSettingsQuery["publicSettingsByKeys"]);

    }

    React.useEffect(() => {
        void fetchInitialValues();
        void fetchFAQ();
    }, [requestType]);

    const handleSubmit = async (values: SupportFormData, { resetForm }: any) => {
        setLoading(true);
        try {
            const newValueCreate = {
                ...values,
                supportType: supportType
            }

            const res = await createSupport(newValueCreate);
            if (res?.success) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                resetForm();
                toast.success(res.message);
            } else {
                toast.error("Failed to submit support request. Please try again.");
            }
        } catch (err) {
            toast.error("An error occurred while submitting your request. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="mx-auto max-w-7xl min-h-screen">
            <ToastContainer />
            <div className="flex flex-col items-center justify-center">
                <h2 className="mb-8 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    Support
                </h2>
                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, setFieldValue }) => (
                        <Form className="w-full max-w-2xl space-y-6 px-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        First Name
                                    </label>
                                    <Field
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                    />
                                    {errors.firstName && touched.firstName && (
                                        <div className="mt-1 text-sm text-red-600">{errors.firstName}</div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Last Name
                                    </label>
                                    <Field
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                    />
                                    {errors.lastName && touched.lastName && (
                                        <div className="mt-1 text-sm text-red-600">{errors.lastName}</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <Field
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                                {errors.email && touched.email && (
                                    <div className="mt-1 text-sm text-red-600">{errors.email}</div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <Field
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                                {errors.phoneNumber && touched.phoneNumber && (
                                    <div className="mt-1 text-sm text-red-600">{errors.phoneNumber}</div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                    Company
                                </label>
                                <Field
                                    type="text"
                                    id="company"
                                    name="company"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                                {errors.company && touched.company && (
                                    <div className="mt-1 text-sm text-red-600">{errors.company}</div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <Field
                                    type="text"
                                    id="address"
                                    name="address"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                                {errors.address && touched.address && (
                                    <div className="mt-1 text-sm text-red-600">{errors.address}</div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                                    Details
                                </label>
                                <Field
                                    as="textarea"
                                    id="details"
                                    name="details"
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                                {errors.details && touched.details && (
                                    <div className="mt-1 text-sm text-red-600">{errors.details}</div>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-md bg-[#F58A71] px-4 py-2 text-white hover:bg-[#F58A71]/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                            {faq && faq.length > 0 && (
                                <div className="mt-6 w-full max-w-2xl">
                                    <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                                    <ul className="space-y-4">
                                        {faq.map((item, index) => {
                                            const value = JSON.parse(item?.value as string) as FAQType;
                                            return (
                                                <li key={index} className="border rounded-md bg-gray-50 mt-2">
                                                    <Accordion expanded={openIndex === index} onChange={() => setOpenIndex(openIndex === index ? null : index)}>
                                                        <AccordionSummary
                                                            className="py-2"
                                                            expandIcon={<span>▼</span>}
                                                            aria-controls={`faq-content-${index}`}
                                                            id={`faq-header-${index}`}
                                                        >
                                                            <h4 className="font-medium">{value.question}</h4>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            <div className="flex flex-1 items-center justify-between">
                                                                <p className="text-sm text-gray-700">{value.result}</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        void setFieldValue("details", value.text);
                                                                        setOpenIndex(null); // Đóng accordion sau khi apply
                                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                                    }}
                                                                    className="float-end mt-2 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#8C3859] rounded-md hover:bg-[#8C3859]/70 focus:outline-none focus:ring-2 focus:ring-[#8C3859] focus:ring-offset-2">
                                                                    Apply
                                                                </button>
                                                            </div>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </Form>
                    )}
                </Formik>
            </div>
        </div >
    );
};

export { SupportPage };
