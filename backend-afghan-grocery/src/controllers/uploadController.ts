import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';

export const uploadImage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.file) {
            throw new ValidationError('No file uploaded');
        }

        // Return the path relative to the server root
        // In production, this would be a URL to S3 or similar
        const filePath = `/uploads/${req.file.filename}`;

        sendSuccess(res, { url: filePath }, 'Image uploaded successfully');
    } catch (error) {
        next(error);
    }
};
