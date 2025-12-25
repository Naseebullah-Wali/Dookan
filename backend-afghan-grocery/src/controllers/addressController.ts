import { Request, Response, NextFunction } from 'express';
import AddressModel from '../models/Address';
import { sendSuccess } from '../utils/response';

export const getMyAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const addresses = await AddressModel.findByUserId(req.user!.userId);
        sendSuccess(res, addresses);
    } catch (error) {
        next(error);
    }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = await AddressModel.create({
            ...req.body,
            user_id: req.user!.userId
        });
        sendSuccess(res, address, 'Address created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = await AddressModel.update(
            parseInt(req.params.id),
            req.user!.userId,
            req.body
        );
        sendSuccess(res, address);
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AddressModel.delete(parseInt(req.params.id), req.user!.userId);
        sendSuccess(res, null, 'Address deleted successfully', 200);
    } catch (error) {
        next(error);
    }
};
