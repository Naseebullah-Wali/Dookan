import { Request, Response, NextFunction } from 'express';
import OrderModel from '../models/Order';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import RecaptchaService from '../services/recaptcha.service'

export const createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        // Verify reCAPTCHA token if provided
        const token = req.body?.recaptchaToken
        if (token) {
            const ok = await RecaptchaService.verify(token)
            if (!ok) {
                throw new UnauthorizedError('reCAPTCHA verification failed')
            }
        }

        const orderData = {
            ...req.body,
            user_id: req.user.userId,
        };

        const order = await OrderModel.create(orderData);
        sendSuccess(res, order, 'Order created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const id = parseInt(req.params.id);
        const order = await OrderModel.getOrderWithItems(id);

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Check ownership unless admin
        if (req.user.role !== 'admin' && order.user_id !== req.user.userId) {
            throw new UnauthorizedError('Not authorized to view this order');
        }

        sendSuccess(res, order);
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const orders = await OrderModel.getUserOrders(Number(req.user.userId), limit, offset);
        const total = await OrderModel.count({ user_id: Number(req.user.userId) });

        sendPaginatedResponse(res, orders, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const filters = {
            status: req.query.status as string,
            payment_status: req.query.payment_status as string,
            user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
        };

        const orders = await OrderModel.getAll(filters, limit, offset);
        const total = await OrderModel.count(filters);

        sendPaginatedResponse(res, orders, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const order = await OrderModel.update(id, req.body);
        sendSuccess(res, order, 'Order status updated successfully');
    } catch (error) {
        next(error);
    }
};

export const getPublicOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const q = (req.query.q as string) || '';
        if (!q) {
            sendSuccess(res, null);
            return;
        }

        let order: any = null;

        if (/^\d+$/.test(q)) {
            const id = parseInt(q);
            order = await OrderModel.getOrderWithItemsAndAddress(id);
        } else {
            const byNumber = await OrderModel.findByOrderNumber(q);
            if (byNumber) {
                order = await OrderModel.getOrderWithItemsAndAddress(byNumber.id);
            }
        }

        if (!order) {
            sendSuccess(res, null);
            return;
        }

        // Only expose non-sensitive fields
        const publicOrder = {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            created_at: order.created_at,
            subtotal: order.subtotal,
            shipping_fee: order.shipping_fee,
            total: order.total,
            address: order.address,
            items: order.items
        };

        sendSuccess(res, publicOrder);
    } catch (error) {
        next(error);
    }
};
