import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/auth';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import UserModel from '../models/User';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        let token: string | undefined;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if ((req as any).cookies && (req as any).cookies.accessToken) {
            token = (req as any).cookies.accessToken;
        }

        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        const decoded = verifyAccessToken(token as string);
        req.user = decoded as JwtPayload;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            next(new UnauthorizedError('Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new UnauthorizedError('Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError('Insufficient permissions');
        }

        next();
    };
};

export const optionalAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};

/**
 * Middleware to check if user's email is verified
 * Use this for routes that require email verification
 */
export const requireEmailVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError('Authentication required');
        }

        // Get user from database to check email verification status
        const userModel = new UserModel();
        const user = await userModel.findById(req.user.userId);
        
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (!user.email_verified) {
            const response = {
                success: false,
                error: 'Email verification required',
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email address to access this feature. Check your inbox for the verification link.',
                data: {
                    email: user.email,
                    requireEmailVerification: true,
                }
            };
            res.status(403).json(response);
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
};
