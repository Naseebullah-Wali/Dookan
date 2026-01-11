import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import i18n from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
    // Map country codes to languages
    const countryToLanguage = {
        'AF': 'ps', // Afghanistan -> Pashto
        'DE': 'de', // Germany -> German
        'AT': 'de', // Austria -> German
        'CH': 'de', // Switzerland -> German
        'FR': 'fr', // France -> French
        'BE': 'fr', // Belgium -> French
        'CA': 'fr', // Canada -> French (could be en too)
    }

    // Detect language from browser/location
    function detectDefaultLanguage() {
        // First check localStorage
        const savedLocale = localStorage.getItem('locale')
        if (savedLocale) {
            return savedLocale
        }

        // Try to detect from browser language
        const browserLang = navigator.language || navigator.userLanguage
        if (browserLang) {
            const langCode = browserLang.split('-')[0].toLowerCase()
            // Check if we support this language
            if (['en', 'ps', 'fa', 'de', 'fr'].includes(langCode)) {
                return langCode
            }
            // Check country code (e.g., de-DE, fr-FR)
            const countryCode = browserLang.split('-')[1]?.toUpperCase()
            if (countryCode && countryToLanguage[countryCode]) {
                return countryToLanguage[countryCode]
            }
        }

        // Try to detect from timezone (rough location detection)
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            if (timezone) {
                if (timezone.includes('Kabul')) return 'ps'
                if (timezone.includes('Berlin') || timezone.includes('Vienna') || timezone.includes('Zurich')) return 'de'
                if (timezone.includes('Paris')) return 'fr'
            }
        } catch (e) {
            // Ignore timezone detection errors
        }

        return 'en' // Default to English
    }

    const currentLocale = ref(detectDefaultLanguage())

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
        { code: 'ps', name: 'پښتو', flag: '🇦🇫', dir: 'rtl' },
        { code: 'fa', name: 'دری', flag: '🇦🇫', dir: 'rtl' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
        { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' }
    ]

    const currentLanguage = computed(() => {
        return languages.find(lang => lang.code === currentLocale.value) || languages[0]
    })

    const isRTL = computed(() => {
        return currentLanguage.value.dir === 'rtl'
    })

    function setLanguage(langCode) {
        currentLocale.value = langCode
        // Update i18n locale directly
        i18n.global.locale.value = langCode
        localStorage.setItem('locale', langCode)

        // Update document direction
        const lang = languages.find(l => l.code === langCode)
        if (lang) {
            document.documentElement.setAttribute('dir', lang.dir)
            document.documentElement.setAttribute('lang', langCode)
        }
    }

    // Get localized product/category name
    function getLocalizedName(item, field = 'name') {
        if (!item) return ''

        const fieldMap = {
            en: `${field}_en`,
            ps: `${field}_ps`,
            fa: `${field}_fa`,
            de: `${field}_de`,
            fr: `${field}_fr`
        }

        const localizedField = fieldMap[currentLocale.value]
        // Fallback to English if localized field doesn't exist
        return item[localizedField] || item[`${field}_en`] || item[field] || ''
    }

    // Initialize direction on store creation
    const initialLang = languages.find(l => l.code === currentLocale.value)
    if (initialLang) {
        document.documentElement.setAttribute('dir', initialLang.dir)
        document.documentElement.setAttribute('lang', currentLocale.value)
        // Set initial i18n locale
        i18n.global.locale.value = currentLocale.value
    }

    return {
        currentLocale,
        languages,
        currentLanguage,
        isRTL,
        setLanguage,
        getLocalizedName
    }
})
