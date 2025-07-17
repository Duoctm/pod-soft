/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the original function with cancel method
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;

    const debouncedFunction = function (...args: Parameters<T>): void {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };

    // Add cancel method
    debouncedFunction.cancel = function (): void {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debouncedFunction as ((...args: Parameters<T>) => void) & { cancel: () => void };
}