import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ps from './locales/ps.json'
import fa from './locales/fa.json'
import de from './locales/de.json'
import fr from './locales/fr.json'

const messages = {
    en,
    ps,
    fa,
    de,
    fr
}

// Get saved language or default to English
const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
    legacy: false, // Use Composition API mode
    locale: savedLocale,
    fallbackLocale: 'en',
    messages,
    globalInjection: true
})

export default i18n
