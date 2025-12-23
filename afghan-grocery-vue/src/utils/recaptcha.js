// Lightweight reCAPTCHA v3 helper. Returns token or null if no site key configured.
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

function loadScript(timeoutMs = 8000) {
    if (!SITE_KEY) return Promise.resolve(null)
    if (window.grecaptcha) return Promise.resolve(window.grecaptcha)

    return new Promise((resolve, reject) => {
        const el = document.createElement('script')
        el.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
        el.async = true
        el.defer = true

        let settled = false
        const onResolve = () => {
            if (settled) return
            settled = true
            resolve(window.grecaptcha || null)
        }
        const onReject = (err) => {
            if (settled) return
            settled = true
            reject(err)
        }

        el.onload = onResolve
        el.onerror = () => onReject(new Error('Failed to load reCAPTCHA script'))
        document.head.appendChild(el)

        // timeout fallback
        setTimeout(() => {
            if (!settled) {
                settled = true
                // resolve null so caller can continue without blocking
                resolve(null)
            }
        }, timeoutMs)
    })
}

export async function getRecaptchaToken(action = 'submit') {
    if (!SITE_KEY) return null
    try {
        const grecaptcha = await loadScript()
        if (!grecaptcha) return null

        // grecaptcha.ready ensures the API is ready; some network blocks return a partial object
        if (typeof grecaptcha.ready === 'function') {
            return await new Promise((resolve) => {
                grecaptcha.ready(() => {
                    if (typeof grecaptcha.execute === 'function') {
                        grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(() => resolve(null))
                    } else {
                        resolve(null)
                    }
                })
            })
        }

        // last resort: try execute if present
        if (typeof grecaptcha.execute === 'function') {
            return await grecaptcha.execute(SITE_KEY, { action })
        }

        return null
    } catch (e) {
        console.error('reCAPTCHA error', e)
        return null
    }
}

export default { getRecaptchaToken }
