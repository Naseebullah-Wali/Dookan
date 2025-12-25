import { Request, Response, NextFunction } from 'express';
import ReviewModel from '../models/Review';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export const createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const { product_id, rating, comment } = req.body;

        if (rating < 1 || rating > 5) {
            throw new ValidationError('Rating must be between 1 and 5');
        }

        const review = await ReviewModel.create({
            product_id,
            user_id: req.user.userId,
            rating,
            comment
        });

        sendSuccess(res, review, 'Review submitted successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getProductReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const productId = parseInt(req.params.productId);
        
        if (isNaN(productId)) {
            throw new ValidationError('Invalid product ID');
        }
        
        const reviews = await ReviewModel.getProductReviews(productId);
        sendSuccess(res, reviews);
    } catch (error) {
        next(error);
    }
};

export const getUserReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const reviews = await ReviewModel.getUserReviews(req.user.userId);
        sendSuccess(res, reviews);
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const id = parseInt(req.params.id);
        const deleted = await ReviewModel.delete(id, req.user.userId);

        if (deleted) {
            sendSuccess(res, null, 'Review deleted successfully');
        } else {
            sendSuccess(res, null, 'Review not found or unauthorized', 404);
        }
    } catch (error) {
        next(error);
    }
};
