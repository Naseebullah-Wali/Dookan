import { Router } from 'express';
import {
    getAllNewsItems,
    getNewsItemById,
    createNewsItem,
    updateNewsItem,
    deleteNewsItem
} from '../controllers/newsItemController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllNewsItems);
router.get('/:id', getNewsItemById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createNewsItem);
router.put('/:id', authenticate, authorize('admin'), updateNewsItem);
router.delete('/:id', authenticate, authorize('admin'), deleteNewsItem);

export default router;
