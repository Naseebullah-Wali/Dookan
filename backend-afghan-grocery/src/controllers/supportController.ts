import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/response'
import MailService from '../services/mail.service'

export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, subject, message } = req.body

        // Try to send email to support inbox. If SMTP not configured, fall back to logging.
        try {
            await MailService.sendContactEmail({ name, email, phone, subject, message })
        } catch (err) {
            console.warn('Failed to send contact email (SMTP may be missing):', err.message)
            console.log('Contact message received:', { name, email, phone, subject, message })
        }

        sendSuccess(res, { received: true }, 'Message received')
    } catch (err) {
        next(err)
    }
}

export default { submitContact }
