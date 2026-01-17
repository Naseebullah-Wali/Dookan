import fetch from 'node-fetch'

const SECRET = process.env.RECAPTCHA_SECRET || ''
const MIN_SCORE = 0.45 // Acceptable score threshold for reCAPTCHA v3

export class RecaptchaService {
    /**
     * Verify a reCAPTCHA token with Google's API
     * Returns an object with success, score and action for further checks
     */
    static async verify(token: string, action?: string): Promise<{ success: boolean; score?: number; action?: string; error?: string }>{
        if (!SECRET) {
            // If secret not configured, treat verification as disabled (allow but log)
            console.warn('[reCAPTCHA] Secret not configured - skipping verification')
            return { success: true }
        }

        if (!token) {
            return { success: false, error: 'Missing recaptcha token' }
        }

        try {
            const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${encodeURIComponent(SECRET)}&response=${encodeURIComponent(token)}`
            })

            const data = await res.json()

            const success = !!data.success
            const score = data.score !== undefined ? parseFloat(data.score) : undefined
            const respAction = data.action

            if (!success) {
                return { success: false, error: (data['error-codes'] || []).join(', ') }
            }

            // If score is provided (v3), check threshold
            if (typeof score === 'number' && score < MIN_SCORE) {
                return { success: false, score, action: respAction, error: `Low score: ${score}` }
            }

            // Optionally verify action name matches
            if (action && respAction && action !== respAction) {
                return { success: false, score, action: respAction, error: `Action mismatch: expected ${action} got ${respAction}` }
            }

            return { success: true, score, action: respAction }
        } catch (err: any) {
            console.error('[reCAPTCHA] verification error:', err?.message || err)
            return { success: false, error: err?.message || 'verification failed' }
        }
    }
}

export default RecaptchaService
