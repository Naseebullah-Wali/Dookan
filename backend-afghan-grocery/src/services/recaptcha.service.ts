import axios from 'axios'
import { recaptchaConfig } from '../config/recaptcha.config'

export class RecaptchaService {
    static async verify(token: string) {
        // If server doesn't have a recaptcha secret, skip verification (allow local/dev usage).
        if (!recaptchaConfig.secret) {
            console.warn('reCAPTCHA secret not configured on server — skipping verification')
            return true
        }

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaConfig.secret}&response=${token}`
        try {
            const resp = await axios.post(url)
            return resp.data.success === true
        } catch (e) {
            console.error('Recaptcha verify error', e)
            return false
        }
    }
}

export default RecaptchaService
