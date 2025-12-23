import dotenv from 'dotenv'
dotenv.config()

export const recaptchaConfig = {
    secret: process.env.RECAPTCHA_SECRET || ''
}

export default recaptchaConfig
