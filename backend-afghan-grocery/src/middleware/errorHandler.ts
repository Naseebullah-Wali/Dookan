import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
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

    // Log unexpected errors
    console.error('❌ Unexpected Error:', err);

    // Don't leak error details in production
    const message =
        config.env === 'development'
            ? err.message
            : 'An unexpected error occurred';

    return sendError(res, message, 500);
};

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    return sendError(res, `Route ${req.originalUrl} not found`, 404);
};
