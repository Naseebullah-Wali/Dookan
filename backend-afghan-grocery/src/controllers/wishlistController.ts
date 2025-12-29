import { Request, Response, NextFunction } from 'express';
import WishlistModel from '../models/Wishlist';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export const getUserWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const items = await WishlistModel.getUserWishlist(req.user.userId);
        sendSuccess(res, items);
    } catch (error) {
        next(error);
    }
};

export const addToWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const { product_id } = req.body;
        const item = await WishlistModel.add(req.user.userId, product_id);
        sendSuccess(res, item, 'Added to wishlist', 201);
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: 'Invalid wishlist item ID' });
            return;
        }

        console.log('removeFromWishlist:', { itemId: id, userId: req.user.userId });
        const removed = await WishlistModel.removeById(id, req.user.userId);
        console.log('removeFromWishlist result:', { removed });

        if (removed) {
            sendSuccess(res, null, 'Removed from wishlist');
        } else {
            res.status(404).json({ success: false, error: 'Wishlist item not found' });
        }
    } catch (error) {
        next(error);
    }
};

export const clearWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        await WishlistModel.clear(req.user.userId);
        sendSuccess(res, null, 'Wishlist cleared');
    } catch (error) {
        next(error);
    }
};
