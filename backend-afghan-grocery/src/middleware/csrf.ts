import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// Create CSRF protection middleware
// Uses double-submit cookie pattern for security
// NOTE: CSRF cookie MUST NOT be httpOnly because frontend needs to read it
// and send it back in X-CSRF-Token header for validation
const csrfProtection = csrf({
    cookie: {
        httpOnly: false,    // CSRF cookie MUST be readable by JS for double-submit pattern
        secure: false,      // Allow HTTP in development for testing
        sameSite: 'lax',    // More permissive for development; use 'strict' in production
    }
});

// Middleware to attach CSRF token to request
export const csrfToken = (req: Request, res: Response, next: NextFunction) => {
    res.locals.csrfToken = req.csrfToken();
    next();
};

// Export the CSRF protection middleware
export default csrfProtection;
