import { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash } from 'crypto';
import supabase from '../lib/supabaseClient';
import UserModel from '../models/User';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/auth';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import config from '../config/index';

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password, name, phone } = req.body;

        // Create user - pass plain password, Supabase handles hashing internally
        const user = await UserModel.create({
            email,
            password, // Don't hash - Supabase auth.admin.createUser expects plain text
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

        // Set httpOnly cookies for tokens (secure auth)
        const isProduction = config.env === 'production';
        // Use 'lax' in development for cross-origin requests (frontend on 5173, backend on 3000)
        const sameSiteValue = isProduction ? 'strict' : 'lax';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,        // Prevents JS access (XSS protection)
            secure: isProduction,  // HTTPS only in production
            sameSite: sameSiteValue,
            maxAge: 24 * 60 * 60 * 1000,  // 24 hours
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: sameSiteValue,
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
            path: '/',
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        sendSuccess(
            res,
            {
                user: userWithoutPassword,
                // Don't send tokens in body when using httpOnly cookies
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

        console.log(`🔐 Login attempt for email: ${email}`);

        // Authenticate with Supabase Auth API directly
        // This validates credentials against auth.users table
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error('❌ Supabase auth error:', {
                code: authError.status,
                message: authError.message,
                email,
            });
            throw new UnauthorizedError('Invalid email or password');
        }

        if (!authData.user) {
            console.error('❌ No user returned from Supabase auth');
            throw new UnauthorizedError('Invalid email or password');
        }

        console.log(`✅ Supabase auth successful for user: ${authData.user.id}`);

        // Get user profile from profiles table
        const user = await UserModel.findById(authData.user.id);
        if (!user) {
            console.error('❌ User profile not found for ID:', authData.user.id);
            throw new UnauthorizedError('User profile not found');
        }

        console.log(`✅ User profile found: ${user.email}`);

        // Generate JWT tokens for our API
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

        // Set httpOnly cookies for tokens (secure auth)
        const isProduction = config.env === 'production';
        // Use 'lax' in development for cross-origin requests (frontend on 5173, backend on 3000)
        const sameSiteValue = isProduction ? 'strict' : 'lax';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,        // Prevents JS access (XSS protection)
            secure: isProduction,  // HTTPS only in production
            sameSite: sameSiteValue,
            maxAge: 24 * 60 * 60 * 1000,  // 24 hours
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: sameSiteValue,
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
            path: '/',
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        console.log(`✅ Login successful for user: ${user.email}`);
        sendSuccess(res, {
            user: userWithoutPassword,
            // Don't send tokens in body when using httpOnly cookies
            // Frontend will use cookies automatically
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

// Get current user from cookies (for OAuth post-redirect initialization)
export const getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            res.status(401).json({ success: false, error: 'User not found' });
            return;
        }

        // Return user data (password already excluded from model)
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

// Logout: clear httpOnly cookies
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Clear httpOnly cookies by setting them with maxAge=0
        res.clearCookie('accessToken', { httpOnly: true, secure: config.env === 'production', sameSite: 'lax' });
        res.clearCookie('refreshToken', { httpOnly: true, secure: config.env === 'production', sameSite: 'lax' });
        res.clearCookie('logged_in', { httpOnly: false, secure: config.env === 'production', sameSite: 'lax' });

        sendSuccess(res, null, 'Logged out successfully');
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

        const userId = req.params.id; // UUID string, not numeric ID
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

export const startGoogleOAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SUPABASE_URL = config.supabase?.url || process.env.SUPABASE_URL;
        if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');

        // Decide OAuth flow: default to server-side code exchange for reliability.
        // Set OAUTH_FLOW=fragment to use fragment/token flow (frontend callback).
        const oauthFlow = (process.env.OAUTH_FLOW || 'code').toLowerCase();

        // Backend callback URL (must be registered in Supabase Redirect URLs when using code flow)
        const backendBase = (process.env.BACKEND_URL || config.server?.url) || `${req.protocol}://${req.get('host')}`;
        const backendCallback = `${backendBase.replace(/\/$/, '')}/api/${config.apiVersion}/auth/oauth/callback`;

        let authUrl: string;
        if (oauthFlow === 'fragment') {
            // Fragment flow: deliver token to frontend callback
            const frontendBase = process.env.FRONTEND_URL || config.frontend?.url || `${req.protocol}://${req.get('host')}`;
            const redirectTo = `${frontendBase.replace(/\/$/, '')}/auth/oauth/callback`;
            authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&response_type=token&redirect_to=${encodeURIComponent(redirectTo)}`;
        } else {
            // Server-side code flow (recommended): Supabase will redirect to backend callback with ?code=...
            authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&response_type=code&redirect_to=${encodeURIComponent(backendCallback)}`;
        }
        return res.redirect(authUrl);
    } catch (err) {
        next(err);
    }
};

// Serve fallback JS for fragment handling (keeps CSP happy)
export const oauthFallbackScript = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const frontendUrl = (process.env.FRONTEND_URL || config.frontend?.url || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
        const js = `(function(){
  try {
    var frontend = '${frontendUrl}';
    var hash = window.location.hash || '';
    if (hash && (hash.indexOf('access_token') !== -1 || hash.indexOf('id_token') !== -1 || hash.indexOf('error') !== -1)) {
      try {
        var params = new URLSearchParams(hash.replace(/^#/, ''));
        var access_token = params.get('access_token');
        var provider_token = params.get('provider_token');
        var payload = {};
        if (access_token) payload.access_token = access_token;
        if (provider_token) payload.provider_token = provider_token;
        if (!access_token && !provider_token) {
          window.location.href = frontend + '/auth/oauth/callback' + hash;
          return;
        }
        fetch('/api/${config.apiVersion}/auth/oauth/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
          }).then(function(resp){
            if (resp.ok) {
              window.location.href = frontend + '/';
            } else {
              window.location.href = frontend + '/auth/oauth/callback' + hash;
            }
          }).catch(function(){
            window.location.href = frontend + '/auth/oauth/callback' + hash;
          });
          return;
      } catch (e) {
        window.location.href = frontend + '/auth/oauth/callback' + hash;
        return;
      }
    }
    window.location.href = frontend + '/?oauth_error=missing_code';
  } catch (e) {
    try { window.location.href = '${frontendUrl}' + '/?oauth_error=unexpected'; } catch (e) { }
  }
})();`;
        res.set('Content-Type', 'application/javascript; charset=utf-8');
        res.set('Cache-Control', 'no-store');
        return res.send(js);
    } catch (err) {
        next(err);
    }
};

export const handleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Log incoming callback for debugging
        console.log('Incoming OAuth callback:', { url: req.originalUrl, query: req.query, headers: { referer: req.get('referer') || req.get('origin') } });

        const code = req.query.code as string | undefined;
        const error = req.query.error as string | undefined;

        if (error) {
            return res.redirect((process.env.FRONTEND_URL || config.frontend?.url || 'http://localhost:5173') + `/?oauth_error=${encodeURIComponent(error)}`);
        }

        if (!code) {
            // Helpful debugging message — commonly caused by Supabase returning tokens in the URL fragment
            // or by an incorrect redirect URL not whitelisted in Supabase settings.
            console.warn('OAuth callback missing code. Query:', req.query);

            // If the provider returned tokens as a URL fragment (e.g. #access_token=...), the fragment
            // is not visible to the server. Render a small HTML page which runs in the browser and
            // forwards the fragment to the frontend callback (so the SPA can exchange it with the backend).
            const frontend = process.env.FRONTEND_URL || config.frontend?.url || 'http://localhost:5173';
            const safeFrontend = String(frontend).replace(/'/g, "\\'");

            const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Processing OAuth response</title>
</head>
<body>
<p>Processing OAuth response, please wait…</p>
<!-- External script to respect CSP (no inline scripts) -->
<script src="/api/${config.apiVersion}/auth/oauth/fallback.js"></script>
</body>
</html>`;

            return res.status(200).send(html);
        }

        const SUPABASE_URL = config.supabase?.url || process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_KEY = config.supabase?.serviceKey || process.env.SUPABASE_SERVICE_KEY;
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Supabase URL/service key not configured');

        // Exchange code for tokens
        const backendBase = (process.env.BACKEND_URL || config.server?.url) || `${req.protocol}://${req.get('host')}`;
        const callbackUrl = `${backendBase.replace(/\/$/, '')}/api/${config.apiVersion}/auth/oauth/callback`;

        const tokenResp = await fetch(`${SUPABASE_URL}/auth/v1/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_to: callbackUrl }).toString(),
        });

        if (!tokenResp.ok) {
            const text = await tokenResp.text();
            throw new Error(`Token exchange failed: ${text}`);
        }

        const tokenData = (await tokenResp.json()) as any;
        const supabaseAccessToken = tokenData.access_token;
        const supabaseRefreshToken = tokenData.refresh_token;

        // Verify user info
        const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: { Authorization: `Bearer ${supabaseAccessToken}` },
        });
        if (!userResp.ok) {
            const txt = await userResp.text();
            throw new Error(`Failed to fetch user info: ${txt}`);
        }

        // Upsert local user
        // Normalize fields returned from Google vs Supabase
        const userInfo = (await userResp.json()) as any;
        const email = userInfo.email || userInfo.email_address || (userInfo.user_metadata && userInfo.user_metadata.email);
        const name = userInfo.name || (userInfo.user_metadata && (userInfo.user_metadata.full_name || userInfo.user_metadata.name)) || email;
        if (!email) {
            console.warn('No email returned from provider', { userInfo });
            return res.status(400).json({ success: false, error: 'No email returned from provider' });
        }
        let user = await UserModel.findByEmail(email);
        if (!user) {
            // User doesn't exist; create profile with the user's ID from Supabase Auth
            user = await UserModel.create({
                id: userInfo.sub || userInfo.id, // Use Google sub or Supabase uid
                email,
                password: '',
                name,
                phone: userInfo.phone || (userInfo.user_metadata && userInfo.user_metadata.phone) || null,
                is_verified: 1,
            } as any);
        }

        // Issue local JWTs
        const localAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
        const localRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

        // Set secure httpOnly cookies
        const isProd = config.env === 'production';
        res.cookie('accessToken', localAccessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 });
        res.cookie('refreshToken', localRefreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 });

        // Optionally set non-httpOnly cookie for SPA to detect login (short-lived)
        res.cookie('logged_in', '1', { httpOnly: false, secure: isProd, sameSite: 'lax', maxAge: 1000 * 60 * 10 });

        // Redirect back to frontend
        const frontend = process.env.FRONTEND_URL || config.frontend?.url || 'http://localhost:5173';
        return res.redirect(frontend);
    } catch (err) {
        next(err);
    }
};

export const exchangeOAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { access_token, provider_token } = req.body || {};
        console.log('exchangeOAuth request', { hasAccessToken: !!access_token, hasProviderToken: !!provider_token, referer: req.get('referer') || req.get('origin') });
        if (!access_token && !provider_token) return res.status(400).json({ success: false, error: 'access_token or provider_token required' });

        const SUPABASE_URL = config.supabase?.url || process.env.SUPABASE_URL;
        if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');

        // Attempt to determine user info from one of the provided tokens.
        // Try in order: Supabase access_token -> Google provider_token -> (as fallback) treat access_token as provider token
        let userInfo: any = null;
        let lastError: string | null = null;

        if (access_token) {
            try {
                const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                if (resp.ok) {
                    userInfo = await resp.json();
                } else {
                    lastError = `Supabase token check failed: ${resp.status} ${await resp.text()}`;
                }
            } catch (err: any) {
                lastError = `Supabase token check error: ${err && err.message}`;
            }
        }

        // If we don't have userInfo yet and a provider token is available, try provider (Google)
        if (!userInfo && provider_token) {
            try {
                const gresp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${provider_token}` },
                });
                if (gresp.ok) {
                    userInfo = await gresp.json();
                } else {
                    lastError = `Google provider token check failed: ${gresp.status} ${await gresp.text()}`;
                }
            } catch (err: any) {
                lastError = `Google provider token check error: ${err && err.message}`;
            }
        }

        // As a last resort, try treating access_token as a Google token
        if (!userInfo && access_token) {
            try {
                const gresp2 = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                if (gresp2.ok) {
                    userInfo = await gresp2.json();
                } else {
                    lastError = `Google token check (from access_token) failed: ${gresp2.status} ${await gresp2.text()}`;
                }
            } catch (err: any) {
                lastError = `Google token check (from access_token) error: ${err && err.message}`;
            }
        }

        if (!userInfo || !userInfo.email) {
            console.warn('exchangeOAuth failed to obtain user info', { lastError });
            return res.status(401).json({ success: false, error: 'Invalid token or unable to retrieve user info', detail: lastError });
        }

        // Upsert local user
        let user = await UserModel.findByEmail(userInfo.email);
        if (!user) {
            user = await UserModel.create({
                email: userInfo.email,
                password: '',
                name: userInfo.user_metadata?.full_name || userInfo.user_metadata?.name || userInfo.email,
                phone: userInfo.user_metadata?.phone || null,
                is_verified: 1
            } as any);
        }

        // Generate local access/refresh tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

        // Set secure httpOnly cookies
        const isProd = config.env === 'production';
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 });
        res.cookie('logged_in', '1', { httpOnly: false, secure: isProd, sameSite: 'lax', maxAge: 1000 * 60 * 10 });

        const { password: _, ...userWithoutPassword } = user as any;
        return res.json({ success: true, data: { user: userWithoutPassword } });
    } catch (err) {
        next(err);
    }
};
/**
 * Forgot Password - sends password reset link to email
 */
