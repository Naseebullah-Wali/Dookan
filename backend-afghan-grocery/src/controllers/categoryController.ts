import { Request, Response, NextFunction } from 'express';
import CategoryModel from '../models/Category';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const activeOnly = req.query.active !== 'false';
        const categories = await CategoryModel.getAll(activeOnly);
        sendSuccess(res, categories);
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const category = await CategoryModel.findById(id);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        sendSuccess(res, category);
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category = await CategoryModel.create(req.body);
        sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const category = await CategoryModel.update(id, req.body);
        sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await CategoryModel.delete(id);
        sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const getCategoriesWithProductCount = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categories = await CategoryModel.getWithProductCount();
        sendSuccess(res, categories);
    } catch (error) {
        next(error);
    }
};
