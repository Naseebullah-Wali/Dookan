import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').optional().trim(),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
];

// Routes
// Routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
// OAuth start endpoint (redirects user to Supabase Google consent)
router.get('/oauth/google', authController.startGoogleOAuth);
// OAuth fragment exchange: frontend posts access_token from URL fragment
router.post('/oauth/exchange', authController.exchangeOAuth);
// OAuth fallback script served to clients (avoids inline scripts so CSP doesn't block)
router.get('/oauth/fallback.js', authController.oauthFallbackScript);
// Get current authenticated user (via cookies or auth header)
router.get('/me', authenticate, authController.getCurrentUser);
// Logout: clear httpOnly cookies
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(updateProfileValidation), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordValidation), authController.changePassword);
router.get('/users', authenticate, authController.getAllUsers);
router.put('/users/:id', authenticate, authController.adminUpdateUser);

// OAuth server-side callback: Supabase redirects here with code
router.get('/oauth/callback', authController.handleOAuthCallback);

export default router;
