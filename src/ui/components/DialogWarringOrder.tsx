import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { type InfoSupport } from "@/app/[channel]/(main)/cart/CheckoutLink";

interface DialogWarningOrder {
    message: string;
    channel?: string;
    onClose?: () => void;
    open: boolean;
    loading?: boolean;
    onConfirm?: () => void;
    infoSupport: InfoSupport;
    setInfoSupport: React.Dispatch<React.SetStateAction<InfoSupport>>;
}

const DialogWarningOrder: React.FC<DialogWarningOrder> = ({ message, onClose, open, onConfirm, loading, infoSupport, setInfoSupport }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInfoSupport({
            ...infoSupport,
            [name]: value
        });
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose || (() => { })}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex flex-col items-center">

                                    <TriangleAlert className="h-20 w-20 p-4 text-yellow-700 mb-4 bg-yellow-200/70 rounded-full border-[10px] border-yellow-300/30" />

                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Warning Orders
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 text-center">{message}</p>
                                    </div>
                                </div>
                                <div className="w-full mt-4 gap-2 flex flex-col">
                                    <p className="font-bold capitalize text-xl">current info</p>
                                    <div className="w-full flex flex-col md:flex-row gap-2">
                                        <div className="w-full md:w-1/2 ">
                                            <label htmlFor="firstName" className="font-semibold ">First Name</label>
                                            <input
                                                onChange={handleInputChange}
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                placeholder="Enter your first name"
                                                className="w-full mt-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#8C3859] focus:ring-[#8C3859]"
                                                value={infoSupport.firstName}

                                            />
                                        </div>
                                        <div className="w-full md:w-1/2  ">
                                            <label htmlFor="lastName" className="font-semibold ">Last Name</label>
                                            <input

                                                onChange={handleInputChange}
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                placeholder="Enter your last name"
                                                className="w-full mt-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#8C3859] focus:ring-[#8C3859]"
                                                value={infoSupport.lastName}

                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="font-semibold ">Phone</label>
                                        <input

                                            onChange={handleInputChange}
                                            type="text"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            placeholder="Enter your phone number"
                                            className="w-full mt-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#8C3859] focus:ring-[#8C3859]"
                                            value={infoSupport.phoneNumber}

                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="font-semibold ">Email</label>
                                        <input

                                            onChange={handleInputChange}
                                            type="text"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            className="w-full mt-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#8C3859] focus:ring-[#8C3859]"
                                            value={infoSupport.email}

                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="company" className="font-semibold ">Company</label>
                                        <input
                                            onChange={handleInputChange}
                                            type="text"
                                            id="company"
                                            name="company"
                                            placeholder="Enter your company"
                                            className="w-full mt-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#8C3859] focus:ring-[#8C3859]"
                                            value={infoSupport.company}

                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="font-semibold ">Address</label>
                                        <input
                                            onChange={handleInputChange}
                                            type="text"
                                            id="address"
                                            name="address"
                                            placeholder="Enter your address"
                                            className="w-full mt-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#8C3859] focus:ring-[#8C3859]"
                                            value={infoSupport.address}

                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="details" className="font-semibold ">Details</label>
                                        <textarea
                                            rows={3}
                                            id="details"
                                            onChange={handleInputChange}
                                            name="details"
                                            placeholder="Enter your details"
                                            className="w-full mt-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#8C3859] focus:ring-[#8C3859]"
                                            value={infoSupport.details}

                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between gap-2">
                                    {onClose && (
                                        <button
                                            type="button"
                                            className="w-full justify-center rounded-md border border-transparent bg-gray-100 px-6 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                                            onClick={onClose}
                                        >
                                            Later
                                        </button>
                                    )}
                                    {onConfirm && (
                                        <button
                                            type="button"
                                            className={cn('flex items-center justify-center w-full rounded-md border border-transparent bg-[#8C3859] px-6 py-2 text-sm font-medium text-white hover:bg-[#8C3859]/80', {
                                                "opacity-50 cursor-not-allowed": loading,
                                                "hover:bg-[#8C3859]": !loading
                                            })}
                                            onClick={() => {
                                                onConfirm()
                                            }}
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : "Confirm Order"}
                                        </button>
                                    )}
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export { DialogWarningOrder };
