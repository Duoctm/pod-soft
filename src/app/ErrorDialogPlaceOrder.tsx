import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";

interface ErrorDialogPlaceOrder {
	message: string;
	channel: string;
	onClose?: () => void;
	open: boolean;
	onConfirm?: () => void;
}

const ErrorDialogPlaceOrder: React.FC<ErrorDialogPlaceOrder> = ({ message, onClose, open, onConfirm, channel }) => {
	const router = useRouter();


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
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<div className="flex flex-col items-center">
									<TriangleAlert className="h-20 w-20 p-4 text-red-600 mb-4  bg-[#F1DDDB] rounded-full border-[10px] border-[#F8EDEA]" />
									<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
										Invalid Orders
									</Dialog.Title>
									<div className="mt-2">
										<p className="text-sm text-gray-500 text-center">{message}</p>
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
											className="w-full justify-center rounded-md border border-transparent bg-[#8C3859] px-6 py-2 text-sm font-medium text-white hover:bg-[#8C3859]/80"
											onClick={() => {
												onConfirm()
												router.push(`/${channel}/support?request=order-limit`)
											}}
										>
											Contact Support
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

export { ErrorDialogPlaceOrder };
