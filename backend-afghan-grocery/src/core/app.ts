import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';
import config from '../config';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import authRoutes from '../routes/authRoutes';
import productRoutes from '../routes/productRoutes';
import categoryRoutes from '../routes/categoryRoutes';
import orderRoutes from '../routes/orderRoutes';
import wishlistRoutes from '../routes/wishlistRoutes';
import reviewRoutes from '../routes/reviewRoutes';
import uploadRoutes from '../routes/uploadRoutes';
import addressRoutes from '../routes/addressRoutes';
import testimonialRoutes from '../routes/testimonialRoutes';
import newsItemRoutes from '../routes/newsItemRoutes';
import paymentRoutes from '../routes/paymentRoutes';
import supportRoutes from '../routes/supportRoutes';
import settingsRoutes from '../routes/settingsRoutes';
import path from 'path';

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        // Request ID tracking for logging and debugging
        this.app.use((req, res, next) => {
            (req as any).id = req.headers['x-request-id'] || randomUUID();
            res.setHeader('X-Request-ID', (req as any).id);
            next();
        });

        // Security
        this.app.use(helmet());

        // CORS
        this.app.use(cors(config.cors));

        // General rate limiting
        const limiter = rateLimit({
            windowMs: config.rateLimit.windowMs,
            max: config.rateLimit.maxRequests,
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);

        // Strict rate limiting for auth endpoints (prevent brute force)
        const authLimiter = rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 5, // 5 attempts per hour
            message: 'Too many login attempts. Please try again in 1 hour.',
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
        });

        // Strict rate limiting for payment endpoints
        const paymentLimiter = rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 10, // 10 payment attempts per hour
            message: 'Too many payment requests. Please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });

        // Body parsing with size limits
        this.app.use(express.json({ limit: '1mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));
        this.app.use(cookieParser());

        // Compression
        this.app.use(compression());

        // Serve static files from uploads directory
        this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

        // Logging with request ID
        if (config.env === 'development') {
            this.app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
                stream: {
                    write: (message: string) => {
                        console.log(message.trim());
                    }
                }
            }));
        } else {
            this.app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
        }

        // Expose rate limiters for route-specific use
        (this.app as any).authLimiter = authLimiter;
        (this.app as any).paymentLimiter = paymentLimiter;
    }

    private initializeRoutes(): void {
        const apiVersion = config.apiVersion;

        // Health check
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                environment: config.env,
            });
        });

        // API routes
        // Auth routes with strict rate limiting to prevent brute force
        this.app.use(`/api/${apiVersion}/auth`, (this.app as any).authLimiter, authRoutes);
        this.app.use(`/api/${apiVersion}/products`, productRoutes);
        this.app.use(`/api/${apiVersion}/categories`, categoryRoutes);
        this.app.use(`/api/${apiVersion}/orders`, orderRoutes);
        this.app.use(`/api/${apiVersion}/wishlist`, wishlistRoutes);
        this.app.use(`/api/${apiVersion}/reviews`, reviewRoutes);
        this.app.use(`/api/${apiVersion}/upload`, uploadRoutes);
        this.app.use(`/api/${apiVersion}/addresses`, addressRoutes);
        this.app.use(`/api/${apiVersion}/testimonials`, testimonialRoutes);
        this.app.use(`/api/${apiVersion}/news`, newsItemRoutes);
        this.app.use(`/api/${apiVersion}/settings`, settingsRoutes);
        // Payment routes with strict rate limiting
        this.app.use(`/api/${apiVersion}/payments`, (this.app as any).paymentLimiter, paymentRoutes);
        this.app.use(`/api/${apiVersion}/support`, supportRoutes);

        // Welcome route
        this.app.get('/', (_req, res) => {
            res.json({
                message: 'Welcome to Afghan Grocery API',
                version: apiVersion,
                documentation: '/api/docs',
            });
        });
    }

    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use(notFoundHandler);

        // Global error handler
        this.app.use(errorHandler);
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log('=================================');
            console.log(`🚀 Server running on port ${config.port}`);
            console.log(`📝 Environment: ${config.env}`);
            console.log(`🌐 API Version: ${config.apiVersion}`);
            console.log('=================================');
        });
    }
}

export default App;
