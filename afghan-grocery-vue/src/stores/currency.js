import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { settingsService } from '@/services/settingsService'

export const useCurrencyStore = defineStore('currency', () => {
    const currentCurrency = ref(localStorage.getItem('currency') || 'AFN')
    const rates = ref({
        AFN: 1,
        USD: 70,
        EUR: 75
    })
    const isLoading = ref(false)

    const currencies = [
        { code: 'AFN', symbol: 'AFN', name: 'Afghani' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' }
    ]

    const selectedCurrency = computed(() => {
        return currencies.find(c => c.code === currentCurrency.value) || currencies[0]
    })

    async function fetchRates() {
        isLoading.value = true
        try {
            const remoteRates = await settingsService.getSettings('exchange_rates')
            if (remoteRates) {
                rates.value = remoteRates
            }
        } catch (error) {
            console.error('Failed to fetch rates:', error)
        } finally {
            isLoading.value = false
        }
    }

    function setCurrency(code) {
        if (currencies.find(c => c.code === code)) {
            currentCurrency.value = code
            localStorage.setItem('currency', code)
        }
    }

    function convert(priceAFN) {
        const rate = rates.value[currentCurrency.value] || 1
        if (currentCurrency.value === 'AFN') return priceAFN
        return priceAFN / rate
    }

    function formatPrice(priceAFN) {
        const converted = convert(priceAFN)
        const currency = selectedCurrency.value

        if (currency.code === 'AFN') {
            return `${converted.toLocaleString()} ${currency.symbol}`
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.code
        }).format(converted)
    }

    async function detectLocation() {
        // Only detect if not manually set
        if (localStorage.getItem('currency')) return

        try {
            const response = await fetch('https://ipapi.co/json/')
            const data = await response.json()

            // Simple mapping
            if (['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT'].includes(data.country_code)) {
                setCurrency('EUR')
            } else if (['US', 'CA', 'GB'].includes(data.country_code)) {
                setCurrency('USD')
            } else if (data.country_code === 'AF') {
                setCurrency('AFN')
            }
        } catch (error) {
            console.error('Location detection failed:', error)
        }
    }

    // Initialize
    fetchRates()
    detectLocation()

    return {
        currentCurrency,
        rates,
        currencies,
        selectedCurrency,
        isLoading,
        fetchRates,
        setCurrency,
        convert,
        formatPrice
    }
})
