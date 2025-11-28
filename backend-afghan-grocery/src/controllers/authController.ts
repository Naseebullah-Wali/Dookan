import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/auth';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password, name, phone } = req.body;

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await UserModel.create({
            email,
            password: hashedPassword,
            name,
            phone,
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        sendSuccess(
            res,
            {
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            },
            'Registration successful',
            201
        );
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        sendSuccess(res, {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        }, 'Login successful');
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        sendSuccess(res, userWithoutPassword);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const { name, phone, email } = req.body;

        const updatedUser = await UserModel.update(req.user.userId, {
            name,
            phone,
            email,
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;

        sendSuccess(res, userWithoutPassword, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const { currentPassword, newPassword } = req.body;

        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Verify current password
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new ValidationError('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await UserModel.update(req.user.userId, { password: hashedPassword } as any);

        sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Only admin can list users
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const users = await UserModel.getAll();

        // Remove passwords
        const safeUsers = users.map(user => {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        sendSuccess(res, safeUsers);
    } catch (error) {
        next(error);
    }
};

export const adminUpdateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Only admin can update other users
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const userId = parseInt(req.params.id);
        const { name, email, role, phone } = req.body;

        const updatedUser = await UserModel.update(userId, {
            name,
            email,
            role,
            phone
        } as any);

        const { password: _, ...userWithoutPassword } = updatedUser;
        sendSuccess(res, userWithoutPassword, 'User updated successfully');
    } catch (error) {
        next(error);
    }
};
