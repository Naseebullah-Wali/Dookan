import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/response'
import MailService from '../services/mail.service'
import { telegramService, TelegramService } from '../services/telegram.service'
import { validateEmail, validateString, sanitizeString, validatePhone } from '../utils/validation'

// Create a dedicated Telegram client for inquiries using separate env vars so order/status bot remains unchanged
const inquiryTelegram = new TelegramService(process.env.TELEGRAM_INQUIRY_BOT_TOKEN, process.env.TELEGRAM_INQUIRY_CHAT_ID, process.env.TELEGRAM_INQUIRY_THREAD_ID)

// Simple in-memory rate limiter (per IP) - lightweight protection against spam
const submissionTimestamps: Map<string, number> = new Map()
const MIN_INTERVAL_MS = 1 * 60 * 1000 // 2 minutes between submissions per IP

export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown').toString()
        const now = Date.now()
        const last = submissionTimestamps.get(ip) || 0
        if (now - last < MIN_INTERVAL_MS) {
            return res.status(429).json({ success: false, message: 'Too many requests. Please wait a moment before submitting again.' })
        }
        submissionTimestamps.set(ip, now)


        const { name, email, subject = 'Inquiry', message, recaptchaToken } = req.body

        // If reCAPTCHA secret is configured, require token and verify it
        try {
            const RecaptchaService = (await import('../services/recaptcha.service')).default
            const verification = await RecaptchaService.verify(recaptchaToken, 'contact')
            if (!verification.success) {
                return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed', details: verification.error || verification })
            }
        } catch (err) {
            console.warn('reCAPTCHA verification error:', err)
            // proceed only if recaptcha not configured; otherwise block
            if (process.env.RECAPTCHA_SECRET) {
                return res.status(500).json({ success: false, message: 'reCAPTCHA verification failed' })
            }
        }

        // Validate and sanitize inputs (no phone)
        const cleanName = validateString(name, 'Name', 1, 100)
        const cleanEmail = validateEmail(email)
        const cleanSubject = sanitizeString(subject || 'Inquiry')
        const cleanMessage = validateString(message, 'Message', 5, 2000)


        // Email sending disabled for inquiry/contact. Only Telegram notification will be sent.
        // console.log('Contact message received (email sending disabled):', { name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage })

        // Also send to Telegram if configured (use inquiry-specific bot if available)
        try {
            // Prefer inquiry-specific Telegram client if configured, otherwise fallback to default
            const telegramClient = inquiryTelegram && inquiryTelegram?.sendCustomNotification ? inquiryTelegram : telegramService
            await telegramClient.sendCustomNotification(
                '📬 New Inquiry',
                `<b>From:</b> ${sanitizeString(cleanName)}\n<b>Email:</b> ${sanitizeString(cleanEmail)}\n<b>Subject:</b> ${sanitizeString(cleanSubject)}\n\n<b>Message:</b>\n${sanitizeString(cleanMessage)}`
            )
        } catch (err: any) {
            console.warn('Failed to send Telegram notification:', err.message || err)
        }

        // Acknowledgement email disabled for inquiry/contact.

        sendSuccess(res, { received: true }, 'Message received. We will contact you soon.')
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
