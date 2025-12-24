import { Router } from 'express'
import * as settingsController from '../controllers/settingsController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Public: get a setting by key
router.get('/:key', settingsController.getSetting)

// Admin: update/insert a setting
router.put('/:key', authenticate, authorize('admin'), settingsController.upsertSetting)

export default router
