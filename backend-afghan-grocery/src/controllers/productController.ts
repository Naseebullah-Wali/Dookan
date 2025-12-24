import { Request, Response, NextFunction } from 'express';
import ProductModel from '../models/Product';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const filters = {
            category_id: req.query.category ? parseInt(req.query.category as string) : undefined,
            is_featured: req.query.featured === 'true' ? true : undefined,
            is_active: req.query.active !== 'false',
            min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
            max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
            search: req.query.search as string,
            ids: req.query.ids as string | undefined,
        };

        const products = await ProductModel.getAll(filters, limit, offset);
        const total = await ProductModel.count(filters);

        sendPaginatedResponse(res, products, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const product = await ProductModel.findById(id);

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        sendSuccess(res, product);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const product = await ProductModel.create(req.body);
        sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const product = await ProductModel.update(id, req.body);
        sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await ProductModel.delete(id);
        sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const getFeaturedProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 8;
        const products = await ProductModel.getAll({ is_featured: true, is_active: true }, limit, 0);
        sendSuccess(res, products);
    } catch (error) {
        next(error);
    }
};
