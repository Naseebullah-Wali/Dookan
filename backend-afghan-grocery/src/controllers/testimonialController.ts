import { Request, Response, NextFunction } from 'express';
import TestimonialModel from '../models/Testimonial';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const getAllTestimonials = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const activeOnly = req.query.active !== 'false';
        const testimonials = await TestimonialModel.getAll(activeOnly);
        sendSuccess(res, testimonials);
    } catch (error) {
        next(error);
    }
};

export const getTestimonialById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const testimonial = await TestimonialModel.findById(id);

        if (!testimonial) {
            throw new NotFoundError('Testimonial not found');
        }

        sendSuccess(res, testimonial);
    } catch (error) {
        next(error);
    }
};

export const createTestimonial = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const testimonial = await TestimonialModel.create(req.body);
        sendSuccess(res, testimonial, 'Testimonial created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateTestimonial = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const testimonial = await TestimonialModel.update(id, req.body);
        sendSuccess(res, testimonial, 'Testimonial updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteTestimonial = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await TestimonialModel.delete(id);
        sendSuccess(res, null, 'Testimonial deleted successfully');
    } catch (error) {
        next(error);
    }
};
