import { Router } from 'express'
import { submitContact } from '../controllers/supportController'

const router = Router()

router.post('/contact', submitContact)

export default router
