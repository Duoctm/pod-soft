import { useCallback, useRef, useEffect } from 'react';
import { debounce } from '../utils/debounce';

/**
 * Custom hook for debounced quantity input handling
 * Prevents excessive API calls when user types rapidly
 */
export const useDeboucedQuantityInput = (
    onQuantityChange: (size: string, quantity: number) => void,
    delay: number = 300
) => {
    const debouncedCallback = useRef(
        debounce((size: string, quantity: number) => {
            // Validate quantity before calling callback
            const validQuantity = Math.max(0, Math.floor(quantity));
            onQuantityChange(size, validQuantity);
        }, delay)
    );

    // Update debounced callback when onQuantityChange changes
    useEffect(() => {
        debouncedCallback.current = debounce((size: string, quantity: number) => {
            const validQuantity = Math.max(0, Math.floor(quantity));
            onQuantityChange(size, validQuantity);
        }, delay);
    }, [onQuantityChange, delay]);

    // Cleanup function to cancel pending debounced calls
    useEffect(() => {
        const current = debouncedCallback.current;
        return () => {
            if (current && typeof current.cancel === 'function') {
                current.cancel();
            }
        };
    }, []);

    const handleQuantityChange = useCallback((size: string, quantity: number) => {
        // Immediate validation for edge cases
        if (quantity < 0) return;

        // Call debounced function
        debouncedCallback.current(size, quantity);
    }, []);

    const cancelPendingChange = useCallback(() => {
        if (debouncedCallback.current && typeof debouncedCallback.current.cancel === 'function') {
            debouncedCallback.current.cancel();
        }
    }, []);

    return {
        handleQuantityChange,
        cancelPendingChange
    };
};
