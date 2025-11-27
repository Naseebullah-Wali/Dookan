import { Response } from 'express';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: any[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    if (message) {
        response.message = message;
    }

    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any[]
): Response => {
    const response: ApiResponse = {
        success: false,
        error: message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
): Response => {
    const response: ApiResponse<T[]> = {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };

    if (message) {
        response.message = message;
    }

    return res.status(200).json(response);
};
