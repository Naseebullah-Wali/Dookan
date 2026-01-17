// Lightweight Google reCAPTCHA v3 helper
let scriptLoaded = false
let readyPromise = null

function loadScript(siteKey) {
    if (scriptLoaded) return Promise.resolve()
    if (readyPromise) return readyPromise

    readyPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
        script.async = true
        script.defer = true
        script.onload = () => {
            scriptLoaded = true
            resolve()
        }
        script.onerror = (e) => reject(e)
        document.head.appendChild(script)
    })

    return readyPromise
}

export async function getRecaptchaToken(action = 'contact') {
    try {
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
        if (!siteKey) return null

        await loadScript(siteKey)

        if (!window.grecaptcha) return null

        return await window.grecaptcha.execute(siteKey, { action })
    } catch (err) {
        console.warn('Failed to get recaptcha token:', err)
        return null
    }
}

export default { getRecaptchaToken }
