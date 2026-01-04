import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// Create CSRF protection middleware
// Uses double-submit cookie pattern for security
// NOTE: CSRF cookie MUST NOT be httpOnly because frontend needs to read it
// and send it back in X-CSRF-Token header for validation
import config from '../config';

const csrfProtection = csrf({
    cookie: {
        httpOnly: false,    // CSRF cookie MUST be readable by JS for double-submit pattern
        // Use secure cookies in production only
        secure: config.env === 'production',
        // In development we use 'lax' so the cookie can be set over HTTP (SameSite=None requires Secure)
        // In production we use 'strict' for stronger protection
        sameSite: config.env === 'production' ? 'strict' : 'lax',
    }
});

// Middleware to attach CSRF token to request
export const csrfToken = (req: Request, res: Response, next: NextFunction) => {
    res.locals.csrfToken = (req as any).csrfToken();
    next();
};

// Export the CSRF protection middleware
export default csrfProtection;
