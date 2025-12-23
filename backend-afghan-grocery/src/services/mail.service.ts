import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_SECURE = (process.env.SMTP_SECURE || 'false') === 'true'
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.VITE_SUPPORT_EMAIL || 'info@dookan.af'

const transporter = nodemailer.createTransport({
    host: SMTP_HOST || undefined,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
})

export async function sendContactEmail({ name, email, phone, subject, message }: { name?: string; email?: string; phone?: string; subject?: string; message?: string }) {
    const mailOptions = {
        from: `${name || 'Website Contact'} <${email || SUPPORT_EMAIL}>`,
        to: SUPPORT_EMAIL,
        subject: `[Contact] ${subject || 'New message from website'}`,
        text: `Name: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message || ''}`,
        html: `<p><strong>Name:</strong> ${name || 'N/A'}</p><p><strong>Email:</strong> ${email || 'N/A'}</p><p><strong>Phone:</strong> ${phone || 'N/A'}</p><hr/><p>${(message || '').replace(/\n/g, '<br/>')}</p>`
    }

    // If no SMTP configured, reject so controller can fallback
    if (!SMTP_HOST) {
        throw new Error('SMTP not configured')
    }

    const info = await transporter.sendMail(mailOptions)
    return info
}

export default { sendContactEmail }
