import { useCallback, useRef, useEffect } from 'react';
import { debounce } from '../utils/debounce';

/**
 * Custom hook that provides a debounced version of quantity change handler
 * to prevent excessive API calls when user types quickly
 * 
 * @param onQuantityChange The original quantity change handler function
 * @param delay Debounce delay in milliseconds (default: 300ms)
 * @returns A debounced version of the quantity change handler
 */
export const useDebouncedQuantityChange = (
    onQuantityChange: (size: string, quantity: number) => void,
    delay: number = 100
) => {
    // Store the latest callback in a ref to avoid recreating the debounced function
    const callbackRef = useRef(onQuantityChange);

    // Update the ref when the callback changes
    useEffect(() => {
        callbackRef.current = onQuantityChange;
    }, [onQuantityChange]);

    // Create a debounced version of the callback that uses the latest callback from the ref
    const debouncedCallback = useCallback(
        debounce((size: string, quantity: number) => {
            callbackRef.current(size, quantity);
        }, delay),
        [delay] // Only recreate when delay changes
    );

    // Store the last values to avoid duplicate API calls
    const lastValueRef = useRef<{ [size: string]: number }>({});

    // Wrapper function that checks if the value has changed before calling the debounced function
    const handleQuantityChange = useCallback((size: string, quantity: number) => {
        // Skip if the value hasn't changed for this size
        if (lastValueRef.current[size] === quantity) {
            return;
        }

        // Update the last value
        lastValueRef.current[size] = quantity;

        // Call the debounced function
        debouncedCallback(size, quantity);
    }, [debouncedCallback]);

    return handleQuantityChange;
};