import { Router } from 'express'
const router = Router()

// Debug routes disabled (reCAPTCHA removed)
router.all('*', (_req, res) => res.status(404).json({ error: 'Not found' }))

export default router
