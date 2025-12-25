/**
 * Retry Utility - Handles retrying failed operations with exponential backoff
 */

interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
}

const defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 5000,
    backoffFactor: 2,
};

/**
 * Retry a failed operation with exponential backoff
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise with the result of the operation
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...defaultOptions, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on the last attempt
            if (attempt === opts.maxAttempts) {
                break;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
                opts.maxDelay
            );

            console.warn(
                `Attempt ${attempt} failed, retrying in ${delay}ms:`,
                (error as any)?.message
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Retry with timeout - Combines retry logic with timeout handling
 * @param fn - Async function to retry
 * @param timeoutMs - Timeout per attempt in milliseconds
 * @param options - Retry options
 * @returns Promise with the result
 */
export async function retryWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number = 10000,
    options: RetryOptions = {}
): Promise<T> {
    const withTimeout = async () => {
        return Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
                setTimeout(
                    () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
                    timeoutMs
                )
            ),
        ]);
    };

    return retry(withTimeout, options);
}
