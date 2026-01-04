import { Request, Response, NextFunction } from 'express';
import OrderModel from '../models/Order';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { telegramService } from '../services/telegram.service';

export const createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const orderData = {
            ...req.body,
            user_id: req.user.userId,
        };

        const order = await OrderModel.create(orderData);

        // Send Telegram notification for new order (async, don't await to not block response)
        OrderModel.getOrderWithItemsAndAddress(order.id).then(async (fullOrder) => {
            if (fullOrder) {
                try {
                    await telegramService.sendNewOrderNotification({
                        orderId: fullOrder.id,
                        orderNumber: fullOrder.order_number,
                        customerName: fullOrder.address?.full_name || 'N/A',
                        customerPhone: fullOrder.address?.phone || 'N/A',
                        address: {
                            street: fullOrder.address?.street || '',
                            city: fullOrder.address?.city || '',
                            state: fullOrder.address?.state,
                            country: fullOrder.address?.country || 'Afghanistan',
                        },
                        items: fullOrder.items.map((item: any) => ({
                            name: item.product_name,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        subtotal: fullOrder.subtotal,
                        shippingFee: fullOrder.shipping_fee,
                        total: fullOrder.total,
                        paymentMethod: fullOrder.payment_method,
                        paymentStatus: fullOrder.payment_status,
                        status: fullOrder.status,
                        notes: fullOrder.notes,
                    });
                } catch (telegramError) {
                    console.error('[Telegram] Failed to send new order notification:', telegramError);
                }
            }
        }).catch(err => console.error('[Telegram] Error fetching order for notification:', err));

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
        
        // Get the old order state first for comparison
        const oldOrder = await OrderModel.findById(id);
        const oldStatus = oldOrder?.status;
        const oldPaymentStatus = oldOrder?.payment_status;
        
        const order = await OrderModel.update(id, req.body);

        // Send Telegram notification for status updates (async, don't block response)
        if (oldOrder && (req.body.status || req.body.payment_status)) {
            OrderModel.getOrderWithItemsAndAddress(order.id).then(async (fullOrder) => {
                if (fullOrder) {
                    try {
                        // Check if order status changed
                        if (req.body.status && req.body.status !== oldStatus) {
                            await telegramService.sendStatusUpdateNotification({
                                orderId: fullOrder.id,
                                orderNumber: fullOrder.order_number,
                                customerName: fullOrder.address?.full_name || 'N/A',
                                oldStatus: oldStatus || 'pending',
                                newStatus: req.body.status,
                                paymentStatus: fullOrder.payment_status,
                                trackingNumber: fullOrder.tracking_number,
                            });
                        }
                        
                        // Check if payment status changed
                        if (req.body.payment_status && req.body.payment_status !== oldPaymentStatus) {
                            await telegramService.sendPaymentStatusNotification(
                                fullOrder.id,
                                fullOrder.order_number,
                                fullOrder.address?.full_name || 'N/A',
                                fullOrder.payment_method,
                                oldPaymentStatus || 'pending',
                                req.body.payment_status,
                                fullOrder.total
                            );
                        }
                    } catch (telegramError) {
                        console.error('[Telegram] Failed to send status update notification:', telegramError);
                    }
                }
            }).catch(err => console.error('[Telegram] Error fetching order for notification:', err));
        }

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
