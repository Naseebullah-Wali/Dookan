import { Request, Response, NextFunction } from 'express';
import { AppError, ServiceUnavailableError } from '../utils/errors';
import { sendError } from '../utils/response';
import config from '../config';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode);
    }

    // Handle connection timeout errors (Supabase/database connection issues)
    const errorMessage = err.message || '';
    const errorDetails = (err as any).details || '';
    const errorName = err.name || '';
    
    const isConnectionError = 
        errorMessage.includes('fetch failed') || 
        errorMessage.includes('ConnectTimeoutError') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('timeout') ||
        errorDetails.includes('Connect Timeout Error') ||
        errorName.includes('ConnectTimeoutError');

    if (isConnectionError) {
        console.error('⚠️ Connection/Timeout Error:', {
            message: errorMessage,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            details: errorDetails || (err as any).stack,
        });
        
        return sendError(
            res,
            'Service temporarily unavailable. Please try again in a moment.',
            503
        );
    }

    // Handle validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('Invalid')) {
        return sendError(res, errorMessage, 400);
    }

    // Log unexpected errors
    console.error('❌ Unexpected Error:', {
        name: err.name,
        message: errorMessage,
        stack: (err as any).stack,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
    });

    // Don't leak error details in production
    const message =
        config.env === 'development'
            ? errorMessage || 'An unexpected error occurred'
            : 'An unexpected error occurred. Please try again later.';

    return sendError(res, message, 500);
};

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    return sendError(res, `Route ${req.originalUrl} not found`, 404);
};
