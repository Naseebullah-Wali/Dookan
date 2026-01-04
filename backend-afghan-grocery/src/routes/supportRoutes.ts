import { Router } from 'express'
import { submitContact, testTelegram } from '../controllers/supportController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.post('/contact', submitContact)

// Admin only: test Telegram bot connection
router.get('/telegram/test', authenticate, authorize('admin'), testTelegram)

export default router
