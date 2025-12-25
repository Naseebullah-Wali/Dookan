import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_SECURE = (process.env.SMTP_SECURE || 'false') === 'true'
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.VITE_SUPPORT_EMAIL || 'info@dookan.af'

// Log email service configuration status
if (!SMTP_HOST) {
    console.warn('⚠️ Email service not configured. Contact form emails will be queued but not sent. Configure SMTP_HOST to enable email.')
}

const transporter = SMTP_HOST ? nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
}) : null

export async function sendContactEmail({ name, email, phone, subject, message }: { name?: string; email?: string; phone?: string; subject?: string; message?: string }) {
    try {
        const mailOptions = {
            from: `${name || 'Website Contact'} <${SUPPORT_EMAIL}>`,
            to: SUPPORT_EMAIL,
            subject: `[Contact] ${subject || 'New message from website'}`,
            text: `Name: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message || ''}`,
            html: `<p><strong>Name:</strong> ${name || 'N/A'}</p><p><strong>Email:</strong> ${email || 'N/A'}</p><p><strong>Phone:</strong> ${phone || 'N/A'}</p><hr/><p>${(message || '').replace(/\n/g, '<br/>')}</p>`
        }

        // If no SMTP configured, log warning and return graceful failure
        if (!transporter) {
            console.warn('⚠️ Email service unavailable - SMTP not configured. Contact message not sent.', {
                from: email,
                subject,
                timestamp: new Date().toISOString()
            })
            return {
                success: false,
                error: 'Email service unavailable',
                message: 'Your message was received but email notification could not be sent.'
            }
        }

        const info = await transporter.sendMail(mailOptions)
        console.info('📧 Email sent successfully:', {
            messageId: info.messageId,
            to: SUPPORT_EMAIL,
            subject,
            timestamp: new Date().toISOString()
        })
        return {
            success: true,
            messageId: info.messageId
        }
    } catch (error: any) {
        console.error('❌ Failed to send email:', {
            message: error.message,
            code: error.code,
            timestamp: new Date().toISOString(),
            stack: error.stack
        })
        
        // Distinguish between different error types
        if (error.code === 'EAUTH') {
            return {
                success: false,
                error: 'Authentication failed',
                message: 'Email service authentication failed.'
            }
        }
        if (error.code === 'ECONNREFUSED') {
            return {
                success: false,
                error: 'Connection refused',
                message: 'Email service temporarily unavailable.'
            }
        }
        
        return {
            success: false,
            error: 'Send failed',
            message: 'Failed to send email. Please try again later.'
        }
    }
}

export default { sendContactEmail }