export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new ValidationError('Email is required');
        }

        // Check if user exists
        const user = await UserModel.findByEmail(email);
        if (!user) {
            // For security, don't reveal if email exists
            sendSuccess(res, {}, 'If an account exists with this email, a reset link has been sent');
            return;
        }

        // Generate a secure password reset token (valid for 1 hour)
        const resetToken = randomBytes(32).toString('hex');
        const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // TODO: Store reset token in database
        // For now, we're using a placeholder approach
        console.log(`🔑 Password reset token for ${email}:`, resetToken);
        console.log(`⏰ Token expires at: ${tokenExpiry}`);

        // Build reset link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Send password reset email
        const { sendPasswordResetEmail } = await import('../services/mail.service');
        const emailResult = await sendPasswordResetEmail({ email, resetLink });

        if (!emailResult.success) {
            console.warn('Failed to send password reset email:', emailResult);
            sendSuccess(res, {}, 'Password reset email could not be sent. Please try again later.');
            return;
        }

        console.info('✅ Password reset email sent successfully to:', email);
        sendSuccess(res, {}, 'If an account exists with this email, a reset link has been sent');
    } catch (error) {
        next(error);
    }
};

/**
 * Reset Password - validates token and updates password
 * NOTE: This is a simplified implementation
 * For production, store reset tokens in database with expiration times
 */
