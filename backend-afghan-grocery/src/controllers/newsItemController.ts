import { Request, Response, NextFunction } from 'express';
import NewsItemModel from '../models/NewsItem';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const getAllNewsItems = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const activeOnly = req.query.active !== 'false';
        const newsItems = await NewsItemModel.getAll(activeOnly);
        sendSuccess(res, newsItems);
    } catch (error) {
        next(error);
    }
};

export const getNewsItemById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const newsItem = await NewsItemModel.findById(id);

        if (!newsItem) {
            throw new NotFoundError('News item not found');
        }

        sendSuccess(res, newsItem);
    } catch (error) {
        next(error);
    }
};

export const createNewsItem = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const newsItem = await NewsItemModel.create(req.body);
        sendSuccess(res, newsItem, 'News item created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateNewsItem = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const newsItem = await NewsItemModel.update(id, req.body);
        sendSuccess(res, newsItem, 'News item updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteNewsItem = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await NewsItemModel.delete(id);
        sendSuccess(res, null, 'News item deleted successfully');
    } catch (error) {
        next(error);
    }
};
