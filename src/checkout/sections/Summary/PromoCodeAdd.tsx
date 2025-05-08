import React, { type FormEvent, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { addPromodeCode } from "@/checkout/hooks/useAddPromoddeCode";
import "react-toastify/dist/ReactToastify.css";
import { LoaderCircle } from "lucide-react";
 
export const PromoCodeAdd = ({ id }: { id: string }) => {
	const [voucherCode, setVoucherCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [spamCount, setSpamCount] = useState(0);
	const [isLocked, setIsLocked] = useState(false);
	const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!voucherCode.trim() || loading || isLocked) return;

		setLoading(true);

		try {
			const result = await addPromodeCode(voucherCode, id);
			if (result?.success == false) {
				const errors = result?.data;
				if (errors.length > 0) {
					errors.map((err: any) => {
						toast.error(err.message);
					});
					// Count as a spam attempt
					setSpamCount((prev) => prev + 1);
					checkSpam(spamCount + 1);
					setLoading(false);
					return;
				} else {
					toast.error("In valid promode code");
					setSpamCount((prev) => prev + 1);
					checkSpam(spamCount + 1);
					setLoading(false);
					return;
				}
			}
			if (result?.success) {
				toast.success("Promo code applied successfully!");
				setVoucherCode("");
				setSpamCount(0); // Reset spam count on success
				window.location.reload();	
			}
		} catch (error) {
			console.error("Failed to apply promo code:", error);
			setSpamCount((prev) => prev + 1);
			checkSpam(spamCount + 1);
		} finally {
			setLoading(false);
		}
	};

	// Helper to check for spam and lock if needed
	const checkSpam = (count: number) => {
		if (count >= 5) {
			toast.error("You are spamming! Please wait 1 minute before trying again.");
			setIsLocked(true);
			lockTimeoutRef.current = setTimeout(() => {
				setIsLocked(false);
				setSpamCount(0);
			}, 60000); // 1 minute
		}
	};

	// Cleanup timeout if component unmounts
	React.useEffect(() => {
		return () => {
			if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
		};
	}, []);

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
					disabled={loading || isLocked}
				/>

				<button
					type="submit"
					className="inline-flex justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-gray-800 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2"
					disabled={loading || isLocked}
				>
					{loading ? (
						<LoaderCircle className="animate-spin h-5 w-5 mr-2" />
					) : (
						"Apply"
					)}
				</button>
			</div>
			{isLocked && (
				<p className="mt-2 text-sm text-red-600">You have been temporarily locked out for spamming. Please wait 1 minute.</p>
			)}
		</form>
	);
};
