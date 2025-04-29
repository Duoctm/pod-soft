import { addPromodeCode } from "@/checkout/hooks/useAddPromoddeCode";
import React, { FormEvent, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const PromoCodeAdd = ({ id }: { id: string }) => {
	const [voucherCode, setVoucherCode] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!voucherCode.trim()) return;

		try {
			const result = await addPromodeCode(voucherCode, id);
			// Handle successful promo code application
			console.log(result?.success);
			if (result?.success == false) {
				const errors = result?.data;
				if (errors.length > 0) {
					errors.map((err: any) => {
						toast.error(err.message);
					});
					return;
				} else {
					toast.error("In valid promode code");
				}
			}
			if (result?.success) {
				toast.success("Promo code applied successfully!");
				setVoucherCode("");
			}
		} catch (error) {
			// Handle error
			console.error("Failed to apply promo code:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<ToastContainer />
			<label htmlFor="voucher_input" className="mb-2 block text-sm font-medium text-gray-700">
				Enter voucher code:
			</label>
			<div className="flex items-center space-x-2">
				<input
					type="text"
					id="voucher_input"
					name="voucher_input"
					value={voucherCode}
					onChange={(e) => setVoucherCode(e.target.value)}
					placeholder="Enter your code..."
					className="flex-grow rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				/>

				<button
					type="submit"
					className="inline-flex justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-gray-800 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2"
				>
					Apply
				</button>
			</div>
		</form>
	);
};
