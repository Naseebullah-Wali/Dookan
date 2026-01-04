import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/response'
import MailService from '../services/mail.service'
import { telegramService } from '../services/telegram.service'

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

        // Also send to Telegram if configured
        try {
            await telegramService.sendCustomNotification(
                '📬 New Contact Message',
                `<b>From:</b> ${name}\n<b>Email:</b> ${email}\n<b>Phone:</b> ${phone || 'N/A'}\n<b>Subject:</b> ${subject}\n\n<b>Message:</b>\n${message}`
            )
        } catch (err) {
            console.warn('Failed to send Telegram notification:', err.message)
        }

        sendSuccess(res, { received: true }, 'Message received')
    } catch (err) {
        next(err)
    }
}

export const testTelegram = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await telegramService.testConnection()
        sendSuccess(res, result, result.message)
    } catch (err) {
        next(err)
    }
}

export default { submitContact, testTelegram }
