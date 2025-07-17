import { type PrintingTechnology } from "@/gql/graphql";

/**
 * Interface for pricing request parameters
 */
export interface PricingRequestParams {
    variantId: string;
    colorId: string;
    quantity: number;
    printingTechnology?: PrintingTechnology;
    size?: string;
}

/**
 * Interface for request metadata
 */
interface RequestMetadata {
    controller: AbortController;
    timestamp: number;
    retryCount: number;
    params: PricingRequestParams;
}

/**
 * Utility class to manage API requests with cancellation, deduplication, and retry logic
 */
export class RequestManager {
    private pendingRequests: Map<string, RequestMetadata>;
    private requestQueue: PricingRequestParams[];
    private isProcessing: boolean;
    private maxRetries: number;
    private retryDelay: number;

    /**
     * Creates a new RequestManager instance
     * @param maxRetries Maximum number of retries for failed requests (default: 3)
     * @param retryDelay Base delay for retries in milliseconds (default: 1000)
     */
    constructor(maxRetries = 3, retryDelay = 1000) {
        this.pendingRequests = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }

    /**
     * Creates a unique key for a pricing request based on its parameters
     */
    private createRequestKey(params: PricingRequestParams): string {
        const { variantId, colorId, quantity, printingTechnology, size } = params;
        return `${variantId}:${colorId}:${quantity}:${printingTechnology || 'none'}:${size || 'none'}`;
    }

    /**
     * Cancels a pending request if it exists
     */
    public cancelRequest(params: PricingRequestParams): boolean {
        const key = this.createRequestKey(params);
        const metadata = this.pendingRequests.get(key);

        if (metadata) {
            metadata.controller.abort();
            this.pendingRequests.delete(key);

            // Also remove from queue if present
            this.requestQueue = this.requestQueue.filter(
                queuedParams => this.createRequestKey(queuedParams) !== key
            );

            return true;
        }

        return false;
    }

    /**
     * Cancels all pending requests
     */
    public cancelAllRequests(): void {
        this.pendingRequests.forEach(metadata => {
            metadata.controller.abort();
        });
        this.pendingRequests.clear();
        this.requestQueue = [];
        this.isProcessing = false;
    }

    /**
     * Registers a new request and returns an AbortController
     * If a request with the same key exists, it will be cancelled first
     */
    public registerRequest(params: PricingRequestParams): AbortController {
        const key = this.createRequestKey(params);

        // Cancel existing request with the same key
        this.cancelRequest(params);

        // Create new controller
        const controller = new AbortController();

        // Store metadata
        this.pendingRequests.set(key, {
            controller,
            timestamp: Date.now(),
            retryCount: 0,
            params: { ...params }
        });

        return controller;
    }

    /**
     * Completes a request and removes it from pending requests
     */
    public completeRequest(params: PricingRequestParams): void {
        const key = this.createRequestKey(params);
        this.pendingRequests.delete(key);

        // Process next request in queue if any
        this.processNextRequest();
    }

    /**
     * Marks a request as failed and retries if retry count is below max retries
     */
    public retryRequest(params: PricingRequestParams, _error: Error): boolean {
        const key = this.createRequestKey(params);
        const metadata = this.pendingRequests.get(key);

        if (!metadata) {
            return false;
        }

        // Increment retry count
        metadata.retryCount++;

        // Check if we should retry
        if (metadata.retryCount <= this.maxRetries) {
            // Calculate exponential backoff delay
            const delay = this.retryDelay * Math.pow(2, metadata.retryCount - 1);

            // Add to queue with delay
            setTimeout(() => {
                this.queueRequest(params);
            }, delay);

            return true;
        }

        // Max retries reached, remove from pending requests
        this.pendingRequests.delete(key);
        return false;
    }

    /**
     * Queues a request to be processed
     */
    public queueRequest(params: PricingRequestParams): void {
        const key = this.createRequestKey(params);

        // Don't queue if already pending
        if (this.pendingRequests.has(key)) {
            return;
        }

        // Add to queue
        this.requestQueue.push({ ...params });

        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processNextRequest();
        }
    }

    /**
     * Processes the next request in the queue
     */
    private processNextRequest(): void {
        // If no more requests in queue, mark as not processing
        if (this.requestQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        // Mark as processing
        this.isProcessing = true;

        // Get next request
        const params = this.requestQueue.shift()!;

        // Register request (this will create a new controller)
        this.registerRequest(params);

        // Note: The actual API call should be made by the caller using the controller
    }

    /**
     * Checks if a request with the same parameters is already pending
     */
    public isRequestPending(params: PricingRequestParams): boolean {
        const key = this.createRequestKey(params);
        return this.pendingRequests.has(key);
    }

    /**
     * Gets the number of pending requests
     */
    public getPendingRequestCount(): number {
        return this.pendingRequests.size;
    }

    /**
     * Gets the total number of requests (pending + queued)
     */
    public getTotalRequestCount(): number {
        return this.pendingRequests.size + this.requestQueue.length;
    }

    /**
     * Cleans up old requests that might have been forgotten
     * @param maxAge Maximum age of requests in milliseconds (default: 30 seconds)
     */
    public cleanupOldRequests(maxAge: number = 30000): void {
        const now = Date.now();

        this.pendingRequests.forEach((metadata, key) => {
            if (now - metadata.timestamp > maxAge) {
                // Request is too old, cancel and remove it
                metadata.controller.abort();
                this.pendingRequests.delete(key);
            }
        });
    }

    /**
     * Deduplicates requests with similar parameters
     * This can be used to combine requests that are very similar
     * @param similarityCheck Function to check if two requests are similar
     */
    public deduplicateRequests(
        similarityCheck: (a: PricingRequestParams, b: PricingRequestParams) => boolean
    ): void {
        // Create a list of keys to keep
        const keysToKeep = new Set<string>();

        // Group similar requests
        const groups: PricingRequestParams[][] = [];

        // Convert map to array for easier processing
        const entries = Array.from(this.pendingRequests.entries());

        // Process each entry
        for (const [key, metadata] of entries) {
            // Check if this request is similar to any existing group
            let foundGroup = false;

            for (const group of groups) {
                if (similarityCheck(group[0], metadata.params)) {
                    // Add to existing group
                    group.push(metadata.params);
                    foundGroup = true;
                    break;
                }
            }

            if (!foundGroup) {
                // Create new group
                groups.push([metadata.params]);
                // Keep the first request in each group
                keysToKeep.add(key);
            }
        }

        // Cancel requests that are not in keysToKeep
        this.pendingRequests.forEach((metadata, key) => {
            if (!keysToKeep.has(key)) {
                metadata.controller.abort();
                this.pendingRequests.delete(key);
            }
        });
    }
}