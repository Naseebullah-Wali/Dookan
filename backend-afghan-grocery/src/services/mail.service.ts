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

export async function sendContactEmail({ name, email, phone, subject, message, isOrderStatus }: { name?: string; email?: string; phone?: string; subject?: string; message?: string; isOrderStatus?: boolean }) {
    try {
        const isOrder = !!isOrderStatus;
        const mailOptions = isOrder ? {
            from: `Dookan Support <${SUPPORT_EMAIL}>`,
            to: email,
            subject: subject || 'Order Status Update',
            text: message || '',
            html: (message || '').replace(/\n/g, '<br/>')
        } : {
            from: `${name || 'Website Contact'} <${SUPPORT_EMAIL}>`,
            to: SUPPORT_EMAIL,
            subject: `[Contact] ${subject || 'New message from website'}`,
            text: `Name: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message || ''}`,
            html: `<p><strong>Name:</strong> ${name || 'N/A'}</p><p><strong>Email:</strong> ${email || 'N/A'}</p><p><strong>Phone:</strong> ${phone || 'N/A'}</p><hr/><p>${(message || '').replace(/\n/g, '<br/>')}</p>`
        };

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

export async function sendPasswordResetEmail({ email, resetLink }: { email: string; resetLink: string }) {
    try {
        const mailOptions = {
            from: `Dookan Support <${SUPPORT_EMAIL}>`,
            to: email,
            subject: 'Reset Your Password - Dookan',
            text: `Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this email, please ignore it.`,
            html: `
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Click the link below to proceed:</p>
                <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
                <p>Or copy and paste this link in your browser:</p>
                <p>${resetLink}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <hr/>
                <p>If you did not request this email, please ignore it. Your account is secure.</p>
            `
        }

        // If no SMTP configured, log warning and return graceful failure
        if (!transporter) {
            console.warn('⚠️ Email service unavailable - SMTP not configured. Password reset email not sent.', {
                to: email,
                timestamp: new Date().toISOString()
            })
            return {
                success: false,
                error: 'Email service unavailable',
                message: 'Email service is temporarily unavailable. Please try again later.'
            }
        }

        const info = await transporter.sendMail(mailOptions)
        console.info('📧 Password reset email sent successfully:', {
            messageId: info.messageId,
            to: email,
            timestamp: new Date().toISOString()
        })
        return {
            success: true,
            messageId: info.messageId
        }
    } catch (error: any) {
        console.error('❌ Failed to send password reset email:', {
            message: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        })
        
        return {
            success: false,
            error: 'Send failed',
            message: 'Failed to send password reset email. Please try again later.'
        }
    }
}

export async function sendAcknowledgementEmail({ toEmail, name }: { toEmail: string; name?: string }) {
    try {
        if (!transporter) {
            console.warn('⚠️ Email service unavailable - cannot send acknowledgement email.')
            return { success: false, message: 'Email service unavailable' }
        }

        const mailOptions = {
            from: `Dookan Support <${SUPPORT_EMAIL}>`,
            to: toEmail,
            subject: 'Thank you for contacting Dookan',
            text: `Hi ${name || ''},\n\nThanks for contacting Dookan. We received your message and will contact you soon.\n\n— Dookan Support`,
            html: `<p>Hi ${name || ''},</p><p>Thanks for contacting Dookan. We received your message and will contact you soon.</p><p>— Dookan Support</p>`
        }

        const info = await transporter.sendMail(mailOptions)
        console.info('📧 Acknowledgement email sent:', { messageId: info.messageId, to: toEmail })
        return { success: true, messageId: info.messageId }
    } catch (error: any) {
        console.error('❌ Failed to send acknowledgement email:', { message: error.message, code: error.code })
        return { success: false }
    }
}

export default { sendContactEmail, sendPasswordResetEmail, sendAcknowledgementEmail }

