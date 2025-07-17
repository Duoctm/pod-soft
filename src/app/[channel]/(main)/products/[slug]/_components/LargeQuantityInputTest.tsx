// Test component to verify large quantity input performance
import React, { useState } from 'react';

interface LargeQuantityInputTestProps {
    onQuantityChange: (size: string, quantity: number) => void;
    size: string;
    initialValue?: number;
}

/**
 * Test component for large quantity input without lag
 * Uses uncontrolled input pattern for better performance
 */
export const LargeQuantityInputTest: React.FC<LargeQuantityInputTestProps> = ({
    onQuantityChange,
    size,
    initialValue = 0
}) => {
    // Use uncontrolled input for better performance
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;

        // Don't update state immediately to prevent lag
        // Just trigger the debounced callback
        if (value !== initialValue) {
            setIsProcessing(true);
            onQuantityChange(size, value);

            // Reset processing state after a delay
            setTimeout(() => setIsProcessing(false), 500);
        }
    };

    const handleBlur = () => {
        // Ensure final value is committed on blur
        if (inputRef.current) {
            const value = parseInt(inputRef.current.value) || 0;
            onQuantityChange(size, value);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <input
                ref={inputRef}
                type="number"
                min="0"
                max="999999"
                defaultValue={initialValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`
                    w-20 px-2 py-1 border rounded 
                    ${isProcessing ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-colors duration-200
                `}
                placeholder="Qty"
            />
            {isProcessing && (
                <span className="text-xs text-blue-600 animate-pulse">
                    Updating...
                </span>
            )}
        </div>
    );
};
