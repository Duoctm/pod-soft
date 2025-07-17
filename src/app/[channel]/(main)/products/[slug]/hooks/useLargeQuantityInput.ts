import { useState, useCallback, useRef, useEffect } from 'react';
import { debounce } from '../utils/debounce';
import type { PrintingTechnology } from '@/gql/graphql';

/**
 * Hook for handling large quantity input with smooth UX
 * - Uncontrolled input to prevent lag when typing large numbers
 * - Debounced API calls to prevent excessive requests
 * - AbortController to cancel outdated requests
 */
interface UseLargeQuantityInputParams {
    onQuantityChange: (
        variantId: string,
        colorId: string,
        quantity: number,
        printingTechnology?: PrintingTechnology,
        size?: string
    ) => Promise<void>;
    debounceDelay?: number;
}

interface QuantityInputState {
    [sizeKey: string]: {
        displayValue: string; // What user sees in input
        lastCommittedValue: number; // Last value sent to API
        isCalculating: boolean; // Whether API call is in progress
    };
}

export const useLargeQuantityInput = ({
    onQuantityChange,
    debounceDelay = 300
}: UseLargeQuantityInputParams) => {
    const [quantityStates, setQuantityStates] = useState<QuantityInputState>({});
    const abortControllerRef = useRef<Map<string, AbortController>>(new Map());

    // Create debounced function with cleanup
    const debouncedUpdate = useRef(
        debounce(async (
            sizeKey: string,
            variantId: string,
            colorId: string,
            quantity: number,
            printingTechnology?: PrintingTechnology,
            size?: string
        ) => {
            // Cancel any existing request for this size
            const existingController = abortControllerRef.current.get(sizeKey);
            if (existingController) {
                existingController.abort();
            }

            // Create new AbortController for this request
            const controller = new AbortController();
            abortControllerRef.current.set(sizeKey, controller);

            try {
                // Set calculating state
                setQuantityStates(prev => ({
                    ...prev,
                    [sizeKey]: {
                        ...prev[sizeKey],
                        isCalculating: true
                    }
                }));

                // Make API call
                await onQuantityChange(variantId, colorId, quantity, printingTechnology, size);

                // If not aborted, update committed value
                if (!controller.signal.aborted) {
                    setQuantityStates(prev => ({
                        ...prev,
                        [sizeKey]: {
                            ...prev[sizeKey],
                            lastCommittedValue: quantity,
                            isCalculating: false
                        }
                    }));
                }
            } catch (error) {
                // Only log error if not aborted
                if (!controller.signal.aborted) {
                    console.error('Error updating quantity:', error);
                    setQuantityStates(prev => ({
                        ...prev,
                        [sizeKey]: {
                            ...prev[sizeKey],
                            isCalculating: false
                        }
                    }));
                }
            } finally {
                // Clean up controller
                abortControllerRef.current.delete(sizeKey);
            }
        }, debounceDelay)
    );

    // Update debounced function when dependencies change
    useEffect(() => {
        debouncedUpdate.current = debounce(async (
            sizeKey: string,
            variantId: string,
            colorId: string,
            quantity: number,
            printingTechnology?: PrintingTechnology,
            size?: string
        ) => {
            const existingController = abortControllerRef.current.get(sizeKey);
            if (existingController) {
                existingController.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current.set(sizeKey, controller);

            try {
                setQuantityStates(prev => ({
                    ...prev,
                    [sizeKey]: {
                        ...prev[sizeKey],
                        isCalculating: true
                    }
                }));

                await onQuantityChange(variantId, colorId, quantity, printingTechnology, size);

                if (!controller.signal.aborted) {
                    setQuantityStates(prev => ({
                        ...prev,
                        [sizeKey]: {
                            ...prev[sizeKey],
                            lastCommittedValue: quantity,
                            isCalculating: false
                        }
                    }));
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Error updating quantity:', error);
                    setQuantityStates(prev => ({
                        ...prev,
                        [sizeKey]: {
                            ...prev[sizeKey],
                            isCalculating: false
                        }
                    }));
                }
            } finally {
                abortControllerRef.current.delete(sizeKey);
            }
        }, debounceDelay);
    }, [onQuantityChange, debounceDelay]);

    // Cleanup on unmount
    useEffect(() => {
        const controllerMapRef = abortControllerRef.current;
        const debouncedRef = debouncedUpdate.current;

        return () => {
            // Cancel all pending requests
            controllerMapRef.forEach(controller => controller.abort());
            controllerMapRef.clear();

            // Cancel debounced calls
            if (debouncedRef && typeof debouncedRef.cancel === 'function') {
                debouncedRef.cancel();
            }
        };
    }, []);

    /**
     * Handle input change for uncontrolled input
     * Updates display value immediately, triggers debounced API call
     */
    const handleInputChange = useCallback((
        size: string,
        inputValue: string,
        variantId: string,
        colorId: string,
        printingTechnology?: PrintingTechnology
    ) => {
        const sizeKey = `${colorId}-${size}`;

        // Update display value immediately (no lag)
        setQuantityStates(prev => ({
            ...prev,
            [sizeKey]: {
                displayValue: inputValue,
                lastCommittedValue: prev[sizeKey]?.lastCommittedValue || 0,
                isCalculating: prev[sizeKey]?.isCalculating || false
            }
        }));

        // Parse and validate quantity
        const quantity = parseInt(inputValue) || 0;

        // Only trigger API call if quantity is valid and different from last committed
        if (quantity > 0) {
            debouncedUpdate.current(
                sizeKey,
                variantId,
                colorId,
                quantity,
                printingTechnology,
                size
            );
        }
    }, []);

    /**
     * Initialize quantity state for a size
     */
    const initializeQuantity = useCallback((
        size: string,
        colorId: string,
        initialQuantity: number = 0
    ) => {
        const sizeKey = `${colorId}-${size}`;
        setQuantityStates(prev => ({
            ...prev,
            [sizeKey]: {
                displayValue: initialQuantity.toString(),
                lastCommittedValue: initialQuantity,
                isCalculating: false
            }
        }));
    }, []);

    /**
     * Get quantity state for a specific size
     */
    const getQuantityState = useCallback((size: string, colorId: string) => {
        const sizeKey = `${colorId}-${size}`;
        return quantityStates[sizeKey] || {
            displayValue: '0',
            lastCommittedValue: 0,
            isCalculating: false
        };
    }, [quantityStates]);

    /**
     * Cancel all pending requests
     */
    const cancelAllRequests = useCallback(() => {
        abortControllerRef.current.forEach(controller => controller.abort());
        abortControllerRef.current.clear();

        if (debouncedUpdate.current && typeof debouncedUpdate.current.cancel === 'function') {
            debouncedUpdate.current.cancel();
        }

        // Reset calculating states
        setQuantityStates(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                updated[key] = {
                    ...updated[key],
                    isCalculating: false
                };
            });
            return updated;
        });
    }, []);

    return {
        handleInputChange,
        initializeQuantity,
        getQuantityState,
        cancelAllRequests,
        quantityStates
    };
};