export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            throw new ValidationError('Token, email, and new password are required');
        }

        if (newPassword.length < 6) {
            throw new ValidationError('Password must be at least 6 characters long');
        }

        // Find user by email
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid reset link');
        }

        // TODO: Verify token against database stored token and expiration
        // For now, we're using a simplified approach
        // In production, you would:
        // 1. Query a password_reset_tokens table
        // 2. Check if token matches and hasn't expired
        // 3. Delete the token after successful reset
        
        // Temporary validation: just verify token exists and is valid format
        if (!token || token.length < 32) {
            throw new UnauthorizedError('Invalid or expired reset link');
        }

        console.log(`🔄 Resetting password for user: ${email}`);
        console.log(`🔑 Token validation (simplified): ${token.substring(0, 20)}...`);
        console.log(`👤 User ID: ${user.id}`);

        // Update user password - pass plain password, Supabase will hash it
        // TODO: Also invalidate all existing sessions for security
        const updateResult = await UserModel.updatePassword(user.id, newPassword);
        
        if (!updateResult) {
            console.error('❌ Failed to update password in database');
            throw new Error('Failed to update password');
        }
        console.info('✅ Password reset successfully for user:', email);
        sendSuccess(res, { email }, 'Password has been reset successfully. You can now login with your new password.');
    } catch (error) {
        console.error('❌ Reset password error:', error);
        next(error);
    }
};