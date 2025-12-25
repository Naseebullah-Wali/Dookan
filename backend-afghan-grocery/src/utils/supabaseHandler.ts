/**
 * Utility function to handle Supabase errors gracefully
 * Converts network/connection errors into proper AppError instances
 */

export const handleSupabaseError = (error: any): never => {
    const errorMessage = error.message || '';
    const errorDetails = error.details || '';

    // Check for connection timeout errors
    if (
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('ConnectTimeoutError') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorDetails.includes('Connect Timeout Error')
    ) {
        const timeoutErr = new Error('Database connection failed. Please try again in a moment.');
        (timeoutErr as any).statusCode = 503;
        throw timeoutErr;
    }

    // For other errors, re-throw as-is (they'll be caught by error handler)
    throw error;
};

/**
 * Wraps a Supabase promise with error handling
 * Usage: await withSupabaseErrorHandling(supabase.from(...).select(...))
 */
export const withSupabaseErrorHandling = async <T>(
    promise: Promise<{ data: T | null; error: any }>
): Promise<T | null> => {
    try {
        const { data, error } = await promise;
        if (error) {
            handleSupabaseError(error);
        }
        return data;
    } catch (err) {
        // If it's a network/timeout error, it's already been converted to proper error
        if ((err as any).statusCode === 503) {
            throw err;
        }
        // For other errors, throw as-is
        throw err;
    }
};
