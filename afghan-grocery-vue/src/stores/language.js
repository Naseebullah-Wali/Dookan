import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import i18n from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
    const currentLocale = ref(localStorage.getItem('locale') || 'en')

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
            en: field,
            ps: `${field}_ps`,
            fa: `${field}_fa`,
            de: `${field}_de`,
            fr: `${field}_fr`
        }

        const localizedField = fieldMap[currentLocale.value]
        return item[localizedField] || item[field] || ''
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
