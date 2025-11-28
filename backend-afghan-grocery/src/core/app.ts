import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
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
        // Security
        this.app.use(helmet());

        // CORS
        this.app.use(cors(config.cors));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: config.rateLimit.windowMs,
            max: config.rateLimit.maxRequests,
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(cookieParser());

        // Compression
        this.app.use(compression());

        // Serve static files from uploads directory
        this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

        // Logging
        if (config.env === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined'));
        }
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
        this.app.use(`/api/${apiVersion}/auth`, authRoutes);
        this.app.use(`/api/${apiVersion}/products`, productRoutes);
        this.app.use(`/api/${apiVersion}/categories`, categoryRoutes);
        this.app.use(`/api/${apiVersion}/orders`, orderRoutes);
        this.app.use(`/api/${apiVersion}/wishlist`, wishlistRoutes);
        this.app.use(`/api/${apiVersion}/reviews`, reviewRoutes);
        this.app.use(`/api/${apiVersion}/upload`, uploadRoutes);
        this.app.use(`/api/${apiVersion}/addresses`, addressRoutes);
        this.app.use(`/api/${apiVersion}/testimonials`, testimonialRoutes);
        this.app.use(`/api/${apiVersion}/news`, newsItemRoutes);

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
