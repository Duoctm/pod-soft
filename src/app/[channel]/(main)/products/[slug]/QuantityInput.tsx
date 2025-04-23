import React, { useState, useEffect, useCallback } from "react";
import * as yup from "yup";

// Type definition for props
// limit: Maximum allowed order quantity
// quantityAvailable: Number of products available in stock
// quantity: Current quantity value (state from parent component)
// setQuantity: State update function from parent component
// label: Label for the input (optional)
// disabled: Prop to disable the component (optional)
interface QuantityInputProps {
	limit: number;
	quantityAvailable: number;
	quantity: number;
	setQuantity: (value: number) => void;
	label?: string;
	disabled?: boolean;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
	limit,
	quantityAvailable,
	quantity,
	setQuantity,
	label = "QUANTITY",
	disabled = false,
}) => {
	// Local state to store validation error
	const [error, setError] = useState<string | null>(null);

	// Determine the actual limit based on limit and quantityAvailable
	const actualLimit = Math.min(limit, quantityAvailable);

	// Create validation schema with Yup (still used for checking)
	const validationSchema = useCallback(
		() =>
			yup.object().shape({
				quantity: yup
					.number()
					.required("Please enter the quantity")
					.integer("Quantity must be an integer")
					.min(1, "Quantity must be greater than 0")
					.max(actualLimit, `You can only order a maximum of ${actualLimit} products`)
					.typeError("Quantity must be a number"),
			}),
		[actualLimit],
	);

	// Synchronously validate and update quantity (for +/- buttons)
	const validateAndSetQuantitySync = (newValue: number) => {
		if (newValue >= 1 && newValue <= actualLimit && Number.isInteger(newValue)) {
			setQuantity(newValue);
			setError(null);
		} else {
			validationSchema()
				.validate({ quantity: newValue })
				.catch((err) => {
					if (err instanceof yup.ValidationError) setError(err.message);
				});
		}
	};

	// useEffect to adjust value if props (limit, quantityAvailable) change
	// and current value (from props) is invalid
	useEffect(() => {
		const newActualLimit = Math.min(limit, quantityAvailable);
		let adjustedValue = quantity;
		let needsUpdate = false;

		if (quantity > newActualLimit) {
			adjustedValue = newActualLimit;
			needsUpdate = true;
		} else if (quantity < 1 && quantity !== 0) {
			adjustedValue = 1;
			needsUpdate = true;
		}

		// Only call setQuantity if value needs adjustment
		if (needsUpdate) {
			setQuantity(adjustedValue);
			validationSchema()
				.validate({ quantity: adjustedValue })
				.catch((err) => {
					if (err instanceof yup.ValidationError) setError(err.message);
					else setError(null);
				});
		} else {
			// If no adjustment needed but limit changed, validate current value
			validationSchema()
				.validate({ quantity: quantity })
				.then(() => setError(null))
				.catch((err) => {
					if (err instanceof yup.ValidationError) setError(err.message);
				});
		}
	}, [limit, quantityAvailable, quantity, setQuantity, validationSchema]);

	// Function to handle increasing quantity
	const handleIncrement = () => {
		if (disabled) return;
		const newValue = quantity + 1;
		validateAndSetQuantitySync(newValue);
	};

	// Function to handle decreasing quantity
	const handleDecrement = () => {
		if (disabled) return;
		const newValue = quantity - 1;
		validateAndSetQuantitySync(newValue);
	};

	// Function to handle direct input changes
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (disabled) return;
		const valueString = event.target.value;

		// If input is empty, treat as 0 (or 1 depending on desired logic) for validation to handle
		if (valueString === "") {
			setQuantity(0); // Temporarily set to 0, validation will report required/min error
			setError("Please enter quantity"); // Show error immediately
			return;
		}

		const valueNumber = parseInt(valueString, 10);

		// Only update if it's a number
		if (!isNaN(valueNumber)) {
			// Update state immediately to respond to user
			setQuantity(valueNumber);
			// Validate the entered value
			validationSchema()
				.validate({ quantity: valueNumber })
				.then(() => setError(null)) // Valid, clear error
				.catch((err) => {
					// Invalid, display error
					if (err instanceof yup.ValidationError) setError(err.message);
				});
		}
		// If not a number (e.g., entering letter 'e'), do nothing or handle differently
	};

	// Function to handle when input loses focus (onBlur) - Final validation
	const handleBlur = () => {
		if (disabled) return;
		// Validate current value when user leaves input
		validationSchema()
			.validate({ quantity: quantity })
			.then(() => {
				// If value is valid but is 0 (due to clearing), reset to 1
				if (quantity === 0) {
					setQuantity(1);
					setError(null);
				} else {
					setError(null); // Clear error if valid
				}
			})
			.catch((err) => {
				if (err instanceof yup.ValidationError) {
					setError(err.message);
					// If error is because value < 1 (e.g., 0), can auto-correct to 1
					if (quantity < 1) {
						setQuantity(1); // Auto-correct to minimum valid value
						setError(null); // Clear error after correction
					}
					// If error is because value > actualLimit, can auto-correct to actualLimit
					else if (quantity > actualLimit) {
						setQuantity(actualLimit);
						setError(null);
					}
				}
			});
	};

	return (
		<div className={`flex flex-col space-y-2 font-sans ${disabled ? "opacity-50" : ""}`}>
			{/* Label */}
			<label htmlFor="quantity-input" className="text-sm font-medium text-gray-700">
				{label}
			</label>

			{/* Input and buttons section */}
			<div className="flex items-center space-x-2">
				{/* Decrease button */}
				<button
					type="button"
					onClick={handleDecrement}
					disabled={disabled || quantity <= 1}
					className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Decrease quantity"
				>
					-
				</button>

				{/* Quantity input field - Uses state from props */}
				<input
					id="quantity-input"
					type="number"
					value={quantity === 0 ? "" : quantity.toString()}
					onChange={handleInputChange}
					onBlur={handleBlur}
					disabled={disabled}
					className={`w-24 border px-3 py-1.5 ${
						error ? "border-red-500" : "border-gray-300"
					} rounded-md text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100`}
					min="1"
					max={actualLimit}
					step="1"
					aria-invalid={error ? "true" : "false"}
					aria-describedby={error ? "quantity-error" : undefined}
				/>

				{/* Increase button */}
				<button
					type="button"
					onClick={handleIncrement}
					disabled={disabled || quantity >= actualLimit} // Disable if state >= limit or component is disabled
					className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Increase quantity"
				>
					+
				</button>
			</div>

			{/* Display local validation error */}
			{error && (
				<p id="quantity-error" className="mt-1 text-xs text-red-600">
					{error}
				</p>
			)}
		</div>
	);
};
